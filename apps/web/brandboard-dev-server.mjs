import { createServer } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(webRoot, 'src/app/dev/brandboard/brandboard-crops.json');
const publicRoot = path.join(webRoot, 'public');
const port = 4201;
const maxRequestBytes = 32 * 1024 * 1024;
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function resolveOutputSize(crop, output) {
  const ratio = crop.width / crop.height;
  let width;
  let height;
  if (output.scale !== undefined) {
    if (
      output.width !== undefined ||
      output.height !== undefined ||
      !Number.isFinite(output.scale) ||
      output.scale <= 0
    ) {
      throw new Error(`La salida «${output.path}» debe usar una escala positiva o dimensiones.`);
    }
    width = Math.max(1, Math.round(crop.width * output.scale));
    height = Math.max(1, Math.round(crop.height * output.scale));
  } else {
    const hasWidth = output.width !== undefined;
    const hasHeight = output.height !== undefined;
    width = hasWidth ? output.width : hasHeight ? Math.round(output.height * ratio) : crop.width;
    height = hasHeight ? output.height : hasWidth ? Math.round(output.width / ratio) : crop.height;
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
      throw new Error(`La salida «${output.path}» debe tener dimensiones positivas enteras.`);
    }
  }
  if (width > 8192 || height > 8192 || width * height > 32 * 1024 * 1024) {
    throw new Error(`La salida «${output.path}» supera el tamaño máximo permitido.`);
  }
  return { width, height };
}

function respond(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readConfig() {
  return JSON.parse(await readFile(configPath, 'utf8'));
}

function collectBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    request.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > maxRequestBytes) {
        reject(new Error('El tamaño de la extracción supera el límite permitido.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('La solicitud no contiene JSON válido.'));
      }
    });
    request.on('error', reject);
  });
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/__brandboard/config') {
      respond(response, 200, await readConfig());
      return;
    }

    if (request.method === 'POST' && request.url === '/__brandboard/extract') {
      const config = await readConfig();
      const allowedOutputs = new Map(
        config.items.flatMap((item) =>
          item.outputs.map((output) => [output.path, { crop: item.crop, output }]),
        ),
      );
      const body = await collectBody(request);
      if (!Array.isArray(body.files) || body.files.length === 0 || body.files.length > 80) {
        respond(response, 400, { error: 'La solicitud debe incluir entre 1 y 80 imágenes.' });
        return;
      }

      const requested = new Set();
      const writes = body.files.map((file) => {
        if (!file || typeof file.path !== 'string' || typeof file.base64 !== 'string') {
          throw new Error('Cada imagen debe incluir path y base64.');
        }
        const destination = allowedOutputs.get(file.path);
        if (!destination || requested.has(file.path)) {
          throw new Error(`La ruta no está autorizada por el JSON o está repetida: ${file.path}`);
        }
        requested.add(file.path);
        const size = resolveOutputSize(destination.crop, destination.output);
        if (
          destination.crop.x < 0 ||
          destination.crop.y < 0 ||
          destination.crop.width <= 0 ||
          destination.crop.height <= 0 ||
          destination.crop.x + destination.crop.width > config.sourceWidth ||
          destination.crop.y + destination.crop.height > config.sourceHeight
        ) {
          throw new Error(`El recorte de «${file.path}» sale de los límites de la brandboard.`);
        }

        const relativePath = path.normalize(file.path);
        if (
          relativePath.startsWith('..') ||
          path.isAbsolute(relativePath) ||
          !relativePath.endsWith('.png')
        ) {
          throw new Error(`La salida debe ser un PNG dentro de public: ${file.path}`);
        }
        const targetPath = path.resolve(publicRoot, relativePath);
        if (!targetPath.startsWith(`${publicRoot}${path.sep}`)) {
          throw new Error(`La ruta de salida queda fuera de public: ${file.path}`);
        }

        const bytes = Buffer.from(file.base64, 'base64');
        if (
          bytes.length < 24 ||
          bytes.length > 10 * 1024 * 1024 ||
          !bytes.subarray(0, 8).equals(pngSignature)
        ) {
          throw new Error(`La imagen no es un PNG válido o supera 10 MB: ${file.path}`);
        }
        const pngWidth = bytes.readUInt32BE(16);
        const pngHeight = bytes.readUInt32BE(20);
        if (pngWidth !== size.width || pngHeight !== size.height) {
          throw new Error(
            `La imagen «${file.path}» tiene ${pngWidth} × ${pngHeight} px; se esperaba ${size.width} × ${size.height} px.`,
          );
        }
        return { targetPath, bytes, path: file.path, width: pngWidth, height: pngHeight };
      });

      for (const { targetPath, bytes } of writes) {
        await mkdir(path.dirname(targetPath), { recursive: true });
        const temporaryPath = `${targetPath}.tmp-${process.pid}`;
        await writeFile(temporaryPath, bytes);
        await rename(temporaryPath, targetPath);
      }
      respond(response, 200, {
        written: writes.map(({ path: outputPath, width, height }) => ({
          path: outputPath,
          width,
          height,
        })),
      });
      return;
    }

    respond(response, 404, { error: 'Ruta no encontrada.' });
  } catch (error) {
    respond(response, 400, {
      error: error instanceof Error ? error.message : 'No se pudo extraer la imagen.',
    });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Herramienta local de brandboard disponible en 127.0.0.1:${port}.`);
  process.send?.({ type: 'ready' });
});

server.on('error', (error) => {
  console.error(`No se pudo abrir el servicio de brandboard en 127.0.0.1:${port}:`, error.message);
  process.exitCode = 1;
});
