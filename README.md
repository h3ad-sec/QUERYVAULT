# QUERYVAULT

**Unified Detection and Query Data Repository**

QUERYVAULT is the central data repository that powers TRACERULES, QUICKTRACE, and TRACEPULSE — the three query tools in the [H3AD-SEC](https://h3ad-sec.github.io) platform. All queries are stored as YAML files, and manifest files are generated automatically.

## Structure

```
QUERYVAULT/
├── detections/
│   ├── kql/          # KQL detection rules → TRACERULES
│   ├── sigma/        # Sigma detection rules → TRACERULES
│   └── xql/          # XQL detection rules → TRACERULES
├── quicktrace/
│   ├── auth/         # Authentication queries → QUICKTRACE
│   ├── network/      # Network queries → QUICKTRACE
│   ├── endpoint/     # Endpoint queries → QUICKTRACE
│   └── cloud/        # Cloud queries → QUICKTRACE
├── pulse/
│   └── 2025/         # Threat-specific packs → TRACEPULSE
├── generate-manifest.js
├── detections-manifest.json
├── quicktrace-manifest.json
└── pulse-manifest.json
```

## Adding Queries

1. Drop a YAML file in the appropriate folder.
2. Run `node generate-manifest.js` to regenerate all manifests.
3. Push — the tools pick up new queries on next page load.

## YAML Schemas

**TRACERULES (detections/)**
```yaml
title: ...
tactic: TA00XX
tacticName: ...
technique: T1XXX.XXX
techniqueName: ...
description: ...
query: |
  <query content>
```

**QUICKTRACE (quicktrace/)**
```yaml
title: ...
category: auth | network | endpoint | cloud
platform: kql | sigma | xql
description: ...
query: |
  <query content>
```

**TRACEPULSE (pulse/)**
```yaml
title: ...
threat: <actor or campaign>   # optional
cve: CVE-XXXX-XXXXX           # optional
date: YYYY-MM-DD              # optional
platform: kql | sigma | xql
description: ...
query: |
  <query content>
```

## Used By

- [TRACERULES](https://h3ad-sec.github.io/TRACERULES/) — detection query arsenal
- [QUICKTRACE](https://h3ad-sec.github.io/QUICKTRACE/) — daily SOC workflow queries
- [TRACEPULSE](https://h3ad-sec.github.io/TRACEPULSE/) — threat-specific query packs


## H3AD-SEC Platform Modules

| Module | Tools |
|--------|-------|
| [H3AD-X](https://h3ad-sec.github.io/H3AD-X/) | X-VERDIKT, PARSE-X, DNSCOPE |
| [H3AD-AI](https://h3ad-sec.github.io/H3AD-AI/) | INSIGHT-AI, QUERYCRAFT-AI, FPLENS-AI, ATTMAP-AI, CHRONO-AI, MALBRIEF-AI |
| [H3AD-DETECT](https://h3ad-sec.github.io/H3AD-DETECT/) | TRACERULES |
| [H3AD-HUNT](https://h3ad-sec.github.io/H3AD-HUNT/) | HYPOS, PIVEX, TRACEPULSE |
| [H3AD-OPS](https://h3ad-sec.github.io/H3AD-OPS/) | QUICKTRACE, SHIFTLOG, PHISHOPS |
| [H3AD-DF](https://h3ad-sec.github.io/H3AD-DF/) | REGSCOPE |
| [H3AD-IR](https://h3ad-sec.github.io/H3AD-IR/) | — |
