import {
  ArrowUp,
  ArrowUpRight,
  GitBranch,
  IdBadge,
  Mail,
  Plus,
} from '@keyline-icons/react';

const icons = {
  arrow: ArrowUpRight,
  up: ArrowUp,
  plus: Plus,
  mail: Mail,
  github: GitBranch,
  linkedin: IdBadge,
} as const;

export function Icon({
  name,
  className = '',
}: {
  name: keyof typeof icons;
  className?: string;
}) {
  const Glyph = icons[name];
  return (
    <Glyph
      aria-hidden="true"
      focusable="false"
      className={`icon ${className}`}
    />
  );
}
