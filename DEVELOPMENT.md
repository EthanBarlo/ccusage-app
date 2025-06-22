# Ccusage GUI – Development Notes

This document contains everything maintainers and contributors need to work on the code-base. End-users should refer to the main README for downloads and usage.

## Project Structure

```text
ccusage-gui/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React (renderer) with shadcn/ui + Tailwind
│   ├── preload/        # Context-isolated bridges
│   └── styles/
├── forge.config.ts     # Electron-Forge, makers & publishers
├── .github/workflows/  # CI build & release
└── build-resources/    # Icons etc.
```

## Scripts

```bash
npm start      # Electron + Vite dev
npm run make   # Create distributables locally
npm run publish  # make + upload (needs env vars)
```

## Environment

* Node 20+
* pnpm / npm 10 (project uses lockfile v3)
* macOS requires Xcode CLT for native deps

## Release Workflow

CI builds for macOS, Windows, Linux when a tag `v*` is pushed.  
Secrets needed for signing:

```
GITHUB_TOKEN        # provided by Actions
CSC_LINK            # base64 Developer ID .p12 (macOS)
CSC_KEY_PASSWORD    # password for the p12
```

## Troubleshooting

### ccusage command not found
Make sure the global CLI is installed:
```bash
npm i -g ccusage
```

### macOS Gatekeeper says “damaged”
Unsigned build – remove quarantine flag:
```bash
xattr -dr com.apple.quarantine Ccusage.app
```

### Rebuild native modules
```bash
electron-forge rebuild
```

---

Contributions welcome – open issues or PRs!
