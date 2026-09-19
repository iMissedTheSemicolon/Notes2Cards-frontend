/**
 * Renders a specific page of a PDF to raw JPEG bytes using pdfjs-dist.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Use local worker as configured previously
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface RenderedPage {
  pageNumber: number;
  bytes: Uint8Array;
  width: number;
  height: number;
}

/**
 * Render a single 1-indexed page from a PDF ArrayBuffer to JPEG bytes.
 */
export async function renderPdfPageToJpegBytes(
  pdfData: ArrayBuffer,
  pageNumber: number,
  scale = 2.0,
  quality = 0.85
): Promise<RenderedPage> {
  const pdf = await pdfjsLib.getDocument({ data: pdfData.slice(0) }).promise;

  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    throw new Error(`Requested page ${pageNumber} but PDF only has ${pdf.numPages} pages`);
  }

  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire 2d canvas context');
  }

  const renderTask = page.render({ canvasContext: ctx, viewport } as any);
  await renderTask.promise;

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('canvas.toBlob() returned null'))),
      'image/jpeg',
      quality
    );
  });

  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error(`Rendered page ${pageNumber} does not look like a valid JPEG (got ${bytes.length} bytes)`);
  }

  await page.cleanup();

  return { pageNumber, bytes, width: canvas.width, height: canvas.height };
}

export async function renderPdfPages(
  pdfData: ArrayBuffer,
  pageNumbers: number[],
  scale = 2.0,
  quality = 0.85
): Promise<RenderedPage[]> {
  const results: RenderedPage[] = [];
  for (const pageNumber of pageNumbers) {
    try {
      results.push(await renderPdfPageToJpegBytes(pdfData, pageNumber, scale, quality));
    } catch (err) {
      console.error(`[pdfPageRenderer] Failed to render page ${pageNumber}:`, err);
      throw err;
    }
  }
  return results;
}

export type NormalizedBBox = [number, number, number, number];

/**
 * Renders ONLY the region of a page described by a normalized bounding box
 */
export async function renderPdfRegionToJpegBytes(
  pdfData: ArrayBuffer,
  pageNumber: number,
  bbox: NormalizedBBox,
  opts: { paddingFraction?: number; scale?: number; quality?: number } = {}
): Promise<Uint8Array> {
  const { paddingFraction = 0.04, scale = 3.0, quality = 0.85 } = opts;

  const pdf = await pdfjsLib.getDocument({ data: pdfData.slice(0) }).promise;
  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    throw new Error(`Page ${pageNumber} out of range (1-${pdf.numPages})`);
  }
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = Math.ceil(viewport.width);
  fullCanvas.height = Math.ceil(viewport.height);
  const fullCtx = fullCanvas.getContext('2d');
  if (!fullCtx) throw new Error('Could not acquire 2d canvas context');

  await page.render({ canvasContext: fullCtx, viewport } as any).promise;

  let [yMinF, xMinF, yMaxF, xMaxF] = bbox.map((v) => v / 1000);

  if (
    [yMinF, xMinF, yMaxF, xMaxF].some((v) => Number.isNaN(v) || v < 0 || v > 1) ||
    yMaxF <= yMinF ||
    xMaxF <= xMinF
  ) {
    throw new Error(`Received malformed bbox [${bbox.join(', ')}] for page ${pageNumber}`);
  }

  const padY = (yMaxF - yMinF) * paddingFraction;
  const padX = (xMaxF - xMinF) * paddingFraction;
  yMinF = Math.max(0, yMinF - padY);
  xMinF = Math.max(0, xMinF - padX);
  yMaxF = Math.min(1, yMaxF + padY);
  xMaxF = Math.min(1, xMaxF + padX);

  const srcX = Math.round(xMinF * fullCanvas.width);
  const srcY = Math.round(yMinF * fullCanvas.height);
  const srcW = Math.max(1, Math.round((xMaxF - xMinF) * fullCanvas.width));
  const srcH = Math.max(1, Math.round((yMaxF - yMinF) * fullCanvas.height));

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = srcW;
  cropCanvas.height = srcH;
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) throw new Error('Could not acquire 2d canvas context for crop');

  cropCtx.drawImage(fullCanvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

  const blob: Blob = await new Promise((resolve, reject) => {
    cropCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('canvas.toBlob() returned null'))),
      'image/jpeg',
      quality
    );
  });

  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error(`Cropped region for page ${pageNumber} did not produce a valid JPEG`);
  }

  await page.cleanup();
  return bytes;
}
