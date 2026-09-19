'use client';

import JSZip from 'jszip';
import { FlashcardWithImages, resolveCardImages, assembleApkgZip, MediaEntry } from './ankiMediaBundler';
import { CardImageRef } from './ankiMediaBundler';

export type CardData = FlashcardWithImages;

// Load sql.js once and cache it
let sqlPromise: Promise<any> | null = null;

async function getSqlJs() {
  if (sqlPromise) return sqlPromise;
  sqlPromise = (async () => {
    const initSqlJs = (await import('sql.js')).default;
    return initSqlJs({
      // Tell sql.js where to find the WASM file we copied to /public/
      locateFile: (file: string) => `/${file}`,
    });
  })();
  return sqlPromise;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function createTables(db: any) {
  db.run(`CREATE TABLE col (id INTEGER PRIMARY KEY, crt INTEGER NOT NULL, mod INTEGER NOT NULL, scm INTEGER NOT NULL, ver INTEGER NOT NULL, dty INTEGER NOT NULL, usn INTEGER NOT NULL, ls INTEGER NOT NULL, conf TEXT NOT NULL, models TEXT NOT NULL, decks TEXT NOT NULL, dconf TEXT NOT NULL, tags TEXT NOT NULL)`);
  db.run(`CREATE TABLE notes (id INTEGER PRIMARY KEY, guid TEXT NOT NULL, mid INTEGER NOT NULL, mod INTEGER NOT NULL, usn INTEGER NOT NULL, tags TEXT NOT NULL, flds TEXT NOT NULL, sfld TEXT NOT NULL, csum INTEGER NOT NULL, flags INTEGER NOT NULL, data TEXT NOT NULL)`);
  db.run(`CREATE TABLE cards (id INTEGER PRIMARY KEY, nid INTEGER NOT NULL, did INTEGER NOT NULL, ord INTEGER NOT NULL, mod INTEGER NOT NULL, usn INTEGER NOT NULL, type INTEGER NOT NULL, queue INTEGER NOT NULL, due INTEGER NOT NULL, ivl INTEGER NOT NULL, factor INTEGER NOT NULL, reps INTEGER NOT NULL, lapses INTEGER NOT NULL, left INTEGER NOT NULL, odue INTEGER NOT NULL, odid INTEGER NOT NULL, flags INTEGER NOT NULL, data TEXT NOT NULL)`);
  db.run(`CREATE TABLE revlog (id INTEGER PRIMARY KEY, cid INTEGER NOT NULL, usn INTEGER NOT NULL, ease INTEGER NOT NULL, ivl INTEGER NOT NULL, lastIvl INTEGER NOT NULL, factor INTEGER NOT NULL, time INTEGER NOT NULL, type INTEGER NOT NULL)`);
  db.run(`CREATE TABLE graves (usn INTEGER NOT NULL, oid INTEGER NOT NULL, type INTEGER NOT NULL)`);
}

function insertCollection(db: any, deckId: number, modelId: number, deckName: string, models: any, now: number) {
  const decks = {
    1: { desc: '', name: 'Default', extendRev: 50, usn: 0, collapsed: false, newToday: [0, 0], timeToday: [0, 0], dyn: 0, extendNew: 10, conf: 1, revToday: [0, 0], lrnToday: [0, 0], id: 1, mod: now },
    [deckId]: { desc: '', name: deckName, extendRev: 50, usn: -1, collapsed: false, newToday: [0, 0], timeToday: [0, 0], dyn: 0, extendNew: 10, conf: 1, revToday: [0, 0], lrnToday: [0, 0], id: deckId, mod: now }
  };
  const dconf = {
    1: { name: 'Default', replayq: true, lapse: { leechFails: 8, minInt: 1, delays: [10], leechAction: 0, mult: 0 }, rev: { perDay: 100, fuzz: 0.05, ivlFct: 1, maxIvl: 36500, ease4: 1.3, bury: true, minSpace: 1 }, timer: 0, maxTaken: 60, usn: 0, "new": { perDay: 20, delays: [1, 10], separate: true, ints: [1, 4, 7], initialFactor: 2500, bury: true, order: 1 }, mod: 0, id: 1, autoplay: true }
  };
  const conf = { nextPos: 1, estTimes: true, activeDecks: [1], sortType: 'noteFld', timeLim: 0, sortBackwards: false, addToCur: true, curDeck: 1, newBury: true, newSpread: 0, dueCounts: true, curModel: `${modelId}`, collapseTime: 1200 };
  
  db.run('INSERT INTO col VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [1, now, now, now * 1000, 11, 0, -1, 0,
      JSON.stringify(conf), JSON.stringify(models), JSON.stringify(decks), JSON.stringify(dconf), '{}']);
}

