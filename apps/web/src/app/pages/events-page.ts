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
import { ActivatedRoute } from '@angular/router';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  TeamApi,
  TeamEvent,
  TeamEventGroups,
  TeamEventSummary,
  EventStatus,
} from '../shared/team-api';
import { TeamLayout } from './team-layout';
import { DetailAction, DetailActions } from '../shared/detail-actions';

type EventGroupKey = 'active' | 'archived';
type LifecycleAction = 'reject' | 'recover';

@Component({
  imports: [RouterLink, DetailActions],
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
              <header class="entity-detail-heading">
                <div class="detail-heading-top">
                  <p class="eyebrow">Detalle del evento</p>
                  <app-detail-actions
                    #detailActions
                    label="Acciones del evento"
                    panelId="event-detail-actions"
                    [actions]="detailActionItems"
                    [disabled]="actionPending || submitting"
                    (selected)="selectDetailAction($event)"
                  />
                </div>
                <div class="detail-heading-title">
                  <h2>{{ item.title }}</h2>
                  <span
                    class="badge"
                    [class.open]="item.status === 'provisional'"
                    [class.resolved]="item.status === 'definitive'"
                    [class.rejected]="item.status === 'rejected'"
                  >
                    {{ statusLabel(item.status) }}
                  </span>
                </div>
                <p>{{ eventDate(item) }}</p>
              </header>
              @if (item.notes) {
                <section class="event-notes" aria-labelledby="event-notes-heading">
                  <h3 id="event-notes-heading">Notas</h3>
                  <p>{{ item.notes }}</p>
                </section>
              }
              @if (item.consultations?.length) {
                <section class="event-notes" aria-labelledby="event-consultations-heading">
                  <h3 id="event-consultations-heading">Consultas vinculadas</h3>
                  <ul>
                    @for (consultation of item.consultations; track consultation.id) {
                      <li>
                        <a [routerLink]="['/e/consultas', consultation.id]" preserveFragment>{{
                          consultation.title
                        }}</a>
                        <small>{{
                          consultation.state === 'open'
                            ? 'Abierta'
                            : consultation.state === 'resolved'
                              ? 'Resuelta'
                              : 'Rechazada'
                        }}</small>
                      </li>
                    }
                  </ul>
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
            @if (events(group.key).length || (group.key === 'archived' && groups.archivedCursor)) {
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
                      <small>Vigencia: {{ effectiveDateLabel(item.effectiveDate) }}</small>
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
                @if (group.key === 'archived') {
                  @if (archiveError) {
                    <p role="alert">
                      No se pudieron cargar los eventos anteriores. Puedes reintentar.
                    </p>
                  }
                  @if (groups.archivedCursor) {
                    <button
                      class="outline"
                      type="button"
                      [disabled]="archiveLoading"
                      (click)="loadMore()"
                    >
                      {{
                        archiveLoading ? 'Cargando…' : archiveError ? 'Reintentar' : 'Cargar más'
                      }}
                    </button>
                  }
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
                ? 'El evento se conservará en Archivados y no aparecerá en el calendario.'
                : 'El evento volverá a Provisional y conservará la fecha que tenía.'
            }}
          </p>
          @if (lifecycleAction === 'reject' && hasOpenConsultation) {
            <label class="text-query-field" for="event-rejection-disposition"
              >Consulta abierta</label
            >
            <select
              id="event-rejection-disposition"
              class="text-query-input"
              [value]="rejectionDisposition"
              (change)="rejectionDisposition = $any($event.target).value"
            >
              <option value="unlink">Rechazar evento y desvincular consulta</option>
              <option value="reject_both">Rechazar evento y consulta</option>
            </select>
          }
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  @ViewChild('createButton') private createButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('titleInput') private titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('detailActions') private detailActions?: DetailActions;
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
    { key: 'active', label: 'Activos' },
    { key: 'archived', label: 'Archivados' },
  ];
  groups?: TeamEventGroups;
  event?: TeamEvent;
  selectedEventId?: string;
  loading = true;
  detailLoading = false;
  loadFailed = false;
  archiveLoading = false;
  archiveError = false;
  detailFailed = false;
  showEditor = false;
  showDiscardConfirmation = false;
  showLifecycleConfirmation = false;
  editingEventId?: string;
  lifecycleAction: LifecycleAction = 'reject';
  rejectionDisposition: 'unlink' | 'reject_both' = 'unlink';
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
  private listRequest?: Subscription;
  private archiveRequest?: Subscription;
  private listGeneration = 0;
  private routeInitialized = false;
  private routeRequest?: Subscription;

  ngOnInit(): void {
    this.routeRequest = this.route.paramMap.subscribe((params) => {
      const id = params.get('eventId') ?? undefined;
      if (this.routeInitialized && id === this.selectedEventId) return;
      this.routeInitialized = true;
      this.invalidateList();
      this.selectedEventId = id;
      this.event = undefined;
      if (this.selectedEventId) {
        this.loading = false;
        this.loadDetail();
      } else {
        this.load();
      }
    });
  }

  ngOnDestroy(): void {
    this.invalidateList();
    this.request?.unsubscribe();
    this.routeRequest?.unsubscribe();
  }

  get isEmpty(): boolean {
    return (
      !!this.groups &&
      !this.groups.active.length &&
      !this.groups.archived.length &&
      !this.groups.archivedCursor
    );
  }

  get detailActionItems(): DetailAction[] {
    return this.event?.status === 'rejected'
      ? [{ id: 'recover', label: 'Recuperar evento' }]
      : [
          { id: 'edit', label: 'Editar evento' },
          { id: 'reject', label: 'Rechazar evento', danger: true },
        ];
  }

  selectDetailAction(action: string): void {
    if (this.actionPending || this.submitting) return;
    if (action === 'edit') this.openEdit();
    else if (action === 'reject' || action === 'recover') this.askLifecycle(action);
  }

  get canSave(): boolean {
    return this.title.trim().length > 0 && this.title.length <= 250 && this.notes.length <= 5000;
  }

  get isDirty(): boolean {
    return this.originalDraft !== this.draftValue();
  }

  load(): void {
    this.invalidateList();
    const generation = this.listGeneration;
    this.groups = undefined;
    this.loading = true;
    this.loadFailed = false;
    this.listRequest = this.api.events().subscribe({
      next: (groups) => {
        if (generation !== this.listGeneration) return;
        this.groups = groups;
        this.loading = false;
        this.changeDetector.markForCheck();
        if (this.focusReturnId) {
          const id = this.focusReturnId;
          this.focusReturnId = undefined;
          setTimeout(() => {
            if (generation !== this.listGeneration || this.selectedEventId) return;
            for (const card of document.querySelectorAll<HTMLButtonElement>('[data-event-id]')) {
              if (card.dataset['eventId'] === id) {
                card.focus();
                return;
              }
            }
            this.createButton?.nativeElement.focus();
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        if (generation !== this.listGeneration) return;
        this.loading = false;
        this.loadFailed = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  loadMore(): void {
    const cursor = this.groups?.archivedCursor;
    if (!cursor || this.archiveLoading) return;
    const generation = this.listGeneration;
    this.archiveLoading = true;
    this.archiveError = false;
    this.archiveRequest = this.api.loadArchivedEvents(cursor).subscribe({
      next: (page) => {
        if (generation !== this.listGeneration || !this.groups) return;
        const ids = new Set(this.groups.archived.map((item) => item.id));
        const additions = page.archived.filter((item) => {
          if (ids.has(item.id)) return false;
          ids.add(item.id);
          return true;
        });
        this.groups = {
          ...this.groups,
          archived: [...this.groups.archived, ...additions],
          archivedCursor: page.archivedCursor,
          listContext: page.listContext,
        };
        this.archiveLoading = false;
        this.message = 'Historial de eventos actualizado.';
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        if (generation !== this.listGeneration) return;
        this.archiveLoading = false;
        if (
          error.status === 409 &&
          error.error?.type === 'urn:synqo:problem:list-context-changed'
        ) {
          this.load();
          return;
        }
        this.archiveError = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  private invalidateList(): void {
    this.listGeneration++;
    this.listRequest?.unsubscribe();
    this.archiveRequest?.unsubscribe();
    this.archiveLoading = false;
    this.archiveError = false;
  }

  events(group: EventGroupKey) {
    return this.groups?.[group] ?? [];
  }

  openDetail(id: string): void {
    this.invalidateList();
    this.selectedEventId = id;
    this.loadDetail();
  }

  loadDetail(): void {
    if (!this.selectedEventId) return;
    const id = this.selectedEventId;
    this.request?.unsubscribe();
    this.detailLoading = true;
    this.detailFailed = false;
    this.request = this.api.event(this.selectedEventId).subscribe({
      next: ({ event }) => {
        if (this.selectedEventId !== id) return;
        this.event = event;
        this.detailLoading = false;
        this.actionError = '';
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        if (this.selectedEventId !== id) return;
        this.detailLoading = false;
        this.detailFailed = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  closeDetail(): void {
    if (!this.selectedEventId) return;
    this.request?.unsubscribe();
    this.focusReturnId = this.selectedEventId;
    this.selectedEventId = undefined;
    this.event = undefined;
    this.load();
    void this.router.navigate(['/e/eventos'], { preserveFragment: true });
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
          setTimeout(() => this.detailActions?.focusTrigger());
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
    this.rejectionDisposition = 'unlink';
    this.showLifecycleConfirmation = true;
    this.changeDetector.markForCheck();
  }

  cancelLifecycle(event?: Event): void {
    event?.preventDefault();
    if (this.actionPending) return;
    this.showLifecycleConfirmation = false;
    this.changeDetector.markForCheck();
    setTimeout(() => this.detailActions?.focusTrigger());
  }

  confirmLifecycle(): void {
    if (!this.event || !this.team.participantId || this.actionPending) return;
    this.actionPending = true;
    this.actionError = '';
    const operation =
      this.lifecycleAction === 'reject'
        ? this.api.rejectEvent(
            this.event.id,
            this.team.participantId,
            this.hasOpenConsultation ? this.rejectionDisposition : undefined,
          )
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
        setTimeout(() => this.detailActions?.focusTrigger());
      },
      error: (error: HttpErrorResponse) => {
        this.actionPending = false;
        if (this.team.handleAccessError(error)) {
          this.showLifecycleConfirmation = false;
          this.changeDetector.markForCheck();
          return;
        }
        this.actionError =
          error.status === 409 || error.status === 422
            ? 'El estado del evento ha cambiado. Actualiza la ficha e inténtalo de nuevo.'
            : 'No se pudo guardar el cambio. Inténtalo de nuevo.';
        if ((error.status === 409 || error.status === 422) && this.event) {
          this.request = this.api.event(this.event.id).subscribe({
            next: ({ event }) => {
              this.event = event;
              this.actionError =
                'El estado ha cambiado. Revisa la ficha actualizada y vuelve a confirmar.';
              this.changeDetector.markForCheck();
            },
            error: (reloadError: HttpErrorResponse) => {
              this.team.handleAccessError(reloadError);
              this.changeDetector.markForCheck();
            },
          });
        }
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

  get hasOpenConsultation(): boolean {
    return (
      this.event?.consultations?.some((consultation) => consultation.state === 'open') ?? false
    );
  }

  eventDate(item: TeamEventSummary): string {
    if (!item.date) return 'Sin fecha';
    const date = new Date(`${item.date}T12:00:00Z`);
    const value = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
    return item.status === 'definitive' ? value : `${value} · ${this.statusLabel(item.status)}`;
  }

  effectiveDateLabel(date: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T12:00:00Z`));
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
    if (this.selectedEventId) setTimeout(() => this.detailActions?.focusTrigger());
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
