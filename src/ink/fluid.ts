import { frameDelta, pointerImpulse, simulationSize } from './math';
import { shaders, vertexShader } from './shaders';

type Target = {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;
};
type Pair = { read: Target; write: Target; swap: () => void };
type Program = {
  handle: WebGLProgram;
  uniforms: Map<string, WebGLUniformLocation | null>;
};
type Uniform = number | [number, number] | [number, number, number];
type Splat = {
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  dx: number;
  dy: number;
};

export function createFluid(canvas: HTMLCanvasElement, onFailure: () => void) {
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
  });
  if (!context) throw new Error('WebGL 2 is unavailable');
  const gl = context;
  const targets = new Set<Target>();
  const programs: Program[] = [];
  let frame = 0;
  let disposed = false;
  let velocity: Pair;
  let ink: Pair;
  let pressure: Pair;
  let curl: Target;
  let divergence: Target;
  let previous = 0;
  let lastInput = 0;
  let lastPointer: { x: number; y: number; time: number } | null = null;
  let splats: Splat[] = [];
  let resizePending = false;

  function clear(target: Target | null) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target?.framebuffer ?? null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function releaseTargets() {
    for (const target of targets) {
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.framebuffer);
    }
    targets.clear();
  }

  function compile(type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Cannot allocate shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message ?? 'Cannot compile fluid shader');
    }
    return shader;
  }

  function program(source: string): Program {
    const handle = gl.createProgram();
    if (!handle) throw new Error('Cannot allocate shader program');
    const item = {
      handle,
      uniforms: new Map<string, WebGLUniformLocation | null>(),
    };
    programs.push(item);
    const compiled: WebGLShader[] = [];
    try {
      compiled.push(compile(gl.VERTEX_SHADER, vertexShader));
      compiled.push(compile(gl.FRAGMENT_SHADER, source));
      for (const shader of compiled) gl.attachShader(handle, shader);
      gl.linkProgram(handle);
      if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
        throw new Error(
          gl.getProgramInfoLog(handle) ?? 'Cannot link fluid shader',
        );
      }
    } finally {
      for (const shader of compiled) gl.deleteShader(shader);
    }
    return item;
  }

  function target(width: number, height: number): Target {
    const texture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    if (!texture || !framebuffer) {
      gl.deleteTexture(texture);
      gl.deleteFramebuffer(framebuffer);
      throw new Error('Cannot allocate fluid buffer');
    }
    const item = { texture, framebuffer, width, height };
    targets.add(item);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA16F,
      width,
      height,
      0,
      gl.RGBA,
      gl.HALF_FLOAT,
      null,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('Floating-point rendering is unavailable');
    }
    clear(item);
    return item;
  }

  function pair(width: number, height: number): Pair {
    const item = {
      read: target(width, height),
      write: target(width, height),
      swap() {
        [item.read, item.write] = [item.write, item.read];
      },
    };
    return item;
  }

  function uniform(shader: Program, name: string) {
    if (!shader.uniforms.has(name))
      shader.uniforms.set(name, gl.getUniformLocation(shader.handle, name));
    return shader.uniforms.get(name) ?? null;
  }

  function draw(
    shader: Program,
    output: Target | null,
    textures: Record<string, Target>,
    values: Record<string, Uniform> = {},
  ) {
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram is not a React hook.
    gl.useProgram(shader.handle);
    let unit = 0;
    for (const [name, input] of Object.entries(textures)) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, input.texture);
      gl.uniform1i(uniform(shader, name), unit++);
    }
    gl.uniform2f(
      uniform(shader, 'texel'),
      1 / velocity.read.width,
      1 / velocity.read.height,
    );
    for (const [name, value] of Object.entries(values)) {
      const location = uniform(shader, name);
      if (typeof value === 'number') gl.uniform1f(location, value);
      else if (value.length === 2) gl.uniform2f(location, ...value);
      else gl.uniform3f(location, ...value);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, output?.framebuffer ?? null);
    gl.viewport(
      0,
      0,
      output?.width ?? canvas.width,
      output?.height ?? canvas.height,
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function resize() {
    releaseTargets();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      1.5,
      1800 / Math.max(width, height),
    );
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    const simulation = simulationSize(width, height, 160);
    const dye = simulationSize(width, height, 1024);
    velocity = pair(simulation.width, simulation.height);
    pressure = pair(simulation.width, simulation.height);
    curl = target(simulation.width, simulation.height);
    divergence = target(simulation.width, simulation.height);
    ink = pair(dye.width, dye.height);
    lastPointer = null;
    splats = [];
    clear(null);
    resizePending = false;
  }

  function schedule() {
    if (!frame && !disposed && !document.hidden) {
      previous = performance.now();
      frame = requestAnimationFrame(update);
    }
  }

  function onPointer(event: PointerEvent) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const now = performance.now();
    const x = event.clientX;
    const y = event.clientY;
    if (lastPointer && now - lastPointer.time < 160 && !resizePending) {
      splats.push({
        x: x / window.innerWidth,
        y: 1 - y / window.innerHeight,
        fromX: lastPointer.x / window.innerWidth,
        fromY: 1 - lastPointer.y / window.innerHeight,
        dx: pointerImpulse(x - lastPointer.x),
        dy: pointerImpulse(lastPointer.y - y),
      });
      // Keep the newest input when a busy tab delivers coalesced pointer events.
      if (splats.length > 8) splats.shift();
      lastInput = now;
      schedule();
    }
    lastPointer = { x, y, time: now };
  }

  function onResize() {
    resizePending = true;
    schedule();
  }
  function onLeave() {
    lastPointer = null;
  }
  function onVisibility() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastPointer = null;
    splats = [];
    for (const item of targets) clear(item);
    clear(null);
  }
  function onContextLost(event: Event) {
    event.preventDefault();
    dispose();
    onFailure();
  }

  let passes: Record<keyof typeof shaders, Program>;

  function update(now: number) {
    frame = 0;
    if (disposed || document.hidden) return;
    try {
      if (resizePending) resize();
      const dt = frameDelta(now, previous);
      previous = now;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;
      const input = splats;
      splats = [];
      for (const splat of input) {
        const dx = (splat.x - splat.fromX) * width;
        const dy = (splat.y - splat.fromY) * height;
        const length = Math.hypot(dx, dy);
        if (length < 0.001) continue;
        const offsetX = ((dx / length) * 26) / width;
        const offsetY = ((dy / length) * 26) / height;
        draw(
          passes.splat,
          velocity.write,
          { source: velocity.read },
          {
            point: [splat.x - offsetX, splat.y - offsetY],
            previousPoint: [splat.fromX - offsetX, splat.fromY - offsetY],
            aspect,
            radius: (8 / height) ** 2,
            value: [-splat.dx * 0.35, -splat.dy * 0.35, 0],
          },
        );
        velocity.swap();
      }
      draw(passes.curl, curl, { velocity: velocity.read });
      draw(
        passes.swirl,
        velocity.write,
        { velocity: velocity.read, curl },
        { dt },
      );
      velocity.swap();
      draw(passes.divergence, divergence, { velocity: velocity.read });
      clear(pressure.read);
      for (let i = 0; i < 16; i++) {
        draw(passes.pressure, pressure.write, {
          pressure: pressure.read,
          divergence,
        });
        pressure.swap();
      }
      draw(passes.project, velocity.write, {
        velocity: velocity.read,
        pressure: pressure.read,
      });
      velocity.swap();
      draw(
        passes.advect,
        velocity.write,
        { source: velocity.read, velocity: velocity.read },
        { dt, dissipation: 2.2 },
      );
      velocity.swap();
      // Fresh ink stays at the nib; pointer momentum stirs only the trailing wake.
      if (lastPointer) {
        draw(
          passes.protectTip,
          velocity.write,
          { velocity: velocity.read },
          {
            point: [lastPointer.x / width, 1 - lastPointer.y / height],
            viewport: [width, height],
          },
        );
        velocity.swap();
      }
      draw(
        passes.advect,
        ink.write,
        { source: ink.read, velocity: velocity.read },
        { dt, dissipation: 0.45 },
      );
      ink.swap();
      for (const splat of input) {
        draw(
          passes.paint,
          ink.write,
          { source: ink.read },
          {
            point: [splat.x, splat.y],
            previousPoint: [splat.fromX, splat.fromY],
            viewport: [width, height],
            amount: 1.25,
          },
        );
        ink.swap();
      }
      draw(passes.display, null, { ink: ink.read });
      if (now - lastInput < 6500) {
        frame = requestAnimationFrame(update);
      } else {
        for (const item of targets) clear(item);
        clear(null);
      }
    } catch {
      dispose();
      onFailure();
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('resize', onResize);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    clear(null);
    releaseTargets();
    for (const item of programs) gl.deleteProgram(item.handle);
  }

  try {
    if (!gl.getExtension('EXT_color_buffer_float'))
      throw new Error('Floating-point textures are unavailable');
    gl.disable(gl.BLEND);
    passes = Object.fromEntries(
      Object.entries(shaders).map(([key, source]) => [key, program(source)]),
    ) as Record<keyof typeof shaders, Program>;
    resize();
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onContextLost);
    return { dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
