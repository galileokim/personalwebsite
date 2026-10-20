import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Icon } from './Icon';

type InkStatus = 'loading' | 'ready' | 'unavailable';
const preferenceKey = 'galileo-ink-enabled';

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', notify);
      return () => media.removeEventListener('change', notify);
    },
    [query],
  );
  const snapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

export function useInkPreference() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const finePointer = useMediaQuery('(pointer: fine)');
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(preferenceKey) !== 'false';
    } catch {
      return true;
    }
  });
  const [status, setStatus] = useState<InkStatus>('loading');
  const reason = reducedMotion
    ? 'reduced'
    : !finePointer
      ? 'touch'
      : status === 'unavailable'
        ? 'unavailable'
        : null;

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(preferenceKey, String(next));
    } catch {
      /* The toggle still works when the browser disallows storage. */
    }
  }

  return {
    enabled,
    active: enabled && !reason,
    reason,
    status,
    setStatus,
    toggle,
  };
}

export function InkControl({
  ink,
}: {
  ink: ReturnType<typeof useInkPreference>;
}) {
  const label =
    ink.reason === 'reduced'
      ? 'Ink off · reduced motion'
      : ink.reason === 'touch'
        ? 'Ink off · touch device'
        : ink.reason === 'unavailable'
          ? 'Ink unavailable'
          : !ink.enabled
            ? 'Ink off'
            : ink.status === 'loading'
              ? 'Preparing ink…'
              : 'Ink on';
  const hint =
    ink.reason === 'reduced'
      ? 'Ink is off to respect your reduced-motion preference.'
      : ink.reason === 'touch'
        ? 'The ink effect is available with a mouse or pen. Touch scrolling stays uninterrupted.'
        : ink.reason === 'unavailable'
          ? 'Your browser could not start the ink effect. All website content is still available.'
          : ink.enabled
            ? 'Turn off the ink cursor trail'
            : 'Turn on the ink cursor trail';

  return (
    <button
      className="ink-control"
      type="button"
      aria-pressed={ink.active}
      aria-label={hint}
      title={hint}
      disabled={Boolean(ink.reason)}
      onClick={ink.toggle}
    >
      <Icon name="ink" />
      <span aria-live="polite">{label}</span>
    </button>
  );
}

export function InkCanvas({
  enabled,
  onStatus,
}: {
  enabled: boolean;
  onStatus: (status: InkStatus) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || !canvas.current) return;
    const element = canvas.current;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    onStatus('loading');
    import('../ink/fluid')
      .then(({ createFluid }) => {
        if (cancelled) return;
        try {
          const engine = createFluid(element, () => {
            if (!cancelled) onStatus('unavailable');
          });
          dispose = engine.dispose;
          onStatus('ready');
        } catch {
          onStatus('unavailable');
        }
      })
      .catch(() => {
        if (!cancelled) onStatus('unavailable');
      });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [enabled, onStatus]);

  return (
    <canvas
      ref={canvas}
      className="ink-canvas"
      aria-hidden="true"
      tabIndex={-1}
      hidden={!enabled}
    />
  );
}
