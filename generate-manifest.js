const fs = require('fs');
const path = require('path');

// Simple line-based YAML parser — reads scalar fields, stops at `query: |`
function parseYaml(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const obj = {};
  for (const line of lines) {
    if (/^query:\s*\|/.test(line)) break;
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

// ── detections-manifest.json ──────────────────────────────────────────────────
const detectionPlatforms = ['kql', 'sigma', 'xql'];
const detections = [];

for (const platform of detectionPlatforms) {
  const dir = path.join(ROOT, 'detections', platform);
  for (const filePath of walkDir(dir)) {
    const raw = parseYaml(filePath);
    detections.push({
      title:         raw.title         || '',
      tactic:        raw.tactic        || '',
      tacticName:    raw.tacticName    || '',
      technique:     raw.technique     || '',
      techniqueName: raw.techniqueName || '',
      description:   raw.description   || '',
      platform,
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
const quicktraceCategories = ['auth', 'network', 'endpoint', 'cloud'];
const quicktrace = [];

for (const cat of quicktraceCategories) {
  const dir = path.join(ROOT, 'quicktrace', cat);
  for (const filePath of walkDir(dir)) {
    const raw = parseYaml(filePath);
    quicktrace.push({
      title:       raw.title       || '',
      category:    raw.category    || cat,
      platform:    raw.platform    || '',
      description: raw.description || '',
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
const pulseDir = path.join(ROOT, 'pulse');
const pulseFiles = walkDirRecursive(pulseDir);
const pulse = [];

for (const filePath of pulseFiles) {
  const raw = parseYaml(filePath);
  pulse.push({
    title:       raw.title       || '',
    threat:      raw.threat      || '',
    cve:         raw.cve         || '',
    date:        raw.date        || '',
    platform:    raw.platform    || '',
    description: raw.description || '',
    file: path.relative(ROOT, filePath).replace(/\\/g, '/'),
  });
}

fs.writeFileSync(
  path.join(ROOT, 'pulse-manifest.json'),
  JSON.stringify(pulse, null, 2)
);
console.log(`pulse-manifest.json — ${pulse.length} entries`);
