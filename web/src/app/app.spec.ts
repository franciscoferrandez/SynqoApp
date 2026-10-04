import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { App } from './app';
import { routes } from './app.routes';

describe('vista previa de Synqo', () => {
  it('descarta los valores del formulario y muestra datos de ejemplo', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('#team-name') as HTMLInputElement;
    input.value = 'Equipo privado';
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/_preview/confirmacion');
    expect(fixture.nativeElement.textContent).toContain('Amigos del viernes');
    expect(fixture.nativeElement.textContent).not.toContain('Equipo privado');
    expect(fixture.nativeElement.textContent).toContain('no da acceso a un equipo');
  });

  it('mantiene la cabecera de equipo al cambiar de sección', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/_preview/equipo/calendario');
    fixture.detectChanges();
    await fixture.whenStable();

    const teamHeading = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(teamHeading.textContent).toContain('Amigos del viernes');
    await router.navigateByUrl('/_preview/equipo/consultas');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h1')).toBe(teamHeading);
    expect(fixture.nativeElement.querySelector('#section-title').textContent).toBe('Consultas');
  });
});
