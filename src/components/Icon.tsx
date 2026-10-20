type IconName = 'arrow' | 'plus' | 'mail' | 'github' | 'linkedin' | 'ink';

const paths: Record<IconName, string> = {
  arrow: 'M6 18 18 6M6 6h12v12',
  plus: 'M12 5v14M5 12h14',
  mail: 'M3 6h18v12H3z M3 6l9 7 9-7',
  github:
    'M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.4c0-1 .1-1.5-.5-2.1 3.5-.4 7.2-1.7 7.2-7.7A6 6 0 0 0 20 4.6 5.5 5.5 0 0 0 19.8.4S18.5 0 15.4 2a15 15 0 0 0-8 0C4.3 0 3 .4 3 .4a5.5 5.5 0 0 0-.2 4.2A6 6 0 0 0 1.2 9c0 6 3.7 7.3 7.2 7.7-.6.6-.6 1.2-.5 2.1V22',
  linkedin: 'M4 9v11M4 4v.1M10 20V9h5v2c3-4 6-1 6 2v7M10 9v11',
  ink: 'M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12Z M8 15a4 4 0 0 0 4 4',
};

export function Icon({
  name,
  className = '',
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
