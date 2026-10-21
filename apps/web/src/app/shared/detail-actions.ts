import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

export interface DetailAction {
  id: string;
  label: string;
  danger?: boolean;
}

@Component({
  selector: 'app-detail-actions',
  template: `
    <button
      #trigger
      type="button"
      class="detail-actions-trigger outline"
      [attr.aria-label]="label"
      [attr.aria-expanded]="expanded"
      [attr.aria-controls]="panelId"
      [disabled]="disabled"
      (click)="expanded = !expanded"
    >
      <span aria-hidden="true">☰</span>
    </button>
    @if (expanded) {
      <div class="detail-actions-panel" role="group" [id]="panelId" [attr.aria-label]="label">
        @for (action of actions; track action.id) {
          <button
            type="button"
            [class.danger]="action.danger"
            [disabled]="disabled"
            (click)="choose(action.id)"
          >
            {{ action.label }}
          </button>
        }
      </div>
    }
  `,
})
export class DetailActions {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) panelId!: string;
  @Input() actions: DetailAction[] = [];
  @Input() disabled = false;
  @Output() readonly selected = new EventEmitter<string>();
  @ViewChild('trigger') private trigger?: ElementRef<HTMLButtonElement>;
  private readonly host = inject(ElementRef<HTMLElement>);
  expanded = false;

  choose(id: string): void {
    if (this.disabled) return;
    this.expanded = false;
    this.focusTrigger();
    this.selected.emit(id);
  }

  focusTrigger(): void {
    this.trigger?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape', ['$event'])
  closeWithEscape(event: Event): void {
    if (!this.expanded) return;
    event.preventDefault();
    event.stopPropagation();
    this.expanded = false;
    this.focusTrigger();
  }

  @HostListener('document:click', ['$event'])
  closeOutside(event: MouseEvent): void {
    if (event.target instanceof Node && !this.host.nativeElement.contains(event.target))
      this.expanded = false;
  }
}
