import {
  AddRegular,
  ArrowRightUpRegular,
  ArrowUpRegular,
  GithubRegular,
  LinkedinRegular,
  MailRegular,
} from '@mingcute/react/core-regular';

const icons = {
  arrow: ArrowRightUpRegular,
  up: ArrowUpRegular,
  plus: AddRegular,
  mail: MailRegular,
  github: GithubRegular,
  linkedin: LinkedinRegular,
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
