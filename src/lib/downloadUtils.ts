'use client';
import JSZip from 'jszip';

export function downloadSingleApkg(base64: string, baseName: string) {
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  trigger(new Blob([bytes], { type: 'application/octet-stream' }), `${baseName}.apkg`);
}

export async function downloadAllAsZip(results: any[]) {
  const zip = new JSZip();
  for (const r of results) {
    if (r.status === 'success' && r.apkg) {
      const bytes = Uint8Array.from(atob(r.apkg), c => c.charCodeAt(0));
      zip.file(`${r.baseName ?? r.fileName.replace(/\.[^.]+$/, '')}.apkg`, bytes);
    }
  }
  trigger(await zip.generateAsync({ type: 'blob' }), 'notes2cards_export.zip');
}

function trigger(blob: Blob, name: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.setAttribute('download', name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
