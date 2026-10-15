import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';

const sequences = [
  [
    '¿Cuándo volvemos a ensayar?',
    '¿Qué canción añadimos al repertorio?',
    '¿Cuándo tenemos el próximo concierto?',
    'Gestiónalo en Synqo.',
  ],
  [
    '¿Cuándo nos juntamos otra vez?',
    '¿Qué plan os apetece?',
    '¿Dónde nos encontramos?',
    'Poneos de acuerdo en Synqo.',
  ],
  [
    '¿Cuándo hacemos la próxima reunión?',
    '¿Qué idea elegimos?',
    '¿Cuándo es la próxima formación?',
    'Decididlo en Synqo.',
  ],
] as const;

@Component({
  selector: 'app-landing-prompts',
  template: `
    <div class="landing-prompts" aria-hidden="true">
      <p class="landing-prompts-text" [class.landing-prompts-visible]="visible">
        {{ sequences[sequenceIndex][phraseIndex] }}
      </p>
    </div>
    <span class="sr-only">Organizad ensayos, planes y decisiones en Synqo.</span>
  `,
})
export class LandingPrompts implements OnInit, OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected readonly sequences = sequences;
  protected sequenceIndex = 0;
  protected phraseIndex = 0;
  protected visible = true;
  private timer?: ReturnType<typeof setTimeout>;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  ngOnInit(): void {
    if (!this.reducedMotion.matches) this.schedule();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  private schedule(): void {
    const last = this.phraseIndex === sequences[this.sequenceIndex].length - 1;
    this.timer = setTimeout(
      () => {
        this.visible = false;
        this.changeDetector.markForCheck();
        this.timer = setTimeout(() => {
          if (last) {
            this.sequenceIndex = (this.sequenceIndex + 1) % sequences.length;
            this.phraseIndex = 0;
          } else {
            this.phraseIndex++;
          }
          this.visible = true;
          this.changeDetector.markForCheck();
          this.schedule();
        }, 250);
      },
      last ? 5000 : 2500,
    );
  }
}
