const fs = require('fs');
const path = require('path');

// Simple line-based YAML parser — reads scalar fields, stops at `query: |` or `queries:`
function parseYaml(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const obj = {};
  for (const line of lines) {
    if (/^query\s*:\s*\|/.test(line)) break;
    if (/^queries\s*:/.test(line)) break;
    const match = line.match(/^([a-zA-Z_]+):\s*(.*)/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      // Strip surrounding quotes if present
      obj[key] = val.replace(/^['"]|['"]$/g, '');
    }
  }
  return obj;
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map(f => path.join(dir, f));
}

function walkDirRecursive(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDirRecursive(full));
    } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
      results.push(full);
    }
  }
  return results;
}

const ROOT = __dirname;

// ── shared metadata helpers ─────────────────────────────────────────────────
// Common schema across detections / quicktrace / pulse / hunt:
//   category, tactic, tacticName, technique, techniqueName, tags, platforms, verified
function splitList(val) {
  return val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
}

// ── detections-manifest.json ──────────────────────────────────────────────────
const detectionPlatforms = ['kql', 'sigma', 'xql'];
const detections = [];

for (const platform of detectionPlatforms) {
  const dir = path.join(ROOT, 'detections', platform);
  for (const filePath of walkDir(dir)) {
    const raw = parseYaml(filePath);
    detections.push({
      title:         raw.title         || '',
      category:      raw.category      || '',
      tactic:        raw.tactic        || '',
      tacticName:    raw.tacticName    || '',
      technique:     raw.technique     || '',
      techniqueName: raw.techniqueName || '',
      tags:          splitList(raw.tags),
      description:   raw.description   || '',
      platform,
      platforms:     raw.platforms ? splitList(raw.platforms) : [platform],
      verified:      raw.verified  ? splitList(raw.verified) : [platform],
      file: path.relative(ROOT, filePath).replace(/\\/g, '/'),
    });
  }
}

fs.writeFileSync(
  path.join(ROOT, 'detections-manifest.json'),
  JSON.stringify(detections, null, 2)
);
console.log(`detections-manifest.json — ${detections.length} entries`);

// ── quicktrace-manifest.json ──────────────────────────────────────────────────
const quicktraceCategories = [
  'auth', 'network', 'endpoint', 'cloud', 'siem',
  'identity', 'application-identities', 'oauth', 'email', 'collaboration'
];
const quicktrace = [];

for (const cat of quicktraceCategories) {
  const dir = path.join(ROOT, 'quicktrace', cat);
  for (const filePath of walkDir(dir)) {
    const raw = parseYaml(filePath);
    quicktrace.push({
      title:         raw.title         || '',
      category:      raw.category      || cat,
      tactic:        raw.tactic        || '',
      tacticName:    raw.tacticName    || '',
      technique:     raw.technique     || '',
      techniqueName: raw.techniqueName || '',
      tags:          splitList(raw.tags),
      platforms:     raw.platforms ? splitList(raw.platforms) : (raw.platform ? [raw.platform] : []),
      verified:      raw.verified  ? splitList(raw.verified) : [],
      description:   raw.description   || '',
      dateAdded:     raw.date_added    || '',
      file: path.relative(ROOT, filePath).replace(/\\/g, '/'),
    });
  }
}

fs.writeFileSync(
  path.join(ROOT, 'quicktrace-manifest.json'),
  JSON.stringify(quicktrace, null, 2)
);
console.log(`quicktrace-manifest.json — ${quicktrace.length} entries`);

// ── pulse-manifest.json ───────────────────────────────────────────────────────
// Includes both pulse/ (CVE / threat-actor intel) and hunt/ (generic hunt queries)
const pulseFiles = [
  ...walkDirRecursive(path.join(ROOT, 'pulse')),
  ...walkDirRecursive(path.join(ROOT, 'hunt')),
];
const pulse = [];

for (const filePath of pulseFiles) {
  const raw = parseYaml(filePath);
  pulse.push({
    title:         raw.title         || '',
    threat:        raw.threat        || '',
    cve:           raw.cve           || '',
    date:          raw.date          || '',
    category:      raw.category      || '',
    tactic:        raw.tactic        || '',
    tacticName:    raw.tacticName    || '',
    technique:     raw.technique     || '',
    techniqueName: raw.techniqueName || '',
    tags:          splitList(raw.tags),
    platform:      raw.platform      || '',
    platforms:     raw.platforms ? splitList(raw.platforms) : (raw.platform ? [raw.platform] : []),
    verified:      raw.verified  ? splitList(raw.verified) : (raw.platform ? [raw.platform] : []),
    description:   raw.description   || '',
    file: path.relative(ROOT, filePath).replace(/\\/g, '/'),
  });
}

fs.writeFileSync(
  path.join(ROOT, 'pulse-manifest.json'),
  JSON.stringify(pulse, null, 2)
);
console.log(`pulse-manifest.json — ${pulse.length} entries`);
