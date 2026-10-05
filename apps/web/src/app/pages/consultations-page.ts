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
import { Consultation, ConsultationGroups, TeamApi } from '../shared/team-api';
import { TeamLayout } from './team-layout';
import { ConsultationDetailPage } from './consultation-detail';

type ConfirmationKind = 'create' | 'cancel';

@Component({
  imports: [ConsultationDetailPage],
  template: `
    <section [attr.aria-labelledby]="selectedConsultationId ? null : 'section-title'">
      @if (!selectedConsultationId) {
        <div class="section-heading">
          <div>
            <h2 id="section-title">Consultas</h2>
            <p>Vota o revisa las decisiones de este equipo.</p>
          </div>
          <button #headerCreateButton class="primary" type="button" (click)="openEditor()">
            + Crear consulta
          </button>
        </div>
      }
      @if (loading) {
        <p role="status">Cargando consultas…</p>
      }
      @if (loadFailed) {
        <div class="panel" role="alert">
          <p>No se pudieron cargar las consultas.</p>
          <button class="outline" type="button" (click)="load()">Reintentar</button>
        </div>
      }
      @if (selectedConsultationId) {
        <app-consultation-detail
          [consultationId]="selectedConsultationId"
          (back)="closeDetail()"
          (updated)="load()"
        />
      } @else if (!loading && !loadFailed && consultations) {
        @if (isEmpty) {
          <div class="panel consultations-empty">
            <span class="empty-symbol" aria-hidden="true">?</span>
            <h3>Aún no hay consultas</h3>
            <p>Crea una consulta para empezar a decidir en equipo.</p>
            <button class="primary" type="button" (click)="openEditor()">+ Crear consulta</button>
          </div>
        } @else {
          @for (state of states; track state.key) {
            @if (group(state.key).length) {
              <section class="list-section" [attr.aria-labelledby]="state.key + '-heading'">
                <h3 [id]="state.key + '-heading'">{{ state.label }}</h3>
                @for (consultation of group(state.key); track consultation.id) {
                  <button
                    class="consultation-card"
                    type="button"
                    [attr.data-consultation-id]="consultation.id"
                    (click)="openDetail(consultation.id)"
                  >
                    <span class="consultation-card-content">
                      <strong>{{ consultation.title }}</strong>
                      <small>{{ optionSummary(consultation) }}</small>
                      @if (consultation.resolution) {
                        <small>{{ resolutionSummary(consultation) }}</small>
                      }
                    </span>
                    <span
                      class="badge"
                      [class.open]="state.key === 'open'"
                      [class.resolved]="state.key === 'resolved'"
                      [class.rejected]="state.key === 'rejected'"
                    >
                      {{ state.labelSingular }}
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
          class="consultation-dialog"
          aria-labelledby="consultation-title-heading"
          (cancel)="cancelEditor($event)"
        >
          <div class="dialog-head">
            <div>
              <p class="eyebrow">Nueva consulta</p>
              <h2 id="consultation-title-heading">Plantea una pregunta</h2>
            </div>
            <button
              class="dialog-close"
              type="button"
              aria-label="Cancelar consulta"
              (click)="cancelEditor()"
            >
              ×
            </button>
          </div>
          <p class="text-query-help">
            Escribe un título y las opciones entre las que votará el equipo. Hasta 10 opciones.
          </p>
          <label class="text-query-field" for="consultation-title">Título breve</label>
          <input
            #titleInput
            id="consultation-title"
            class="text-query-input"
            type="text"
            maxlength="250"
            autocomplete="off"
            placeholder="Por ejemplo, ¿qué plan preferimos?"
            [value]="title"
            [attr.aria-invalid]="titleInvalid ? true : null"
            [attr.aria-describedby]="
              titleError ? 'consultation-title-error' : 'consultation-title-help'
            "
            (input)="title = $any($event.target).value; clearServerErrors()"
            (blur)="titleTouched = true"
          />
          @if (titleError) {
            <span id="consultation-title-error" class="field-error" role="alert">{{
              titleError
            }}</span>
          }
          <span class="sr-only" id="consultation-title-help">Hasta 250 caracteres.</span>
          <div class="text-query-field" id="consultation-options-heading">Opciones</div>
          <div class="text-options" aria-labelledby="consultation-options-heading">
            @for (option of options; track $index; let index = $index) {
              <div class="text-option-row">
                <div class="text-option-input-wrap">
                  <input
                    [id]="optionId(index)"
                    class="text-query-input"
                    type="text"
                    maxlength="50"
                    autocomplete="off"
                    [placeholder]="'Opción ' + (index + 1)"
                    [value]="option"
                    [attr.aria-label]="'Texto de la opción ' + (index + 1)"
                    [attr.aria-invalid]="optionInvalid(index) ? true : null"
                    [attr.aria-describedby]="
                      duplicateMessage
                        ? 'consultation-option-error'
                        : serverOptionError(index)
                          ? 'consultation-option-error-' + index
                          : null
                    "
                    (input)="setOption(index, $any($event.target).value)"
                    (blur)="touchOption(index)"
                  />
                  @if (serverOptionError(index); as error) {
                    <span
                      [id]="'consultation-option-error-' + index"
                      class="field-error"
                      role="alert"
                      >{{ error }}</span
                    >
                  }
                </div>
                <button
                  class="remove-option"
                  type="button"
                  [attr.aria-label]="'Eliminar opción ' + (index + 1)"
                  (click)="removeOption(index)"
                >
                  ×
                </button>
              </div>
            }
          </div>
          @if (duplicateMessage) {
            <p id="consultation-option-error" class="text-query-error" role="alert">
              {{ duplicateMessage }}
            </p>
          } @else if (hasTouchedBlankOption) {
            <p class="text-query-error" role="alert">
              Completa cada opción o elimina las filas vacías.
            </p>
          } @else if (options.length === 0) {
            <p class="text-query-error" role="alert">Añade al menos una opción.</p>
          } @else if (serverError) {
            <div class="text-query-error" role="alert">
              <p>{{ serverError }}</p>
              @if (retryable) {
                <button class="outline" type="button" (click)="retry()">Reintentar</button>
              }
            </div>
          }
          <button
            class="outline text-query-add"
            type="button"
            [disabled]="options.length >= maxOptions"
            (click)="addOption()"
          >
            + Añadir opción
          </button>
          <div class="text-query-actions">
            <button class="outline" type="button" (click)="cancelEditor()">Cancelar</button>
            <button
              class="primary"
              type="button"
              [disabled]="!canCreate || submitting"
              (click)="beginCreateConfirmation()"
            >
              Crear consulta
            </button>
          </div>
        </dialog>
      }

      @if (showConfirmation) {
        <dialog
          #confirmationDialog
          class="consultation-dialog consultation-confirmation"
          aria-labelledby="confirmation-heading"
          (cancel)="returnToEditor($event)"
        >
          <p class="eyebrow">Confirmación</p>
          <h2 id="confirmation-heading">{{ confirmationTitle }}</h2>
          <p>{{ confirmationSummary }}</p>
          <div class="text-query-actions">
            <button
              #confirmationBack
              class="outline"
              type="button"
              [attr.autofocus]="''"
              [disabled]="submitting"
              (click)="returnToEditor()"
            >
              {{ confirmationKind === 'cancel' ? 'Seguir editando' : 'Volver' }}
            </button>
            <button
              class="primary"
              [class.danger]="confirmationKind === 'cancel'"
              type="button"
              [disabled]="submitting"
              (click)="acceptConfirmation()"
            >
              @if (submitting) {
                Creando…
              } @else {
                {{ confirmationKind === 'cancel' ? 'Abandonar edición' : 'Confirmar creación' }}
              }
            </button>
          </div>
        </dialog>
      }
    </section>
  `,
})
export class ConsultationsPage implements OnInit, OnDestroy {
  readonly team = inject(TeamLayout);
  private readonly api = inject(TeamApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @ViewChild('headerCreateButton') private headerCreateButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('titleInput') private titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('editorDialog')
  set editorDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) ref.nativeElement.showModal();
  }
  @ViewChild('confirmationDialog')
  set confirmationDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) ref.nativeElement.showModal();
  }

  readonly maxOptions = 10;
  readonly states = [
    { key: 'open', label: 'Abiertas', labelSingular: 'Abierta' },
    { key: 'resolved', label: 'Resueltas', labelSingular: 'Resuelta' },
    { key: 'rejected', label: 'Rechazadas', labelSingular: 'Rechazada' },
  ] as const;
  consultations?: ConsultationGroups;
  selectedConsultationId?: string;
  private focusReturnId?: string;
  loading = true;
  loadFailed = false;
  showEditor = false;
  showConfirmation = false;
  confirmationKind: ConfirmationKind = 'create';
  title = '';
  options: string[] = [];
  showValidation = false;
  serverError = '';
  serverViolations: Record<string, string> = {};
  optionTouched = new Set<number>();
  titleTouched = false;
  retryable = false;
  submitting = false;
  message = '';
  private request?: Subscription;

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
  }

  get isEmpty(): boolean {
    return (
      !!this.consultations &&
      !this.consultations.open.length &&
      !this.consultations.resolved.length &&
      !this.consultations.rejected.length
    );
  }

  get hasTouchedBlankOption(): boolean {
    return this.options.some(
      (option, index) => this.optionTouched.has(index) && this.isBlank(option),
    );
  }

  get titleInvalid(): boolean {
    return !!this.titleError || ((this.showValidation || this.titleTouched) && !this.title.trim());
  }

  get titleError(): string {
    return (
      this.serverViolations['title'] ??
      ((this.showValidation || this.titleTouched) && !this.title.trim()
        ? 'Escribe un título para la consulta.'
        : '')
    );
  }

  get canCreate(): boolean {
    return (
      this.title.trim().length > 0 &&
      this.options.length >= 1 &&
      this.options.length <= this.maxOptions &&
      this.options.every((option) => option.trim().length > 0 && option.length <= 50) &&
      !this.duplicatePair
    );
  }

  get duplicatePair(): [number, number] | undefined {
    const seen = new Map<string, number>();
    for (const [index, option] of this.options.entries()) {
      if (this.isBlank(option)) continue;
      const normalized = this.normalize(option);
      const first = seen.get(normalized);
      if (first !== undefined) return [first, index];
      seen.set(normalized, index);
    }
    return undefined;
  }

  get duplicateMessage(): string {
    const duplicate = this.duplicatePair;
    return duplicate
      ? `La opción ${duplicate[1] + 1} repite la ${duplicate[0] + 1}. Cambia una para continuar.`
      : '';
  }

  get confirmationTitle(): string {
    return this.confirmationKind === 'create'
      ? '¿Crear esta consulta?'
      : '¿Cancelar esta consulta?';
  }

  get confirmationSummary(): string {
    return this.confirmationKind === 'create'
      ? `«${this.title.trim()}» tendrá ${this.options.length} opción(es). Confirma para publicarla en Consultas.`
      : 'Se descartarán el título y las opciones que has escrito. ¿Quieres continuar?';
  }

  load(): void {
    this.request?.unsubscribe();
    this.loading = true;
    this.loadFailed = false;
    this.request = this.api.consultations().subscribe({
      next: (consultations) => {
        this.consultations = consultations;
        this.loading = false;
        this.changeDetector.markForCheck();
        if (this.focusReturnId) {
          const id = this.focusReturnId;
          this.focusReturnId = undefined;
          setTimeout(() => {
            for (const card of document.querySelectorAll<HTMLButtonElement>('.consultation-card')) {
              if (card.dataset['consultationId'] === id) {
                card.focus();
                break;
              }
            }
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.loadFailed = !this.team.handleAccessError(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  group(state: keyof ConsultationGroups): Consultation[] {
    return this.consultations?.[state] ?? [];
  }

  optionSummary(consultation: Consultation): string {
    const count = consultation.options.length;
    return `${consultation.type === 'text' ? 'Consulta de opciones' : 'Consulta de fechas'} · ${count} ${count === 1 ? 'opción propuesta' : 'opciones propuestas'}`;
  }

  resolutionSummary(consultation: Consultation): string {
    if (!consultation.resolution) return '';
    if (consultation.state === 'rejected') {
      return `Rechazada por ${consultation.resolution.participant.name} · ninguna opción aceptada`;
    }
    const accepted = consultation.options
      .filter((option) => consultation.resolution?.acceptedOptionIds.includes(option.id))
      .map(
        (option) =>
          option.text ??
          new Intl.DateTimeFormat('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(new Date(`${option.date}T12:00:00`)),
      );
    return `Aceptadas: ${accepted.join(', ')} · por ${consultation.resolution.participant.name}`;
  }

  openDetail(id: string): void {
    this.selectedConsultationId = id;
  }

  closeDetail(): void {
    this.focusReturnId = this.selectedConsultationId;
    this.selectedConsultationId = undefined;
    this.load();
  }

  openEditor(): void {
    this.title = '';
    this.options = [''];
    this.showValidation = false;
    this.clearServerErrors();
    this.showConfirmation = false;
    this.showEditor = true;
    this.changeDetector.markForCheck();
    setTimeout(() => this.titleInput?.nativeElement.focus());
  }

  optionId(index: number): string {
    return `consultation-option-${index}`;
  }

  isBlank(value: string): boolean {
    return value.trim().length === 0;
  }

  optionInvalid(index: number): boolean {
    const duplicate = this.duplicatePair;
    return (
      !!this.serverOptionError(index) ||
      (!!duplicate && duplicate.includes(index)) ||
      ((this.showValidation || this.optionTouched.has(index)) &&
        this.isBlank(this.options[index] ?? ''))
    );
  }

  serverOptionError(index: number): string {
    return this.serverViolations[`options.${index}`] ?? '';
  }

  setOption(index: number, value: string): void {
    this.options[index] = value;
    this.clearServerErrors();
  }

  touchOption(index: number): void {
    this.optionTouched.add(index);
  }

  addOption(): void {
    if (this.options.length >= this.maxOptions) return;
    this.options = [...this.options, ''];
    this.changeDetector.markForCheck();
    setTimeout(() => document.getElementById(this.optionId(this.options.length - 1))?.focus());
  }

  removeOption(index: number): void {
    this.options = this.options.filter((_, itemIndex) => itemIndex !== index);
    this.optionTouched = new Set(
      [...this.optionTouched]
        .filter((itemIndex) => itemIndex !== index)
        .map((itemIndex) => (itemIndex > index ? itemIndex - 1 : itemIndex)),
    );
    this.clearServerErrors();
    this.changeDetector.markForCheck();
    setTimeout(() =>
      document.getElementById(this.optionId(Math.min(index, this.options.length - 1)))?.focus(),
    );
  }

  beginCreateConfirmation(): void {
    if (!this.canCreate) {
      this.showValidation = true;
      this.focusFirstInvalidField();
      return;
    }
    this.confirmationKind = 'create';
    this.showEditor = false;
    this.showConfirmation = true;
    this.changeDetector.markForCheck();
  }

  cancelEditor(event?: Event): void {
    event?.preventDefault();
    const hasContent =
      this.title.trim().length > 0 || this.options.some((option) => option.trim().length > 0);
    if (!hasContent) {
      this.discardDraft();
      return;
    }
    this.confirmationKind = 'cancel';
    this.showEditor = false;
    this.showConfirmation = true;
    this.changeDetector.markForCheck();
  }

  returnToEditor(event?: Event): void {
    event?.preventDefault();
    this.showConfirmation = false;
    this.showEditor = true;
    this.changeDetector.markForCheck();
    setTimeout(() => this.titleInput?.nativeElement.focus());
  }

  acceptConfirmation(): void {
    if (this.submitting) return;
    if (this.confirmationKind === 'cancel') {
      this.discardDraft();
      return;
    }
    const participantId = this.team.participantId;
    if (!participantId) {
      this.serverError = 'Elige una identidad del equipo para crear la consulta.';
      this.showConfirmation = false;
      this.showEditor = true;
      this.changeDetector.markForCheck();
      return;
    }
    this.submitting = true;
    this.request = this.api
      .createConsultation(participantId, this.title, [...this.options])
      .subscribe({
        next: ({ consultation, expiresAt }) => {
          if (this.consultations) {
            this.consultations = {
              ...this.consultations,
              open: [...this.consultations.open, consultation].sort((a, b) =>
                b.createdAt.localeCompare(a.createdAt),
              ),
            };
          }
          this.team.updateExpiry(expiresAt);
          this.submitting = false;
          this.showConfirmation = false;
          this.resetDraft();
          this.message = 'Consulta creada y añadida a Abiertas.';
          this.changeDetector.markForCheck();
          this.focusCreateButton();
        },
        error: (error: HttpErrorResponse) => {
          this.submitting = false;
          if (this.team.handleAccessError(error)) {
            this.showConfirmation = false;
            this.changeDetector.markForCheck();
            return;
          }
          this.showConfirmation = false;
          this.showEditor = true;
          this.applyServerError(error);
          this.changeDetector.markForCheck();
        },
      });
  }

  retry(): void {
    this.retryable = false;
    this.serverError = '';
    this.beginCreateConfirmation();
  }

  clearServerErrors(): void {
    this.serverError = '';
    this.serverViolations = {};
    this.retryable = false;
  }

  private applyServerError(error: HttpErrorResponse): void {
    if (error.status === 422) {
      const violations = error.error?.violations;
      if (Array.isArray(violations)) {
        for (const violation of violations) {
          if (typeof violation?.propertyPath === 'string') {
            this.serverViolations[violation.propertyPath] =
              typeof violation.message === 'string'
                ? violation.message
                : 'Este valor no es válido.';
          }
        }
      }
      this.serverError =
        typeof error.error?.detail === 'string'
          ? error.error.detail
          : 'Revisa el título y las opciones de texto.';
      this.showValidation = true;
      this.focusFirstInvalidField();
      return;
    }
    this.serverError =
      'No se pudo crear la consulta. Conservamos el borrador para que puedas reintentar.';
    this.retryable = true;
  }

  private focusFirstInvalidField(): void {
    setTimeout(() => {
      if (!this.title.trim()) {
        this.titleInput?.nativeElement.focus();
        return;
      }
      const index = this.options.findIndex(
        (option, optionIndex) => this.optionInvalid(optionIndex) || this.isBlank(option),
      );
      if (index >= 0) document.getElementById(this.optionId(index))?.focus();
    });
  }

  private discardDraft(): void {
    this.showConfirmation = false;
    this.showEditor = false;
    this.resetDraft();
    this.focusCreateButton();
  }

  private resetDraft(): void {
    this.title = '';
    this.options = [];
    this.showValidation = false;
    this.titleTouched = false;
    this.optionTouched.clear();
    this.clearServerErrors();
  }

  private focusCreateButton(): void {
    setTimeout(() => this.headerCreateButton?.nativeElement.focus());
  }

  private normalize(value: string): string {
    return value
      .trim()
      .normalize('NFD')
      .replace(/\p{M}+/gu, '')
      .toLowerCase();
  }
}
