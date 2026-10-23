import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ConsultationDetail,
  ConsultationEdit,
  ConsultationRemovalWithVotes,
  TeamApi,
} from '../shared/team-api';
import { TeamLayout } from './team-layout';

interface DraftOption {
  id: string;
  text: string;
  originalText?: string;
  count: number;
  removed: boolean;
  currentText?: string;
}
type Removal = Extract<ConsultationRemovalWithVotes, { text: string }>;

@Component({
  selector: 'app-consultation-text-editor',
  template: `
    @if (stage === 'edit') {
      <dialog
        #editorDialog
        class="consultation-dialog consultation-text-editor"
        aria-labelledby="edit-consultation-heading"
        (cancel)="requestClose($event)"
      >
        <div class="dialog-head">
          <h2 id="edit-consultation-heading">Editar consulta</h2>
          <button
            class="dialog-close"
            type="button"
            aria-label="Cerrar edición de consulta"
            [disabled]="pending"
            (click)="requestClose()"
          >
            ×
          </button>
        </div>
        @if (loading) {
          <p role="status">Cargando consulta para editar…</p>
        } @else if (loadFailed) {
          <p role="alert">No se pudo cargar la consulta para editar.</p>
          <button class="outline" type="button" (click)="load()">Reintentar</button>
        } @else {
          <fieldset class="consultation-edit-fields" [disabled]="pending || !editable">
            <label for="edit-consultation-title">Título breve</label>
            <input
              #titleInput
              id="edit-consultation-title"
              class="text-query-input"
              maxlength="250"
              [value]="title"
              [attr.aria-invalid]="titleInvalid || !!fieldErrors['title'] ? true : null"
              aria-describedby="edit-title-error"
              (input)="title = $any($event.target).value; clearErrors()"
            />
            <p id="edit-title-error" class="field-error">
              {{
                fieldErrors['title'] ||
                  (titleInvalid ? 'Escribe un título de hasta 250 caracteres.' : '')
              }}
            </p>
            <h3>Opciones · hasta 10</h3>
            @for (option of options; track option.id; let index = $index) {
              <div
                class="consultation-edit-option"
                [class.removed]="option.removed"
                [attr.data-option-id]="option.id"
              >
                <label [for]="'edit-option-' + option.id">Opción {{ index + 1 }}</label>
                <input
                  class="text-query-input"
                  [id]="'edit-option-' + option.id"
                  maxlength="50"
                  [value]="option.text"
                  [readOnly]="option.count > 0 || option.removed"
                  [attr.aria-describedby]="'edit-option-help-' + option.id"
                  [attr.aria-invalid]="optionError(option) ? true : null"
                  (input)="option.text = $any($event.target).value; clearErrors()"
                />
                <div [id]="'edit-option-help-' + option.id">
                  @if (option.removed) {
                    <p>Marcada para retirar.</p>
                  }
                  @if (option.count > 0) {
                    <p>Tiene {{ option.count }} votos; su texto no puede modificarse.</p>
                  }
                  @if (optionError(option)) {
                    <p class="field-error">{{ optionError(option) }}</p>
                  }
                </div>
                @if (
                  option.currentText !== undefined &&
                  option.text !== option.currentText &&
                  !option.removed
                ) {
                  <button
                    type="button"
                    class="outline"
                    [attr.aria-label]="'Recuperar texto actual de opción ' + (index + 1)"
                    (click)="recoverText(option)"
                  >
                    Recuperar texto actual
                  </button>
                }
                <button
                  type="button"
                  class="outline"
                  [attr.aria-label]="
                    option.removed
                      ? 'Deshacer retirada de opción ' + (index + 1)
                      : 'Eliminar opción ' + (index + 1)
                  "
                  (click)="toggleRemoval(option)"
                >
                  {{ option.removed ? 'Deshacer' : 'Eliminar' }}
                </button>
              </div>
            }
            <button
              class="outline"
              type="button"
              [disabled]="activeOptions.length >= 10"
              (click)="addOption()"
            >
              + Añadir opción
            </button>
            @if (validationShown && (activeOptions.length < 1 || activeOptions.length > 10)) {
              <p class="field-error">La consulta debe tener entre una y diez opciones.</p>
            }
          </fieldset>
        }
        @if (error) {
          <p class="field-error" role="alert">{{ error }}</p>
        }
        @if (needsReload) {
          <button class="outline" type="button" [disabled]="pending" (click)="requestReload()">
            Recargar ficha
          </button>
        }
        <div class="text-query-actions">
          <button class="outline" type="button" [disabled]="pending" (click)="requestClose()">
            Cancelar
          </button>
          <button
            class="primary"
            type="button"
            [disabled]="loading || loadFailed || pending || !editable"
            (click)="save()"
          >
            {{ pending ? 'Guardando…' : 'Guardar consulta' }}
          </button>
        </div>
      </dialog>
    } @else if (stage === 'discard') {
      <dialog
        #discardDialog
        class="consultation-dialog consultation-confirmation"
        aria-labelledby="discard-consultation-heading"
        (cancel)="continueEditing($event)"
      >
        <h2 id="discard-consultation-heading">¿Descartar los cambios?</h2>
        <p>Se perderán los cambios del borrador de la consulta.</p>
        <div class="text-query-actions">
          <button #continueButton class="outline" type="button" (click)="continueEditing()">
            Seguir editando
          </button>
          <button class="primary danger" type="button" (click)="closed.emit(reloadAfterDiscard)">
            Descartar cambios
          </button>
        </div>
      </dialog>
    } @else {
      <dialog
        #removalDialog
        class="consultation-dialog consultation-confirmation"
        aria-labelledby="remove-consultation-options-heading"
        (cancel)="backToEdit($event)"
      >
        <h2 id="remove-consultation-options-heading">Eliminar opciones y sus votos</h2>
        <ul>
          @for (option of pendingRemovals; track option.id) {
            <li>{{ option.text }} · {{ option.count }} votos</li>
          }
        </ul>
        <p>Se eliminarán estas opciones y todos sus votos. Las demás selecciones se conservan.</p>
        <div class="text-query-actions">
          <button class="outline" type="button" (click)="backToEdit()">Volver a editar</button>
          <button class="primary danger" type="button" (click)="confirmRemoval()">
            Eliminar opciones y guardar
          </button>
        </div>
      </dialog>
    }
  `,
})
export class ConsultationTextEditor implements OnInit, OnDestroy {
  @Input({ required: true }) consultationId!: string;
  @Output() readonly saved = new EventEmitter<{
    consultation: ConsultationDetail;
    expiresAt: string;
  }>();
  @Output() readonly closed = new EventEmitter<boolean>();
  @ViewChild('titleInput') private titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('editorDialog') set editorDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) ref.nativeElement.showModal();
  }
  @ViewChild('discardDialog') set discardDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) {
      ref.nativeElement.showModal();
      setTimeout(() => ref.nativeElement.querySelector<HTMLButtonElement>('button')?.focus());
    }
  }
  @ViewChild('removalDialog') set removalDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref && !ref.nativeElement.open) ref.nativeElement.showModal();
  }
  private readonly api = inject(TeamApi);
  readonly team = inject(TeamLayout);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly subscriptions = new Subscription();
  stage: 'edit' | 'discard' | 'removal' = 'edit';
  title = '';
  options: DraftOption[] = [];
  loading = true;
  loadFailed = false;
  pending = false;
  editable = true;
  error = '';
  needsReload = false;
  fieldErrors: Record<string, string> = {};
  validationShown = false;
  pendingRemovals: Removal[] = [];
  reloadAfterDiscard = false;
  private originalTitle = '';
  private originalDraft = '';
  private readonly confirmedRemovalIds = new Set<string>();

  ngOnInit(): void {
    this.load();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get activeOptions(): DraftOption[] {
    return this.options.filter((option) => !option.removed);
  }
  get titleInvalid(): boolean {
    return this.validationShown && (!this.title.trim() || this.title.length > 250);
  }
  get dirty(): boolean {
    return !!this.originalDraft && this.draftValue() !== this.originalDraft;
  }

  load(): void {
    this.loading = true;
    this.loadFailed = false;
    this.subscriptions.add(
      this.api.consultation(this.consultationId).subscribe({
        next: (detail) => {
          this.loading = false;
          this.title = this.originalTitle = detail.title;
          this.options = detail.options.map((option) => ({
            id: option.id,
            text: option.text ?? '',
            originalText: option.text ?? '',
            count: option.count,
            removed: false,
          }));
          this.originalDraft = this.draftValue();
          this.editable = detail.type === 'text' && detail.state === 'open';
          if (!this.editable) {
            this.error =
              'La consulta ya no admite edición. Recarga la ficha para ver su estado actual.';
            this.needsReload = true;
          }
          this.changeDetector.markForCheck();
          setTimeout(() => this.titleInput?.nativeElement.focus());
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.loadFailed = !this.team.handleAccessError(error);
          this.changeDetector.markForCheck();
        },
      }),
    );
  }

  addOption(): void {
    if (this.pending || this.activeOptions.length >= 10) return;
    const id = crypto.randomUUID();
    this.options.push({ id, text: '', count: 0, removed: false });
    this.clearErrors();
    this.changeDetector.markForCheck();
    setTimeout(() => document.getElementById(`edit-option-${id}`)?.focus());
  }

  toggleRemoval(option: DraftOption): void {
    if (this.pending) return;
    if (option.originalText === undefined)
      this.options = this.options.filter((item) => item.id !== option.id);
    else option.removed = !option.removed;
    this.confirmedRemovalIds.delete(option.id);
    this.clearErrors();
  }

  optionError(option: DraftOption): string {
    if (option.removed) return '';
    if (this.fieldErrors[option.id]) return this.fieldErrors[option.id];
    if (option.count > 0 && option.text !== option.originalText)
      return 'Esta opción tiene votos. Recupera su texto actual o retírala.';
    if (!this.validationShown) return '';
    if (!option.text.trim() || option.text.length > 50)
      return 'Escribe una opción de hasta 50 caracteres.';
    const normalized = this.normalize(option.text);
    return this.activeOptions.some(
      (other) => other.id !== option.id && this.normalize(other.text) === normalized,
    )
      ? 'Hay opciones con el mismo texto. Cambia una para continuar.'
      : '';
  }

  clearErrors(): void {
    this.error = '';
    this.fieldErrors = {};
  }

  save(): void {
    if (this.pending || this.loading || !this.editable) return;
    this.validationShown = true;
    if (
      this.titleInvalid ||
      this.activeOptions.length < 1 ||
      this.activeOptions.length > 10 ||
      this.activeOptions.some((option) => !!this.optionError(option))
    ) {
      this.error = 'Revisa los campos indicados antes de guardar.';
      return;
    }
    const removals = this.options.filter(
      (option) => option.removed && option.count > 0 && !this.confirmedRemovalIds.has(option.id),
    );
    if (removals.length) {
      this.pendingRemovals = removals.map(({ id, originalText, text, count }) => ({
        id,
        text: originalText ?? text,
        count,
      }));
      this.stage = 'removal';
      return;
    }
    const participantId = this.team.participantId;
    if (!participantId) {
      this.error = 'Elige una identidad del equipo para editar la consulta.';
      return;
    }
    const changes = this.changes(participantId);
    this.pending = true;
    this.error = '';
    this.subscriptions.add(
      this.api.editConsultation(this.consultationId, changes).subscribe({
        next: (result) => {
          this.pending = false;
          this.saved.emit(result);
        },
        error: (error: HttpErrorResponse) => {
          this.pending = false;
          if (!this.team.handleAccessError(error)) this.applyError(error, changes);
          this.changeDetector.markForCheck();
        },
      }),
    );
  }

  confirmRemoval(): void {
    for (const option of this.pendingRemovals) this.confirmedRemovalIds.add(option.id);
    this.stage = 'edit';
    this.save();
  }

  backToEdit(event?: Event): void {
    event?.preventDefault();
    this.stage = 'edit';
    this.changeDetector.markForCheck();
    setTimeout(() => this.titleInput?.nativeElement.focus());
  }

  requestClose(event?: Event): void {
    event?.preventDefault();
    if (this.pending) return;
    this.reloadAfterDiscard = false;
    if (this.dirty) this.stage = 'discard';
    else this.closed.emit(false);
  }

  requestReload(): void {
    if (this.pending) return;
    this.reloadAfterDiscard = true;
    if (this.dirty) this.stage = 'discard';
    else this.closed.emit(true);
  }

  continueEditing(event?: Event): void {
    this.reloadAfterDiscard = false;
    this.backToEdit(event);
  }

  recoverText(option: DraftOption): void {
    if (option.currentText === undefined) return;
    option.text = option.originalText = option.currentText;
    option.currentText = undefined;
    this.clearErrors();
  }

  private changes(participantId: string): ConsultationEdit {
    const remove = this.options
      .filter((option) => option.removed && option.originalText !== undefined)
      .map((option) => option.id);
    return {
      participantId,
      ...(this.title !== this.originalTitle ? { title: this.title } : {}),
      optionChanges: {
        add: this.activeOptions
          .filter((option) => option.originalText === undefined)
          .map(({ id, text }) => ({ id, text })),
        update: this.activeOptions
          .filter(
            (option) => option.originalText !== undefined && option.text !== option.originalText,
          )
          .map(({ id, text }) => ({ id, text })),
        remove,
      },
      confirmedRemovalOptionIds: remove.filter((id) => this.confirmedRemovalIds.has(id)),
    };
  }

  private applyError(error: HttpErrorResponse, changes: ConsultationEdit): void {
    const problem = error.error;
    if (
      error.status === 409 &&
      problem?.type === 'urn:synqo:problem:consultation-removal-confirmation-required'
    ) {
      this.pendingRemovals = problem.optionsWithVotes ?? [];
      this.stage = 'removal';
      return;
    }
    if (error.status === 409) {
      this.error =
        'La consulta ha cambiado. Conservamos tu borrador; revisa las opciones o recarga la ficha.';
      const current = problem?.consultation as ConsultationDetail | undefined;
      this.needsReload = true;
      if (current) {
        this.editable = current.state === 'open' && current.type === 'text';
        for (const option of this.options) {
          const actual = current.options.find((item) => item.id === option.id);
          if (actual && actual.count > 0) {
            option.count = actual.count;
            if (option.text !== actual.text) option.currentText = actual.text;
            else option.originalText = actual.text;
          }
        }
      }
      if (problem?.type === 'urn:synqo:problem:consultation-closed') this.editable = false;
      return;
    }
    if (error.status === 422) {
      this.error =
        'Revisa el título, las opciones y los límites indicados. No se guardó ningún cambio.';
      for (const violation of Array.isArray(problem?.violations) ? problem.violations : []) {
        const path = String(violation.propertyPath ?? '');
        if (path === 'title') this.fieldErrors['title'] = 'Revisa el título de la consulta.';
        if (
          path.startsWith('options.') &&
          this.options.some((option) => option.id === path.slice(8))
        )
          this.fieldErrors[path.slice(8)] = 'Revisa el texto de esta opción.';
        const match = /^optionChanges\.(add|update)\.(\d+)/.exec(path);
        if (match) {
          const option = changes.optionChanges[match[1] as 'add' | 'update'][Number(match[2])];
          if (option) this.fieldErrors[option.id] = 'Revisa el texto de esta opción.';
        }
      }
      return;
    }
    this.error =
      'No se pudo guardar la consulta. Conservamos tus cambios para que puedas reintentar.';
  }

  private draftValue(): string {
    return JSON.stringify({
      title: this.title,
      options: this.options.map(({ id, text, removed }) => ({ id, text, removed })),
    });
  }
  private normalize(text: string): string {
    return text
      .trim()
      .normalize('NFD')
      .replace(/\p{Mn}+/gu, '')
      .toLowerCase();
  }
}
