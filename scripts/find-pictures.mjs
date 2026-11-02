#!/usr/bin/env node
// Recherche d’images libres (Wikipédia / Wikimedia Commons) pour les nœuds, musées et personnes.
// Écrit data/pictures.json, qui est ensuite intégré à la page par build.mjs.
//
// Usage : node scripts/find-pictures.mjs                 (cherche ce qui manque)
//         node scripts/find-pictures.mjs --refresh       (recherche tout, sauf les entrées « pinned »)
//         node scripts/find-pictures.mjs --only n:drac,p:catherine-pegard
//         node scripts/find-pictures.mjs --meta          (met seulement à jour crédits et vignettes)
//
// Règles :
// - Une entrée { "pinned": true, "file": "Nom.jpg" } est un choix manuel : le script ne change
//   pas le fichier, il complète seulement l’auteur, la licence et la vignette.
// - Une entrée { "none": true } signifie « pas d’image » : le script ne cherche plus.
// - Les entrées trouvées automatiquement portent "match": "auto" et le titre de la page
//   Wikipédia retenue : relisez-les avant de les considérer comme sûres.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, "data", f + ".json"), "utf8"));
const OUT = path.join(root, "data", "pictures.json");
const UA = "carte-acteurs-patrimoine/1.0 (https://github.com/paulbenard01/Organigramme-patrimoine-)";
const WP = "https://fr.wikipedia.org/w/api.php";
const COMMONS = "https://commons.wikimedia.org/w/api.php";
const THUMB = 400;

const args = process.argv.slice(2);
const refresh = args.includes("--refresh");
const metaOnly = args.includes("--meta");
const onlyArg = args.find((a, i) => args[i - 1] === "--only");
const only = onlyArg ? new Set(onlyArg.split(",")) : null;

export const norm = (s) => String(s || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
export const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(base, params, tries = 5) {
  const url = base + "?" + new URLSearchParams({ format: "json", formatversion: "2", maxlag: "5", ...params });
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA } });
    if (res.status === 429 || res.status >= 500) { await sleep(2000 * 2 ** i); continue; }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const j = await res.json();
    if (j.error && j.error.code === "maxlag") { await sleep(5000); continue; }
    await sleep(700);
    return j;
  }
  throw new Error(`échec après ${tries} essais : ${url}`);
}

// Entités à illustrer
const nodes = read("nodes"), museums = read("museums"), people = read("people");
const entities = [
  ...nodes.map((n) => ({ key: "n:" + n.id, q: n.wiki || n.name, exact: !!n.wiki, label: n.acronym })),
  ...museums.map((m) => ({ key: "m:" + slug(m.name), q: m.wiki || m.name, exact: !!m.wiki, label: m.name })),
  ...people.map((p) => ({ key: "p:" + slug(p.name), q: p.wiki || p.name, exact: !!p.wiki, label: p.name, person: true }))
];

const STOP = new Set(["de", "du", "des", "la", "le", "les", "et", "en", "au", "aux", "d", "l", "a", "pour", "sur", "par"]);
const words = (s) => norm(s).replace(/\(.*?\)/g, " ").split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w));
function similar(title, q) {
  const t = words(title), qs = new Set(words(q));
  if (!t.length) return 0;
  return t.filter((w) => qs.has(w)).length / t.length;
}

async function findOne(e) {
  if (e.exact) {
    const j = await api(WP, { action: "query", titles: e.q, redirects: "1", prop: "pageimages", piprop: "name", pilicense: "free" });
    const p = j.query.pages[0];
    return p && !p.missing && p.pageimage ? { file: p.pageimage, title: p.title, match: "wiki" } : null;
  }
  const j = await api(WP, { action: "query", generator: "search", gsrsearch: e.q, gsrlimit: "5", gsrnamespace: "0",
    prop: "pageimages", piprop: "name", pilicense: "free" });
  const pages = (j.query?.pages || []).sort((a, b) => a.index - b.index);
  const threshold = e.person ? 1 : 0.6;
  const best = pages.find((p) => similar(p.title, e.q) >= threshold && similar(e.q, p.title) >= (e.person ? 1 : 0.5));
  return best && best.pageimage ? { file: best.pageimage, title: best.title, match: "auto" } : null;
}

const strip = (html) => String(html || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
async function fillMeta(entries) {
  const files = [...new Set(entries.map((e) => e.file))];
  const info = {};
  for (let i = 0; i < files.length; i += 40) {
    const j = await api(COMMONS, { action: "query", titles: files.slice(i, i + 40).map((f) => "File:" + f).join("|"),
      prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: String(THUMB),
      iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|Credit|ImageDescription" });
    const norms = Object.fromEntries((j.query.normalized || []).map((x) => [x.to, x.from]));
    for (const p of j.query.pages) {
      const ii = p.imageinfo && p.imageinfo[0];
      const name = (norms[p.title] || p.title).replace(/^(File|Fichier):/, "");
      if (!ii) { info[name] = null; continue; }
      const m = ii.extmetadata || {};
      info[name] = {
        thumb: (ii.thumburl || ii.url).split("?")[0], w: ii.thumbwidth || ii.width, h: ii.thumbheight || ii.height,
        commons: ii.descriptionurl, artist: strip(m.Artist?.value).slice(0, 160) || "Auteur inconnu",
        license: strip(m.LicenseShortName?.value) || "voir Commons", licenseUrl: m.LicenseUrl?.value || ""
      };
    }
  }
  return info;
}

const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const result = { ...existing };
const todo = entities.filter((e) => {
  if (only && !only.has(e.key)) return false;
  const cur = existing[e.key];
  if (metaOnly) return false;
  if (cur && (cur.pinned || cur.none)) return false;
  return refresh || !cur || !!only;
});

console.log(`${entities.length} entités, ${todo.length} à chercher…`);
let found = 0;
for (const [i, e] of todo.entries()) {
  try {
    const r = await findOne(e);
    const prev = existing[e.key];
    if (r) { result[e.key] = { ...r, q: e.q, ...(prev && prev.file === r.file && prev.checked ? { checked: prev.checked } : {}) }; found++; }
    else delete result[e.key];
    process.stdout.write(`\r${i + 1}/${todo.length} · ${found} trouvées   `);
  } catch (err) { console.warn(`\n⚠ ${e.key}: ${err.message}`); }
}
console.log("");

const withFile = Object.entries(result).filter(([, v]) => v.file);
const info = await fillMeta(withFile.map(([, v]) => v));
for (const [k, v] of withFile) {
  const m = info[v.file];
  if (!m) { console.warn(`⚠ ${k}: fichier introuvable sur Commons (${v.file})`); if (!v.pinned) delete result[k]; continue; }
  result[k] = { ...v, ...m };
}

const keys = new Set(entities.map((e) => e.key));
for (const k of Object.keys(result)) if (!keys.has(k)) console.warn(`⚠ entrée orpheline (aucune entité) : ${k}`);
const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
const n = Object.values(sorted).filter((v) => v.thumb).length;
console.log(`✔ data/pictures.json : ${n} images pour ${entities.length} entités.`);
