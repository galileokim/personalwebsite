import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';

type ProjectNotesProps = {
  name: string;
  notes: readonly string[];
};

export function ProjectNotes({ name, notes }: ProjectNotesProps) {
  const panelId = useId();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const targetHeightRef = useRef(0);
  const expandedRef = useRef(false);
  const [expanded, setExpanded] = useState(false);

  const settle = useCallback((open: boolean) => {
    const details = detailsRef.current;
    if (details) {
      details.open = open;
      delete details.dataset.animating;
    }
    if (panelRef.current) panelRef.current.inert = false;
    animationRef.current?.cancel();
    animationRef.current = null;
  }, []);

  const transition = useCallback(
    (open: boolean) => {
      const details = detailsRef.current;
      const panel = panelRef.current;
      const content = contentRef.current;
      if (!details || !panel || !content) return;

      const height = details.open ? panel.getBoundingClientRect().height : 0;
      animationRef.current?.cancel();

      if (
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        typeof panel.animate !== 'function'
      ) {
        settle(open);
        return;
      }

      // Keep native content rendered until the closing animation finishes.
      details.open = true;
      panel.inert = !open;
      details.dataset.animating = '';
      targetHeightRef.current = open
        ? content.getBoundingClientRect().height
        : 0;
      const animation = panel.animate(
        {
          height: [`${height}px`, `${targetHeightRef.current}px`],
        },
        {
          duration: open ? 260 : 180,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
      );
      animationRef.current = animation;
      animation.onfinish = () => {
        if (animationRef.current === animation) settle(open);
      };
    },
    [settle],
  );

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreferenceChange = () => {
      if (preference.matches) settle(expandedRef.current);
    };
    const observer = new ResizeObserver(() => {
      const height = contentRef.current?.getBoundingClientRect().height ?? 0;
      if (
        animationRef.current &&
        expandedRef.current &&
        Math.abs(height - targetHeightRef.current) > 0.5
      ) {
        transition(true);
      }
    });
    if (contentRef.current) observer.observe(contentRef.current);
    preference.addEventListener('change', onPreferenceChange);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', onPreferenceChange);
      animationRef.current?.cancel();
    };
  }, [settle, transition]);

  return (
    <details
      className="project-details"
      ref={detailsRef}
      data-expanded={expanded}
      onToggle={(event) => {
        if (!animationRef.current) {
          expandedRef.current = event.currentTarget.open;
          setExpanded(event.currentTarget.open);
        }
      }}
    >
      <summary
        role="button"
        aria-label={`${name} project notes`}
        aria-controls={panelId}
        aria-expanded={expanded}
        onClick={(event) => {
          event.preventDefault();
          expandedRef.current = !expandedRef.current;
          setExpanded(expandedRef.current);
          transition(expandedRef.current);
        }}
      >
        <span className="when-closed">Project notes</span>
        <span className="when-open">Close notes</span>
        <Icon name="plus" />
      </summary>
      <div
        className="project-notes-panel"
        id={panelId}
        ref={panelRef}
        aria-hidden={!expanded}
      >
        <div className="project-notes-content" ref={contentRef}>
          <ul className="project-notes">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