function randomGuid(): string {
  return Math.random().toString(36).slice(2, 14);
}

function csum(text: string): number {
  let h = 0;
  for (let i = 0; i < Math.min(text.length, 9); i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

async function prepareMedia(cards: CardData[], mediaFiles?: {name: string, data: string | Uint8Array}[], originalFile?: File) {
  let resolvedCards = cards;
  let finalMediaEntries: MediaEntry[] = [];

  if (mediaFiles) {
    mediaFiles.forEach((m, idx) => {
      let bytes: Uint8Array;
      if (typeof m.data === 'string') {
        const binaryString = atob(m.data);
        const len = binaryString.length;
        bytes = new Uint8Array(len);
        for (let j = 0; j < len; j++) bytes[j] = binaryString.charCodeAt(j);
      } else {
        bytes = m.data;
      }
      finalMediaEntries.push({ zipName: String(idx), originalName: m.name, bytes });
    });
  }

  if (originalFile && originalFile.type === 'application/pdf') {
    const arrayBuffer = await originalFile.arrayBuffer();
    const resolved = await resolveCardImages(arrayBuffer, cards);
    resolvedCards = resolved.cards;
    
    let offset = finalMediaEntries.length;
    resolved.mediaEntries.forEach(entry => {
      finalMediaEntries.push({
        zipName: String(offset++),
        originalName: entry.originalName,
        bytes: entry.bytes
      });
    });
  }

  return { resolvedCards, finalMediaEntries };
}

// ── Create .apkg for BASIC (standard front/back) cards ───────────────────────

async function createBasicApkg(deckName: string, cards: CardData[], mediaFiles?: {name: string, data: string | Uint8Array}[], originalFile?: File): Promise<Uint8Array> {
  const SQL = await getSqlJs();
  const db = new SQL.Database();

  const now = Math.floor(Date.now() / 1000);
  const deckId = now * 1000 + Math.floor(Math.random() * 999);
  const modelId = now * 1000 + Math.floor(Math.random() * 999) + 1;

  createTables(db);

  const models = {
    [`${modelId}`]: {
      veArs: [], name: 'Basic', tags: [], did: deckId, usn: -1, req: [[0, 'all', [0]]],
      flds: [
        { name: 'Front', media: [], sticky: false, rtl: false, ord: 0, font: 'Arial', size: 20 },
        { name: 'Back', media: [], sticky: false, rtl: false, ord: 1, font: 'Arial', size: 20 }
      ],
      sortf: 0, latexPre: "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
      tmpls: [ { name: 'Card 1', qfmt: '{{Front}}', did: null, bafmt: '', afmt: '{{FrontSide}}<hr id=answer>{{Back}}', ord: 0, bqfmt: '' } ],
      latexPost: '\\end{document}', type: 0, id: modelId, css: '.card{font-family:Arial;font-size:20px;color:black;background-color:white;}', mod: now
    }
  };

  insertCollection(db, deckId, modelId, deckName, models, now);

  const { resolvedCards, finalMediaEntries } = await prepareMedia(cards, mediaFiles, originalFile);

  for (let i = 0; i < resolvedCards.length; i++) {
    const c = resolvedCards[i];
    const noteId = now * 10000 + i * 2;
    const cardId = now * 10000 + i * 2 + 1;
    const flds = c.front + '\x1f' + c.back;
    db.run('INSERT INTO notes VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [noteId, randomGuid(), modelId, now, -1, '', flds, c.front.slice(0,100), csum(c.front), 0, '']);
    db.run('INSERT INTO cards VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [cardId, noteId, deckId, 0, now, -1, 0, 0, i, 0, 0, 0, 0, 0, 0, 0, 0, '']);
  }
  
  const sqliteBytes: Uint8Array = db.export();
  const zip = new JSZip();
  await assembleApkgZip(zip, sqliteBytes, finalMediaEntries);
  return await zip.generateAsync({ type: 'uint8array' });
}

// ── Create .apkg for CLOZE cards ─────────────────────────────────────────────

async function createClozeApkg(deckName: string, cards: CardData[], mediaFiles?: {name: string, data: string | Uint8Array}[], originalFile?: File): Promise<Uint8Array> {
  const SQL = await getSqlJs();
  const db = new SQL.Database();

  const now = Math.floor(Date.now() / 1000);
  const deckId = now * 1000 + Math.floor(Math.random() * 999);
  const modelId = now * 1000 + Math.floor(Math.random() * 999) + 1;

  createTables(db);

  const models = {
    [`${modelId}`]: {
      veArs: [], name: 'Cloze', tags: [], did: deckId, usn: -1, req: [[0, 'any', [0]]],
      flds: [
        { name: 'Text', media: [], sticky: false, rtl: false, ord: 0, font: 'Arial', size: 20 },
        { name: 'Back Extra', media: [], sticky: false, rtl: false, ord: 1, font: 'Arial', size: 20 }
      ],
      sortf: 0, latexPre: "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
      tmpls: [ { name: 'Cloze', qfmt: '{{cloze:Text}}', did: null, bafmt: '', afmt: '{{cloze:Text}}<br>{{Back Extra}}', ord: 0, bqfmt: '' } ],
      latexPost: '\\end{document}', type: 1, id: modelId, css: '.card{font-family:Arial;font-size:20px;color:black;background-color:white;}', mod: now
    }
  };

  insertCollection(db, deckId, modelId, deckName, models, now);

  const { resolvedCards, finalMediaEntries } = await prepareMedia(cards, mediaFiles, originalFile);

  for (let i = 0; i < resolvedCards.length; i++) {
    const c = resolvedCards[i];
    const noteId = now * 10000 + i * 2;
    const cardId = now * 10000 + i * 2 + 1;
    const flds = c.front + '\x1f' + (c.back ?? '');
    db.run('INSERT INTO notes VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [noteId, randomGuid(), modelId, now, -1, '', flds, c.front.slice(0,100), csum(c.front), 0, '']);
    db.run('INSERT INTO cards VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [cardId, noteId, deckId, 0, now, -1, 0, 0, i, 0, 0, 0, 0, 0, 0, 0, 0, '']);
  }
  
  const sqliteBytes: Uint8Array = db.export();
  const zip = new JSZip();
  await assembleApkgZip(zip, sqliteBytes, finalMediaEntries);
  return await zip.generateAsync({ type: 'uint8array' });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateAndDownloadApkg(
  baseName: string,
  cards: CardData[],
  cardType: 'standard' | 'cloze',
  mediaFiles?: {name: string, data: string | Uint8Array}[],
  originalFile?: File
) {
  try {
    console.log(`[AnkiExport] Generating .apkg for "${baseName}" (${cards.length} ${cardType} cards)`);
    const bytes = cardType === 'cloze'
      ? await createClozeApkg(baseName, cards, mediaFiles, originalFile)
      : await createBasicApkg(baseName, cards, mediaFiles, originalFile);
    downloadBytes(bytes, `${baseName}.apkg`);
  } catch (err: any) {
    console.error("[AnkiExport] Fatal error during download:", err);
    if (typeof window !== 'undefined') {
      alert("Error generating download: " + (err.message || String(err)));
    }
  }
}

export async function generateAndDownloadAllAsZip(
  results: Array<{ baseName: string; cards: CardData[]; cardType: 'standard' | 'cloze'; status: string; mediaFiles?: {name: string, data: string}[], originalFile?: File }>
) {
  const successes = results.filter(r => r.status === 'success' && r.cards?.length > 0);
  if (successes.length === 0) return;

  const zip = new JSZip();
  for (const r of successes) {
    const bytes = r.cardType === 'cloze'
      ? await createClozeApkg(r.baseName, r.cards, r.mediaFiles, r.originalFile)
      : await createBasicApkg(r.baseName, r.cards, r.mediaFiles, r.originalFile);
    zip.file(`${r.baseName}.apkg`, bytes);
  }
  const zipBytes = await zip.generateAsync({ type: 'uint8array' });
  downloadBytes(zipBytes, 'notes2cards_export.zip');
}

function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as any], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  console.log(`[AnkiExport] Downloaded: ${filename}`);
}
