import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface BrandboardOutput {
  path: string;
  scale?: number;
  width?: number;
  height?: number;
}

interface OutputSize {
  width: number;
  height: number;
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
}

interface BrandboardCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BrandboardItem {
  id: string;
  label: string;
  crop: BrandboardCrop;
  outputs: BrandboardOutput[];
}

interface BrandboardConfig {
  source: string;
  sourceWidth: number;
  sourceHeight: number;
  items: BrandboardItem[];
}

@Component({
  selector: 'app-brandboard-tool',
  imports: [FormsModule],
  templateUrl: './brandboard-tool.html',
  styleUrl: './brandboard-tool.css',
})
export class BrandboardTool {
  @ViewChild('boardImage') private boardImage?: ElementRef<HTMLImageElement>;
  private readonly changeDetector = inject(ChangeDetectorRef);

  config?: BrandboardConfig;
  selectedId = '';
  zoom = 0.55;
  background = '#ffffff';
  loading = true;
  imageReady = false;
  extracting = false;
  message = '';
  error = '';

  constructor() {
    void this.loadConfig();
  }

  get selectedItem(): BrandboardItem | undefined {
    return this.config?.items.find((item) => item.id === this.selectedId);
  }

  get previewWidth(): number {
    return (this.config?.sourceWidth ?? 0) * this.zoom;
  }

  get previewHeight(): number {
    return (this.config?.sourceHeight ?? 0) * this.zoom;
  }

  outputSize(crop: BrandboardCrop, output: BrandboardOutput): OutputSize {
    const ratio = crop.width / crop.height;
    if (output.scale !== undefined) {
      if (
        output.width !== undefined ||
        output.height !== undefined ||
        !Number.isFinite(output.scale) ||
        output.scale <= 0
      ) {
        throw new Error(`La salida «${output.path}» debe usar escala o dimensiones.`);
      }
      const width = Math.max(1, Math.round(crop.width * output.scale));
      const height = Math.max(1, Math.round(crop.height * output.scale));
      return { width, height, drawWidth: width, drawHeight: height, offsetX: 0, offsetY: 0 };
    }

    const hasWidth = output.width !== undefined;
    const hasHeight = output.height !== undefined;
    const width = hasWidth
      ? output.width!
      : hasHeight
        ? Math.round(output.height! * ratio)
        : crop.width;
    const height = hasHeight
      ? output.height!
      : hasWidth
        ? Math.round(output.width! / ratio)
        : crop.height;
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
      throw new Error(`La salida «${output.path}» debe tener dimensiones positivas enteras.`);
    }
    if (width > 8192 || height > 8192 || width * height > 32 * 1024 * 1024) {
      throw new Error(`La salida «${output.path}» supera el tamaño máximo permitido.`);
    }

    const scale = Math.min(width / crop.width, height / crop.height);
    const drawWidth = crop.width * scale;
    const drawHeight = crop.height * scale;
    return {
      width,
      height,
      drawWidth,
      drawHeight,
      offsetX: (width - drawWidth) / 2,
      offsetY: (height - drawHeight) / 2,
    };
  }

  async loadConfig(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const response = await fetch('/__brandboard/config');
      if (!response.ok) throw new Error(`El servicio local respondió ${response.status}.`);
      const config = (await response.json()) as BrandboardConfig;
      for (const item of config.items) {
        const { x, y, width, height } = item.crop;
        if (
          ![x, y, width, height].every(Number.isFinite) ||
          x < 0 ||
          y < 0 ||
          width <= 0 ||
          height <= 0 ||
          x + width > config.sourceWidth ||
          y + height > config.sourceHeight
        ) {
          throw new Error(`El recorte «${item.label}» sale de los límites de la imagen.`);
        }
        for (const output of item.outputs) this.outputSize(item.crop, output);
      }
      this.config = config;
      this.selectedId = this.config.items[0]?.id ?? '';
    } catch (error) {
      this.error =
        error instanceof Error
          ? `${error.message} Arranca la aplicación con ./iniciar-desarrollo.sh.`
          : 'No se pudo cargar la configuración de recortes.';
    } finally {
      this.loading = false;
      this.changeDetector.detectChanges();
    }
  }

  selectItem(item: BrandboardItem): void {
    this.selectedId = item.id;
  }

  onBoardLoaded(): void {
    this.imageReady = true;
    this.changeDetector.detectChanges();
  }

  async extract(): Promise<void> {
    const image = this.boardImage?.nativeElement;
    const items = this.config?.items;
    if (!image || !items?.length || !this.imageReady || !image.complete || !image.naturalWidth) {
      this.error = 'La brandboard todavía no está lista.';
      return;
    }

    this.extracting = true;
    this.error = '';
    this.message = '';
    try {
      const files: { path: string; base64: string }[] = [];
      for (const item of items) {
        const { x, y, width, height } = item.crop;
        if (
          x < 0 ||
          y < 0 ||
          width <= 0 ||
          height <= 0 ||
          x + width > image.naturalWidth ||
          y + height > image.naturalHeight
        ) {
          throw new Error(`El recorte «${item.label}» sale de los límites de la imagen.`);
        }

        for (const output of item.outputs) {
          const size = this.outputSize(item.crop, output);
          const canvas = document.createElement('canvas');
          canvas.width = size.width;
          canvas.height = size.height;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('El navegador no pudo preparar el recorte.');
          context.imageSmoothingQuality = 'high';
          context.drawImage(
            image,
            x,
            y,
            width,
            height,
            size.offsetX,
            size.offsetY,
            size.drawWidth,
            size.drawHeight,
          );
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (result) =>
                result ? resolve(result) : reject(new Error('No se pudo crear un PNG.')),
              'image/png',
            );
          });
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
            reader.onerror = () => reject(new Error('No se pudo leer el PNG generado.'));
            reader.readAsDataURL(blob);
          });
          files.push({ path: output.path, base64 });
        }
      }

      const response = await fetch('/__brandboard/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ files }),
      });
      const result = (await response.json()) as { error?: string; written?: BrandboardOutput[] };
      if (!response.ok)
        throw new Error(result.error ?? `El servicio local respondió ${response.status}.`);
      const written = result.written ?? [];
      this.message = `Se han generado ${written.length} archivos en apps/web/public.`;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se pudieron extraer los recortes.';
    } finally {
      this.extracting = false;
      this.changeDetector.detectChanges();
    }
  }
}
