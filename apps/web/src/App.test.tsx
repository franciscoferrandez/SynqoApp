import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('permite iniciar la creación de un equipo rápido', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Coordina sin cuentas' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Crear equipo rápido' })).toBeVisible();
    expect(screen.queryByLabelText('Zona horaria IANA')).not.toBeInTheDocument();
  });

  it('muestra la disponibilidad propia y diferencia sin respuesta', async () => {
    window.history.pushState({}, '', '/teams/equipo/availability/me');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ entries: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Mi disponibilidad' })).toBeVisible();
    expect(screen.getAllByRole('button', { name: /Disponible/ })).not.toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Semana anterior' })).toBeVisible();
    fireEvent.click(screen.getAllByRole('button', { name: /Disponible/ })[0]);
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' }),
      ),
    );
    fireEvent.click(screen.getAllByRole('button', { name: /Disponible/ })[0]);
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' }),
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Calendario' }));
    expect(await screen.findByLabelText('Calendario de mi disponibilidad')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Mes anterior' })).toBeVisible();
    const calendarDays = screen.getAllByRole('button', { name: /sin respuesta/ });
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    expect(calendarDays.length).toBeGreaterThan(daysInMonth);
    expect(calendarDays.length % 7).toBe(0);
    expect(calendarDays[0]).toHaveClass('calendar-adjacent');
    fireEvent.click(calendarDays[0]);
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Sin respuesta' })).not.toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Disponible/ }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' }),
      ),
    );
    fireEvent.click(screen.getAllByRole('button', { name: /editar disponibilidad/ })[0]);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Disponible/ }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' }),
      ),
    );
    vi.unstubAllGlobals();
    window.history.pushState({}, '', '/');
  });
});
