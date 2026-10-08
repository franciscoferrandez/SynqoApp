import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, inject } from '@angular/core';

@Component({
  selector: 'app-demo-reset-timer',
  template: `<span aria-live="off">{{ remaining }}</span>`,
})
export class DemoResetTimer implements OnChanges, OnDestroy {
  @Input({ required: true }) resetAt = '';
  protected remaining = '…';
  private readonly changeDetector = inject(ChangeDetectorRef);
  private interval?: ReturnType<typeof setInterval>;
  private target = Number.NaN;

  ngOnChanges(): void {
    this.target = Date.parse(this.resetAt);
    this.update();
    if (!this.interval) this.interval = setInterval(() => this.update(), 1000);
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }

  private update(): void {
    if (!Number.isFinite(this.target)) {
      this.remaining = 'no disponible';
      this.changeDetector.markForCheck();
      return;
    }

    const hour = 60 * 60 * 1000;
    const now = Date.now();
    if (this.target <= now) this.target += (Math.floor((now - this.target) / hour) + 1) * hour;
    const seconds = Math.max(0, Math.ceil((this.target - now) / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    this.remaining = hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min ${remainder} s`;
    this.changeDetector.markForCheck();
  }
}
