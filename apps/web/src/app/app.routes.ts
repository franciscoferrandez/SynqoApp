import { Routes } from '@angular/router';
import { CreatePage } from './pages/create-page';
import { ConfirmationPage } from './pages/confirmation-page';
import { TeamLayout } from './pages/team-layout';
import { EmptySection } from './pages/empty-section';
import { LinkMessagePage } from './pages/link-message-page';

export const routes: Routes = [
  { path: '', component: CreatePage, title: 'Crear equipo · Synqo' },
  { path: 'confirmacion', component: ConfirmationPage, title: 'Equipo creado · Synqo' },
  {
    path: 'e',
    component: TeamLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'calendario' },
      {
        path: 'calendario',
        component: EmptySection,
        data: { section: 'calendario' },
        title: 'Calendario · Synqo',
      },
      {
        path: 'consultas',
        component: EmptySection,
        data: { section: 'consultas' },
        title: 'Consultas · Synqo',
      },
    ],
  },
  {
    path: 'caducado',
    component: LinkMessagePage,
    data: { kind: 'expired' },
    title: 'Equipo caducado · Synqo',
  },
  {
    path: 'no-encontrado',
    component: LinkMessagePage,
    data: { kind: 'missing' },
    title: 'Equipo no encontrado · Synqo',
  },
  { path: '**', redirectTo: 'no-encontrado' },
];
