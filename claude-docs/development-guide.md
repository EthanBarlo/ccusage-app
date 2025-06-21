# Claude Code Tracker - Development Guide

## Quick Start

The project uses a standard Electron + React setup with TypeScript. Key commands:

```bash
npm run dev      # Start development server
npm test         # Run tests
npm run build    # Build for production
```

## Adding New Features

### Creating a New Page

1. Create page component in `src/pages/`
2. Add route in `src/router/routes/`
3. Update sidebar navigation in `src/renderer/components/layout/sidebar.tsx`

### Adding a New ccusage Command

1. Add IPC handler in `src/helpers/ipc/ccusage/ccusage-listeners.ts`
2. Use `useCcusage` hook in your component
3. Parse and display the JSON response

### Key Integration Points

#### ccusage CLI Commands
- **daily**: `npx ccusage@latest daily --json`
- **monthly**: `npx ccusage@latest monthly --json`
- **blocks**: `npx ccusage@latest blocks --json`
- **session**: `npx ccusage@latest session --json` (not yet implemented)

#### Data Hook Usage
```typescript
// In your component
const { data, isLoading, error } = useCcusage('daily');
```

#### Chart Integration
Use the reusable `CostChart` component from `src/renderer/components/charts/cost-chart.tsx`

## Important Patterns

### IPC Communication
- All ccusage commands run in main process
- Renderer accesses via `window.ccusageApi`
- Commands always include `--json` flag

### State Management
- Currently using React hooks for local state
- No global state management yet
- Data fetched on-demand, not cached

### UI Components
- Use shadcn/ui components from `src/renderer/components/ui/`
- Follow existing card/chart patterns for consistency
- Dark mode support is automatic via theme context

## Current Architecture Decisions

1. **No Local ccusage Installation**: Uses `npx ccusage@latest` for always-latest version
2. **JSON-only Output**: All commands use `--json` flag for consistent parsing
3. **Page-based Organization**: Each view is a separate page component
4. **Minimal Dependencies**: Only essential packages included

## Areas Needing Work

1. **Error Boundaries**: Add proper error handling for failed commands
2. **Loading States**: Improve loading UX beyond basic spinners
3. **Data Validation**: Add schemas for ccusage response validation
4. **Performance**: Consider data caching to reduce CLI calls
5. **Testing Coverage**: No tests currently implemented