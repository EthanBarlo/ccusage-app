# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the claude-code-tracker project - an Electron desktop application that visualizes Claude Code usage statistics by running the `ccusage` CLI tool. The app provides a graphical interface to display usage data and track it relative to subscription plans (max5, max20, or pro).

## Key Architecture

### Technology Stack

- **Electron**: Cross-platform desktop application framework
- **React**: UI framework with TypeScript
- **shadcn/ui**: Component library built on Radix UI and Tailwind CSS
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server

### Project Structure

```
claude-code-tracker/
├── src/
│   ├── main/           # Electron main process (runs ccusage commands)
│   ├── renderer/       # React app (renderer process)
│   │   ├── components/ # React components with shadcn/ui
│   │   ├── lib/        # Utilities (data storage, formatting)
│   │   └── hooks/      # Custom React hooks
│   └── preload/        # Electron preload scripts
├── electron/           # Electron configuration files
└── public/            # Static assets
```

### Core Features

- **ccusage Integration**: Execute ccusage CLI commands and capture output
- **Data Visualization**: Display daily, monthly, session, and blocks reports
- **Plan Configuration**: Set active plan (max5, max20, or pro) to visualize limits
- **Reset Date Setting**: Configure monthly billing cycle reset date
- **Data Persistence**: Store historical usage data locally
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (starts both Electron and Vite)
npm run dev

# Build for production
npm run build

# Build for specific platform
npm run build:mac
npm run build:win
npm run build:linux

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

## Key Implementation Details

### Running ccusage Commands

The app executes ccusage commands via Electron's main process:

```typescript
// main process
ipcMain.handle('run-ccusage', async (event, args) => {
  const { exec } = require('child_process');
  // Run: npx ccusage@latest [command] --json
  return new Promise((resolve, reject) => {
    exec(`npx ccusage@latest ${args} --json`, (error, stdout) => {
      if (error) reject(error);
      else resolve(JSON.parse(stdout));
    });
  });
});
```

### Available ccusage Commands

- `daily`: Daily usage reports
- `monthly`: Monthly aggregated reports
- `session`: Session-based reports
- `blocks`: Session-based billing window reports

### Data Storage

Store fetched data and user preferences using electron-store:

- Plan type (max5, max20, pro)
- Reset date
- Historical usage data from ccusage

### Plan Token Limits

Display usage relative to plan limits:

- **max5**: 500,000 tokens per session
- **max20**: 2,000,000 tokens per session
- **pro**: Unlimited

### Electron Security

- Use contextBridge for secure IPC communication
- Enable context isolation
- Disable node integration in renderer
- Sanitize command arguments before execution

### UI Components

Use shadcn/ui components for consistent design:

- Cards for displaying usage statistics
- Charts for visualizing trends
- Tables for detailed data views
- Toast notifications for status updates

## Testing Strategy

```bash
# Unit tests for utility functions
npm run test:unit

# Integration tests for Electron IPC
npm run test:integration

# E2E tests with Playwright
npm run test:e2e
```

## Important Patterns

### Executing CLI Commands

Always execute ccusage commands from the main process:

```typescript
// renderer process
const data = await window.api.runCcusage('daily --since 20250101');
```

### Error Handling

- Handle ccusage command failures gracefully
- Show user-friendly error messages
- Provide fallback UI when ccusage is not available

### Data Refresh

- Add manual refresh button
- Optional auto-refresh interval
- Show loading states during command execution

## Configuration

User preferences and cached data stored in:

- **macOS**: `~/Library/Application Support/claude-code-tracker/`
- **Windows**: `%APPDATA%/claude-code-tracker/`
- **Linux**: `~/.config/claude-code-tracker/`

## Build & Distribution

The app uses electron-builder for packaging:

```json
{
  "build": {
    "appId": "com.claudecodetracker.app",
    "productName": "Claude Code Tracker",
    "directories": {
      "output": "dist"
    }
  }
}
```

## Dependencies

The app depends on the ccusage CLI tool being available via npx. No local installation required as it runs `npx ccusage@latest` commands.