#!/usr/bin/env node
// Validate data/*.json, then inline it into src/template.html → dist/index.html
// Usage: node scripts/build.mjs          (validate + build)
//        node scripts/build.mjs --check  (validate only)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, "data", f + ".json"), "utf8"));
const FILES = ["meta", "bands", "nodes", "edges", "parcours", "legal", "glossary", "people", "museums"];
const data = Object.fromEntries(FILES.map((f) => [f, read(f)]));

const REL_TYPES = ["tut", "oct", "avis", "ges", "fin", "res", "loi", "lien"];
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);

// bands
const bandIds = new Set();
for (const b of data.bands) {
  if (!b.id || !b.name) err(`band sans id/nom: ${JSON.stringify(b)}`);
  if (bandIds.has(b.id)) err(`band en double: ${b.id}`);
  bandIds.add(b.id);
}

// nodes
const ids = new Set();
for (const n of data.nodes) {
  for (const k of ["id", "band", "group", "acronym", "name", "type", "desc"]) if (!n[k]) err(`nœud ${n.id || "?"}: champ « ${k} » manquant`);
  if (!/^[a-z0-9]+$/.test(n.id)) err(`id invalide (minuscules et chiffres seulement): ${n.id}`);
  if (ids.has(n.id)) err(`id en double: ${n.id}`);
  ids.add(n.id);
  if (!bandIds.has(n.band)) err(`nœud ${n.id}: bande inconnue ${n.band}`);
  if (n.url && !/^https:\/\//.test(n.url)) err(`nœud ${n.id}: url non https`);
  if (n.examples?.registry?.url && !/^https:\/\//.test(n.examples.registry.url)) err(`nœud ${n.id}: registre non https`);
  if (/[^\\]"/.test(n.desc) && n.desc.includes('"')) warnings.push(`nœud ${n.id}: guillemets droits dans la description (préférer « »)`);
}
const has = (id) => ids.has(id);

// edges
const degree = Object.fromEntries([...ids].map((i) => [i, 0]));
const seen = new Set();
for (const e of data.edges) {
  if (!has(e.source)) err(`lien: source inconnue ${e.source}`);
  if (!has(e.target)) err(`lien: cible inconnue ${e.target} (depuis ${e.source})`);
  if (!REL_TYPES.includes(e.type)) err(`lien ${e.source}→${e.target}: type inconnu ${e.type}`);
  if (e.source === e.target) err(`lien en boucle: ${e.source}`);
  const key = `${e.source}|${e.target}|${e.type}`;
  if (seen.has(key)) warnings.push(`lien en double: ${key}`);
  seen.add(key);
  if (has(e.source)) degree[e.source]++;
  if (has(e.target)) degree[e.target]++;
}
for (const [id, d] of Object.entries(degree)) if (d === 0) warnings.push(`nœud isolé (aucun lien): ${id}`);

// parcours
for (const p of data.parcours) {
  if (!p.id || !p.title || !Array.isArray(p.steps) || !p.steps.length) err(`parcours incomplet: ${p.id}`);
  p.steps.forEach((s, i) => { if (!has(s.node)) err(`parcours ${p.id} étape ${i + 1}: nœud inconnu ${s.node}`); });
}
// legal
for (const l of data.legal) {
  for (const t of l.texts || []) if (!has(t)) err(`droit ${l.id}: texte inconnu ${t}`);
  for (const a of l.actors || []) if (!has(a)) err(`droit ${l.id}: acteur inconnu ${a}`);
}
// glossary
for (const g of data.glossary) for (const s of g.see || []) if (!has(s)) err(`glossaire ${g.term}: renvoi inconnu ${s}`);
// people
for (const p of data.people) {
  if (!p.name || !p.role || !p.level) err(`personne incomplète: ${JSON.stringify(p)}`);
  if (p.node && !has(p.node)) err(`personne ${p.name}: nœud inconnu ${p.node}`);
  if (!p.source && p.node) warnings.push(`personne ${p.name}: pas de source`);
}
// museums
for (const m of data.museums) {
  if (!m.name || !m.family) err(`musée incomplet: ${JSON.stringify(m)}`);
  if (m.owner && !has(m.owner)) err(`musée ${m.name}: rattachement inconnu ${m.owner}`);
}

// key roles per level
for (const lvl of data.meta.keyRoles || []) for (const r of lvl.roles) if (!has(r.node)) err(`rôle « ${r.title} » : nœud inconnu ${r.node}`);

for (const w of warnings) console.warn("⚠", w);
if (errors.length) {
  for (const e of errors) console.error("✖", e);
  console.error(`\n${errors.length} erreur(s). Build interrompu.`);
  process.exit(1);
}
console.log(`✔ Données valides : ${data.nodes.length} nœuds, ${data.edges.length} liens, ${data.parcours.length} parcours, ${data.legal.length} thèmes juridiques, ${data.glossary.length} termes, ${data.people.length} personnes, ${data.museums.length} musées.`);

if (process.argv.includes("--check")) process.exit(0);

const template = fs.readFileSync(path.join(root, "src", "template.html"), "utf8");
const marker = "/*__APP_DATA__*/null";
if (!template.includes(marker)) { console.error("✖ Marqueur /*__APP_DATA__*/null absent du template"); process.exit(1); }
const json = JSON.stringify(data)
  .replace(/</g, "\\u003c")
  .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
  .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");
const html = template.replace(marker, () => json);
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist", "index.html"), html);
console.log(`✔ dist/index.html écrit (${(html.length / 1024).toFixed(0)} Ko)`);
