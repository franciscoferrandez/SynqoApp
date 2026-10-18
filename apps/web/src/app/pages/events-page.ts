import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import {
  TeamApi,
  TeamEvent,
  TeamEventGroups,
  TeamEventSummary,
  EventStatus,
} from '../shared/team-api';
import { TeamLayout } from './team-layout';

type EventGroupKey = keyof TeamEventGroups;
type LifecycleAction = 'reject' | 'recover';

@Component({
  template: `
    <section [attr.aria-labelledby]="selectedEventId ? null : 'events-heading'">
      @if (!selectedEventId) {
        <div class="section-heading">
          <div>
            <h2 id="events-heading">Eventos</h2>
            <p>Organiza los planes y consulta sus fechas.</p>
          </div>
          <button #createButton class="primary" type="button" (click)="openCreate()">
            + Crear evento
          </button>
        </div>
      }

      @if (loading) {
        <p role="status">Cargando eventos…</p>
      }
      @if (loadFailed) {
        <div class="panel" role="alert">
          <p>No se pudieron cargar los eventos.</p>
          <button class="outline" type="button" (click)="load()">Reintentar</button>
        </div>
      }

      @if (selectedEventId) {
        <div class="event-detail-view">
          <button class="consultation-back" type="button" data-event-back (click)="closeDetail()">
            ← Volver a Eventos
          </button>
          @if (detailLoading) {
            <p role="status">Cargando evento…</p>
          } @else if (detailFailed) {
            <div class="panel" role="alert">
              <p>No se pudo cargar el evento.</p>
              <button class="outline" type="button" (click)="loadDetail()">Reintentar</button>
            </div>
          } @else if (event; as item) {
            <article class="panel event-detail-card">
              <header class="consultation-detail-head">
                <div>
                  <p class="eyebrow">Detalle del evento</p>
                  <h2>{{ item.title }}</h2>
                  <p>{{ eventDate(item) }}</p>
                </div>
                <span
                  class="badge"
                  [class.open]="item.status === 'provisional'"
                  [class.resolved]="item.status === 'definitive'"
                  [class.rejected]="item.status === 'rejected'"
                >
                  {{ statusLabel(item.status) }}
                </span>
              </header>
              @if (item.notes) {
                <section class="event-notes" aria-labelledby="event-notes-heading">
                  <h3 id="event-notes-heading">Notas</h3>
                  <p>{{ item.notes }}</p>
                </section>
              }
              <dl class="event-metadata">
                <div>
                  <dt>Creado por</dt>
                  <dd>{{ item.createdBy.name }} · {{ dateTime(item.createdAt) }}</dd>
                </div>
                @if (item.lastModifiedAt && item.lastModifiedBy) {
                  <div>
                    <dt>Última modificación</dt>
                    <dd>{{ item.lastModifiedBy.name }} · {{ dateTime(item.lastModifiedAt) }}</dd>
                  </div>
                }
              </dl>
              @if (actionError) {
                <p class="event-error" role="alert">{{ actionError }}</p>
              }
              <div class="event-actions">
                @if (item.status !== 'rejected') {
                  <button class="outline" type="button" (click)="openEdit()">Editar evento</button>
                  <button
                    class="outline danger"
                    type="button"
                    [disabled]="actionPending"
                    (click)="askLifecycle('reject')"
                  >
                    Rechazar evento
                  </button>
                } @else {
                  <button
                    class="primary"
                    type="button"
                    [disabled]="actionPending"
                    (click)="askLifecycle('recover')"
                  >
                    Recuperar evento
                  </button>
                }
              </div>
            </article>
          }
        </div>
      } @else if (!loading && !loadFailed && groups) {
        @if (isEmpty) {
          <div class="panel consultations-empty">
            <span class="empty-symbol" aria-hidden="true">✦</span>
            <h3>Aún no hay eventos</h3>
            <p>Crea el primer evento del equipo para empezar a organizaros.</p>
            <button class="primary" type="button" (click)="openCreate()">+ Crear evento</button>
          </div>
        } @else {
          @for (group of groupDefinitions; track group.key) {
            @if (events(group.key).length) {
              <section class="list-section" [attr.aria-labelledby]="group.key + '-events-heading'">
                <h3 [id]="group.key + '-events-heading'">{{ group.label }}</h3>
                @for (item of events(group.key); track item.id) {
                  <button
                    class="consultation-card event-card"
                    type="button"
                    [attr.data-event-id]="item.id"
                    (click)="openDetail(item.id)"
                  >
                    <span class="consultation-card-content">
                      <strong>{{ item.title }}</strong>
                      <small>{{ eventDate(item) }}</small>
                    </span>
                    <span
                      class="badge"
                      [class.open]="item.status === 'provisional'"
                      [class.resolved]="item.status === 'definitive'"
                      [class.rejected]="item.status === 'rejected'"
                    >
                      {{ statusLabel(item.status) }}
                    </span>
                  </button>
                }
              </section>
            }
          }
        }
      }
      <p class="sr-only" role="status" aria-live="polite">{{ message }}</p>

      @if (showEditor) {
        <dialog
          #editorDialog
          class="consultation-dialog event-editor-dialog"
          aria-labelledby="event-editor-heading"
          (cancel)="requestCloseEditor($event)"
        >
          <div class="dialog-head">
            <div>
              <p class="eyebrow">{{ editingEventId ? 'Editar evento' : 'Nuevo evento' }}</p>
              <h2 id="event-editor-heading">
                {{ editingEventId ? 'Edita el evento' : 'Crea un evento' }}
              </h2>
            </div>
            <button
              class="dialog-close"
              type="button"
              aria-label="Cerrar formulario de evento"
              (click)="requestCloseEditor()"
            >
              ×
            </button>
          </div>
          <div class="event-editor-fields">
            <label for="event-title">Título</label>
            <input
              #titleInput
              id="event-title"
              class="text-query-input"
              type="text"
              maxlength="250"
              required
              [value]="title"
              [attr.aria-invalid]="titleInvalid ? true : null"
              (input)="title = $any($event.target).value; clearErrors()"
            />
            <label for="event-notes">Notas <span>(opcional)</span></label>
            <textarea
              id="event-notes"
              class="text-query-input"
              maxlength="5000"
              rows="5"
              [value]="notes"
              (input)="notes = $any($event.target).value; clearErrors()"
            ></textarea>
            <label for="event-date">Fecha <span>(opcional)</span></label>
            <input
              id="event-date"
              class="text-query-input"
              type="date"
              [value]="date"
              (input)="setDate($any($event.target).value)"
            />
            @if (!date) {
              <p class="event-form-help">Sin fecha, el evento siempre será provisional.</p>
            } @else {
              <label for="event-status">Estado de la fecha</label>
              <select
                id="event-status"
                class="text-query-input"
                [value]="status"
                (change)="status = $any($event.target).value"
              >
                <option value="provisional">Provisional</option>
                <option value="definitive">Definitiva</option>
              </select>
            }
            @if (formError) {
              <p class="event-error" role="alert">{{ formError }}</p>
            }
            <div class="text-query-actions">
              <button
                class="outline"
                type="button"
                [disabled]="submitting"
                (click)="requestCloseEditor()"
              >
                Cancelar
              </button>
              <button
                class="primary"
                type="button"
                [disabled]="!canSave || submitting"
                (click)="save()"
              >
                {{ submitting ? 'Guardando…' : 'Guardar evento' }}
              </button>
            </div>
          </div>
        </dialog>
      }

      @if (showDiscardConfirmation) {
        <dialog
          #discardDialog
          class="consultation-dialog consultation-confirmation"
          aria-labelledby="discard-event-heading"
          (cancel)="continueEditing($event)"
        >
          <p class="eyebrow">Cambios sin guardar</p>
          <h2 id="discard-event-heading">¿Descartar los cambios?</h2>
          <p>Se perderán los cambios que has hecho en este evento.</p>
          <div class="text-query-actions">
            <button #continueButton class="outline" type="button" (click)="continueEditing()">
              Seguir editando
            </button>
            <button class="primary danger" type="button" (click)="discardEditor()">
              Descartar cambios
            </button>
          </div>
        </dialog>
      }

      @if (showLifecycleConfirmation) {
        <dialog
          #lifecycleDialog
          class="consultation-dialog consultation-confirmation"
          aria-labelledby="event-lifecycle-heading"
          (cancel)="cancelLifecycle($event)"
        >
          <p class="eyebrow">Confirmación</p>
          <h2 id="event-lifecycle-heading">
            {{
              lifecycleAction === 'reject' ? '¿Rechazar este evento?' : '¿Recuperar este evento?'
            }}
          </h2>
          <p>
            {{
              lifecycleAction === 'reject'
                ? 'El evento se conservará en la agrupación Rechazados y no aparecerá en el calendario.'
                : 'El evento volverá a Provisional y conservará la fecha que tenía.'
            }}
          </p>
          @if (actionError) {
            <p class="event-error" role="alert">{{ actionError }}</p>
          }
          <div class="text-query-actions">
            <button
              class="outline"
              type="button"
              [disabled]="actionPending"
              (click)="cancelLifecycle()"
            >
              Cancelar
            </button>
            <button
              class="primary"
              [class.danger]="lifecycleAction === 'reject'"
              type="button"
              [disabled]="actionPending"
              (click)="confirmLifecycle()"
            >
              {{
                actionPending
                  ? 'Guardando…'
                  : lifecycleAction === 'reject'
                    ? 'Rechazar evento'
                    : 'Recuperar evento'
              }}
            </button>
          </div>
        </dialog>
      }
    </section>
  `,
})
export class EventsPage implements OnInit, OnDestroy {
  readonly team = inject(TeamLayout);
  private readonly api = inject(TeamApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @ViewChild('createButton') private createButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('titleInput') private titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('editorDialog')
  set editorDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) ref.nativeElement.showModal();
  }
  @ViewChild('discardDialog')
  set discardDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) ref.nativeElement.showModal();
  }
  @ViewChild('lifecycleDialog')
  set lifecycleDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) ref.nativeElement.showModal();
  }

  readonly groupDefinitions: { key: EventGroupKey; label: string }[] = [
    { key: 'unfinalized', label: 'Sin fecha definitiva' },
    { key: 'future', label: 'Futuros' },
    { key: 'past', label: 'Pasados' },
    { key: 'rejected', label: 'Rechazados' },
  ];
  groups?: TeamEventGroups;
  event?: TeamEvent;
  selectedEventId?: string;
  loading = true;
  detailLoading = false;
  loadFailed = false;
  detailFailed = false;
  showEditor = false;
  showDiscardConfirmation = false;
  showLifecycleConfirmation = false;
  editingEventId?: string;
  lifecycleAction: LifecycleAction = 'reject';
  title = '';
  notes = '';
  date = '';
  status: 'provisional' | 'definitive' = 'provisional';
  submitting = false;
  actionPending = false;
  formError = '';
  actionError = '';
  titleInvalid = false;
  message = '';
  private originalDraft = '';
  private focusReturnId?: string;
  private request?: Subscription;

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
  }

  get isEmpty(): boolean {
    return (
      !!this.groups && this.groupDefinitions.every((group) => this.events(group.key).length === 0)
    );
  }

  get canSave(): boolean {
    return this.title.trim().length > 0 && this.title.length <= 250 && this.notes.length <= 5000;
  }

  get isDirty(): boolean {
    return this.originalDraft !== this.draftValue();
  }

  load(): void {
    this.request?.unsubscribe();
    this.loading = true;
    this.loadFailed = false;
    this.request = this.api.events().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
        this.changeDetector.markForCheck();
        if (this.focusReturnId) {
          const id = this.focusReturnId;
          this.focusReturnId = undefined;
          setTimeout(() =>
            document
              .querySelector<HTMLButtonElement>(`[data-event-id="${CSS.escape(id)}"]`)
              ?.focus(),
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.loadFailed = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  events(group: EventGroupKey): TeamEventSummary[] {
    return this.groups?.[group] ?? [];
  }

  openDetail(id: string): void {
    this.selectedEventId = id;
    this.loadDetail();
  }

  loadDetail(): void {
    if (!this.selectedEventId) return;
    this.request?.unsubscribe();
    this.detailLoading = true;
    this.detailFailed = false;
    this.request = this.api.event(this.selectedEventId).subscribe({
      next: ({ event }) => {
        this.event = event;
        this.detailLoading = false;
        this.actionError = '';
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.detailLoading = false;
        this.detailFailed = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  closeDetail(): void {
    if (!this.selectedEventId) return;
    this.focusReturnId = this.selectedEventId;
    this.selectedEventId = undefined;
    this.event = undefined;
    this.load();
  }

  openCreate(): void {
    this.editingEventId = undefined;
    this.title = '';
    this.notes = '';
    this.date = '';
    this.status = 'provisional';
    this.originalDraft = this.draftValue();
    this.formError = '';
    this.titleInvalid = false;
    this.showEditor = true;
    this.changeDetector.markForCheck();
    setTimeout(() => this.titleInput?.nativeElement.focus());
  }

  openEdit(): void {
    if (!this.event || this.event.status === 'rejected') return;
    this.editingEventId = this.event.id;
    this.title = this.event.title;
    this.notes = this.event.notes ?? '';
    this.date = this.event.date ?? '';
    this.status = this.event.status === 'definitive' ? 'definitive' : 'provisional';
    this.originalDraft = this.draftValue();
    this.formError = '';
    this.titleInvalid = false;
    this.showEditor = true;
    this.changeDetector.markForCheck();
    setTimeout(() => this.titleInput?.nativeElement.focus());
  }

  setDate(value: string): void {
    this.date = value;
    if (!value) this.status = 'provisional';
  }

  save(): void {
    if (!this.canSave || this.submitting) {
      this.titleInvalid = !this.title.trim();
      if (this.titleInvalid) this.titleInput?.nativeElement.focus();
      return;
    }
    const participantId = this.team.participantId;
    if (!participantId) {
      this.formError = 'Elige una identidad del equipo antes de guardar el evento.';
      return;
    }
    const input = {
      participantId,
      title: this.title.trim(),
      notes: this.notes.trim() ? this.notes : null,
      date: this.date || null,
      status: this.date ? this.status : ('provisional' as const),
    };
    this.submitting = true;
    this.formError = '';
    const operation = this.editingEventId
      ? this.api.updateEvent(this.editingEventId, input)
      : this.api.createEvent(input);
    this.request = operation.subscribe({
      next: ({ event, expiresAt }) => {
        this.team.updateExpiry(expiresAt);
        this.submitting = false;
        this.showEditor = false;
        this.originalDraft = '';
        if (this.editingEventId) {
          this.event = event;
          this.message = 'Evento actualizado.';
          this.load();
        } else {
          this.selectedEventId = undefined;
          this.event = undefined;
          this.focusReturnId = event.id;
          this.message = 'Evento creado.';
          this.load();
        }
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        if (this.team.handleAccessError(error)) {
          this.showEditor = false;
          this.changeDetector.markForCheck();
          return;
        }
        this.applyFormError(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  requestCloseEditor(event?: Event): void {
    event?.preventDefault();
    if (this.submitting) return;
    if (this.isDirty) {
      this.showEditor = false;
      this.showDiscardConfirmation = true;
      this.changeDetector.markForCheck();
      return;
    }
    this.finishEditorClose();
  }

  continueEditing(event?: Event): void {
    event?.preventDefault();
    this.showDiscardConfirmation = false;
    this.showEditor = true;
    this.changeDetector.markForCheck();
    setTimeout(() => this.titleInput?.nativeElement.focus());
  }

  discardEditor(): void {
    this.showDiscardConfirmation = false;
    this.finishEditorClose();
  }

  askLifecycle(action: LifecycleAction): void {
    this.lifecycleAction = action;
    this.actionError = '';
    this.showLifecycleConfirmation = true;
    this.changeDetector.markForCheck();
  }

  cancelLifecycle(event?: Event): void {
    event?.preventDefault();
    if (this.actionPending) return;
    this.showLifecycleConfirmation = false;
    this.changeDetector.markForCheck();
  }

  confirmLifecycle(): void {
    if (!this.event || !this.team.participantId || this.actionPending) return;
    this.actionPending = true;
    this.actionError = '';
    const operation =
      this.lifecycleAction === 'reject'
        ? this.api.rejectEvent(this.event.id, this.team.participantId)
        : this.api.recoverEvent(this.event.id, this.team.participantId);
    this.request = operation.subscribe({
      next: ({ event, expiresAt }) => {
        this.event = event;
        this.team.updateExpiry(expiresAt);
        this.actionPending = false;
        this.showLifecycleConfirmation = false;
        this.message =
          this.lifecycleAction === 'reject' ? 'Evento rechazado.' : 'Evento recuperado.';
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.actionPending = false;
        if (this.team.handleAccessError(error)) {
          this.showLifecycleConfirmation = false;
          this.changeDetector.markForCheck();
          return;
        }
        this.actionError =
          error.status === 409
            ? 'El estado del evento ha cambiado. Actualiza la ficha e inténtalo de nuevo.'
            : 'No se pudo guardar el cambio. Inténtalo de nuevo.';
        this.changeDetector.markForCheck();
      },
    });
  }

  statusLabel(status: EventStatus): string {
    return status === 'definitive'
      ? 'Definitivo'
      : status === 'rejected'
        ? 'Rechazado'
        : 'Provisional';
  }

  eventDate(item: TeamEventSummary): string {
    if (!item.date) return 'Sin fecha';
    const date = new Date(`${item.date}T12:00:00`);
    const value = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    return item.status === 'definitive' ? value : `${value} · ${this.statusLabel(item.status)}`;
  }

  dateTime(value: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: this.team.team?.timeZone,
    }).format(new Date(value));
  }

  clearErrors(): void {
    this.formError = '';
    this.titleInvalid = false;
  }

  private finishEditorClose(): void {
    this.showEditor = false;
    this.showDiscardConfirmation = false;
    this.originalDraft = '';
    this.formError = '';
    this.changeDetector.markForCheck();
    if (this.selectedEventId)
      setTimeout(() => document.querySelector<HTMLButtonElement>('[data-event-back]')?.focus());
    else setTimeout(() => this.createButton?.nativeElement.focus());
  }

  private draftValue(): string {
    return JSON.stringify({
      title: this.title,
      notes: this.notes,
      date: this.date,
      status: this.status,
    });
  }

  private applyFormError(error: HttpErrorResponse): void {
    if (error.status === 422) {
      const fields = Array.isArray(error.error?.violations) ? error.error.violations : [];
      this.titleInvalid = fields.some(
        (item: { propertyPath?: string }) => item.propertyPath === 'title',
      );
      this.formError = this.titleInvalid
        ? 'El título es obligatorio y admite hasta 250 caracteres.'
        : 'Revisa la fecha, el estado o la longitud de las notas.';
      return;
    }
    this.formError =
      error.status === 409
        ? 'El evento ha cambiado o no admite esta acción. Recarga la ficha e inténtalo de nuevo.'
        : 'No se pudo guardar el evento. Conservamos tus cambios para que puedas reintentar.';
  }
}
