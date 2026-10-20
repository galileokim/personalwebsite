import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

type InkStatus = 'loading' | 'ready' | 'unavailable';

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

export function InkCanvas() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const finePointer = useMediaQuery('(pointer: fine)');
  const [status, setStatus] = useState<InkStatus>('loading');
  const active = !reducedMotion && finePointer && status !== 'unavailable';
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvas.current) return;
    const element = canvas.current;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    setStatus('loading');
    import('../ink/fluid')
      .then(({ createFluid }) => {
        if (cancelled) return;
        try {
          const engine = createFluid(element, () => {
            if (!cancelled) setStatus('unavailable');
          });
          dispose = engine.dispose;
          setStatus('ready');
        } catch {
          setStatus('unavailable');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [active]);

  return (
    <canvas
      ref={canvas}
      className="ink-canvas"
      aria-hidden="true"
      tabIndex={-1}
      data-state={active || status === 'unavailable' ? status : 'inactive'}
      hidden={!active || status !== 'ready'}
    />
  );
}
