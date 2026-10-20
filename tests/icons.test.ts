import {
  ArrowUp,
  ArrowUpRight,
  GitBranch,
  IdBadge,
  Mail,
  Plus,
} from '@keyline-icons/react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Icon } from '../src/components/Icon';

const mappings = [
  ['arrow', ArrowUpRight],
  ['up', ArrowUp],
  ['plus', Plus],
  ['mail', Mail],
  ['github', GitBranch],
  ['linkedin', IdBadge],
] as const;

describe('Keyline stroke icons', () => {
  it.each(mappings)('%s uses the official stroke component', (name, Glyph) => {
    const markup = renderToStaticMarkup(
      createElement(Icon, { name, className: 'test-icon' }),
    );
    const expected = renderToStaticMarkup(
      createElement(Glyph, {
        'aria-hidden': 'true',
        focusable: 'false',
        className: 'icon test-icon',
      }),
    );
    expect(markup).toBe(expected);
    expect(markup).toContain('fill="none"');
    expect(markup).toContain('stroke-width="2"');
    expect(markup).toContain('viewBox="0 0 24 24"');
  });
});
