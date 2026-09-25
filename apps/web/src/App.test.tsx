import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('muestra un estado de preparación claro', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Synqo se está preparando' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Synqo' })).toHaveAttribute('href', '#contenido');
  });
});
