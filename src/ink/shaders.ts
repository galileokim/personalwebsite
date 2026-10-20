export const vertexShader = `#version 300 es
precision highp float;
out vec2 uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 uv;
out vec4 result;
uniform vec2 texel;
`;

export const shaders = {
  splat: `${fragment}
    uniform sampler2D source;
    uniform vec2 point;
    uniform vec2 previousPoint;
    uniform vec3 value;
    uniform float aspect;
    uniform float radius;
    void main() {
      vec2 offset = (uv - previousPoint) * vec2(aspect, 1.0);
      vec2 segment = (point - previousPoint) * vec2(aspect, 1.0);
      float along = clamp(dot(offset, segment) / max(dot(segment, segment), 0.000001), 0.0, 1.0);
      vec2 p = offset - along * segment;
      float brush = exp(-dot(p, p) / radius);
      result = vec4(texture(source, uv).xyz + brush * value, 1.0);
    }`,
  advect: `${fragment}
    uniform sampler2D source;
    uniform sampler2D velocity;
    uniform float dt;
    uniform float dissipation;
    void main() {
      vec2 previous = uv - dt * texture(velocity, uv).xy * texel;
      result = texture(source, previous) * exp(-dissipation * dt);
    }`,
  curl: `${fragment}
    uniform sampler2D velocity;
    void main() {
      float l = texture(velocity, uv - vec2(texel.x, 0.0)).y;
      float r = texture(velocity, uv + vec2(texel.x, 0.0)).y;
      float b = texture(velocity, uv - vec2(0.0, texel.y)).x;
      float t = texture(velocity, uv + vec2(0.0, texel.y)).x;
      result = vec4(0.5 * (r - l - t + b), 0.0, 0.0, 1.0);
    }`,
  swirl: `${fragment}
    uniform sampler2D velocity;
    uniform sampler2D curl;
    uniform float dt;
    void main() {
      float l = texture(curl, uv - vec2(texel.x, 0.0)).x;
      float r = texture(curl, uv + vec2(texel.x, 0.0)).x;
      float b = texture(curl, uv - vec2(0.0, texel.y)).x;
      float t = texture(curl, uv + vec2(0.0, texel.y)).x;
      float c = texture(curl, uv).x;
      vec2 force = 0.5 * vec2(abs(t) - abs(b), abs(r) - abs(l));
      force = force / (length(force) + 0.0001) * 3.0 * c;
      force.y *= -1.0;
      vec2 v = texture(velocity, uv).xy + force * dt;
      result = vec4(clamp(v, vec2(-600.0), vec2(600.0)), 0.0, 1.0);
    }`,
  divergence: `${fragment}
    uniform sampler2D velocity;
    void main() {
      vec2 c = texture(velocity, uv).xy;
      float l = uv.x < texel.x ? -c.x : texture(velocity, uv - vec2(texel.x, 0.0)).x;
      float r = uv.x > 1.0 - texel.x ? -c.x : texture(velocity, uv + vec2(texel.x, 0.0)).x;
      float b = uv.y < texel.y ? -c.y : texture(velocity, uv - vec2(0.0, texel.y)).y;
      float t = uv.y > 1.0 - texel.y ? -c.y : texture(velocity, uv + vec2(0.0, texel.y)).y;
      result = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
    }`,
  pressure: `${fragment}
    uniform sampler2D pressure;
    uniform sampler2D divergence;
    void main() {
      float l = texture(pressure, uv - vec2(texel.x, 0.0)).x;
      float r = texture(pressure, uv + vec2(texel.x, 0.0)).x;
      float b = texture(pressure, uv - vec2(0.0, texel.y)).x;
      float t = texture(pressure, uv + vec2(0.0, texel.y)).x;
      float d = texture(divergence, uv).x;
      result = vec4((l + r + b + t - d) * 0.25, 0.0, 0.0, 1.0);
    }`,
  project: `${fragment}
    uniform sampler2D velocity;
    uniform sampler2D pressure;
    void main() {
      float l = texture(pressure, uv - vec2(texel.x, 0.0)).x;
      float r = texture(pressure, uv + vec2(texel.x, 0.0)).x;
      float b = texture(pressure, uv - vec2(0.0, texel.y)).x;
      float t = texture(pressure, uv + vec2(0.0, texel.y)).x;
      result = vec4(texture(velocity, uv).xy - vec2(r - l, t - b), 0.0, 1.0);
    }`,
  display: `${fragment}
    uniform sampler2D ink;
    void main() {
      float density = max(texture(ink, uv).x, 0.0);
      float alpha = 0.14 * (1.0 - exp(-density * 0.9));
      result = vec4(vec3(0.20, 0.23, 0.28) * alpha, alpha);
    }`,
} as const;
