import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('permite iniciar la creación de un equipo rápido', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Coordina sin cuentas' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Crear equipo rápido' })).toBeVisible();
    expect(screen.queryByLabelText('Zona horaria IANA')).not.toBeInTheDocument();
  });
});
