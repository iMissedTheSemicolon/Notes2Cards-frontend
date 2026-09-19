import { renderPdfPages, RenderedPage, renderPdfRegionToJpegBytes, NormalizedBBox } from './pdfPageRenderer';

export interface Flashcard {
  front: string;
  back: string;
}

export interface MediaEntry {
  /** Sequential zip entry name Anki expects: "0", "1", "2"... */
  zipName: string;
  /** Original filename referenced in the card HTML, e.g. "page_3.jpg" */
  originalName: string;
  bytes: Uint8Array;
}

// Matches <img src="page_3.jpg">, <img src='page_12.jpg' />, case-insensitive.
const PAGE_IMG_REGEX = /<img\s+src=["']page_(\d+)\.jpg["']\s*\/?>/gi;

export function extractReferencedPages(cards: Flashcard[]): number[] {
  const pages = new Set<number>();

  for (const card of cards) {
    for (const fieldText of [card.front, card.back]) {
      const re = new RegExp(PAGE_IMG_REGEX.source, PAGE_IMG_REGEX.flags);
      let match: RegExpExecArray | null;
      while ((match = re.exec(fieldText)) !== null) {
        pages.add(parseInt(match[1], 10));
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function buildMediaEntries(
  pdfData: ArrayBuffer,
  cards: Flashcard[],
  opts: { scale?: number; quality?: number } = {}
): Promise<MediaEntry[]> {
  const pageNumbers = extractReferencedPages(cards);
  if (pageNumbers.length === 0) return [];

  const rendered: RenderedPage[] = await renderPdfPages(
    pdfData,
    pageNumbers,
    opts.scale,
    opts.quality
  );

  return rendered.map((page, idx) => ({
    zipName: String(idx),
    originalName: `page_${page.pageNumber}.jpg`,
    bytes: page.bytes,
  }));
}

export function buildMediaManifest(entries: MediaEntry[]): string {
  const manifest: Record<string, string> = {};
  for (const entry of entries) {
    manifest[entry.zipName] = entry.originalName;
  }
  return JSON.stringify(manifest);
}

export async function assembleApkgZip(
  zip: import('jszip'),
  collectionDbBytes: Uint8Array,
  mediaEntries: MediaEntry[],
  collectionFileName: 'collection.anki2' | 'collection.anki21' = 'collection.anki2'
): Promise<void> {
  zip.file(collectionFileName, collectionDbBytes);

  for (const entry of mediaEntries) {
    zip.file(entry.zipName, entry.bytes);
  }

  zip.file('media', buildMediaManifest(mediaEntries));
}

export interface CardImageRef {
  /** Short id local to this card, referenced as <img src="{id}"> in front/back */
  id: string;
  /** 1-indexed page number */
  page: number;
  /** [y_min, x_min, y_max, x_max], normalized 0-1000, per Gemini's grounding format */
  bbox: NormalizedBBox;
}

export interface FlashcardWithImages extends Flashcard {
  images?: CardImageRef[];
}

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function resolveCardImages(
  pdfData: ArrayBuffer,
  cards: FlashcardWithImages[],
  opts: { paddingFraction?: number; scale?: number; quality?: number } = {}
): Promise<{ cards: Flashcard[]; mediaEntries: MediaEntry[] }> {
  const mediaEntries: MediaEntry[] = [];
  const resolvedCards: Flashcard[] = [];
  const cache = new Map<string, MediaEntry>();

  let globalIdx = 0;
  for (const card of cards) {
    let front = card.front;
    let back = card.back;

    for (const imgRef of card.images ?? []) {
      const cacheKey = `${imgRef.page}:${imgRef.bbox.join(',')}`;
      let cachedEntry = cache.get(cacheKey);

      if (!cachedEntry) {
        const zipName = String(globalIdx);
        const originalName = `crop_${globalIdx}.jpg`;

        let bytes: Uint8Array;
        try {
          bytes = await renderPdfRegionToJpegBytes(pdfData, imgRef.page, imgRef.bbox, opts);
        } catch (err) {
          console.error(
            `[ankiMediaBundler] Failed to render image "${imgRef.id}" (page ${imgRef.page}, bbox [${imgRef.bbox.join(', ')}]):`,
            err
          );
          const placeholderRe = new RegExp(
            `<img[^>]*src=["']${escapeForRegex(imgRef.id)}(?:\\.\\w+)?["'][^>]*>`,
            'gi'
          );
          front = front.replace(placeholderRe, '');
          back = back.replace(placeholderRe, '');
          continue;
        }

        cachedEntry = { zipName, originalName, bytes };
        mediaEntries.push(cachedEntry);
        cache.set(cacheKey, cachedEntry);
        globalIdx++;
      }

          const placeholderRe = new RegExp(
            `<img[^>]*src=["']${escapeForRegex(imgRef.id)}(?:\\.\\w+)?["'][^>]*>`,
            'gi'
          );
      front = front.replace(placeholderRe, `<img src="${cachedEntry.originalName}">`);
      back = back.replace(placeholderRe, `<img src="${cachedEntry.originalName}">`);
    }

    resolvedCards.push({ front, back });
  }

  return { cards: resolvedCards, mediaEntries };
}
