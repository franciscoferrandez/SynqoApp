import { Routes } from '@angular/router';
import { CreatePage } from './pages/create-page';
import { ConfirmationPage } from './pages/confirmation-page';
import { TeamLayout } from './pages/team-layout';
import { EmptySection } from './pages/empty-section';
import { LinkMessagePage } from './pages/link-message-page';

export const routes: Routes = [
  { path: '', component: CreatePage, title: 'Crear equipo · Synqo' },
  {
    path: '_preview/confirmacion',
    component: ConfirmationPage,
    title: 'Confirmación de ejemplo · Synqo',
  },
  {
    path: '_preview/equipo',
    component: TeamLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'calendario' },
      {
        path: 'calendario',
        component: EmptySection,
        data: { section: 'calendario' },
        title: 'Calendario de ejemplo · Synqo',
      },
      {
        path: 'consultas',
        component: EmptySection,
        data: { section: 'consultas' },
        title: 'Consultas de ejemplo · Synqo',
      },
    ],
  },
  {
    path: '_preview/caducado',
    component: LinkMessagePage,
    data: { kind: 'expired' },
    title: 'Equipo caducado · Synqo',
  },
  {
    path: '_preview/no-encontrado',
    component: LinkMessagePage,
    data: { kind: 'missing' },
    title: 'Equipo no encontrado · Synqo',
  },
  { path: '**', redirectTo: '_preview/no-encontrado' },
];
