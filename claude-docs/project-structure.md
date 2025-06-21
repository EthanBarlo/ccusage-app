# Claude Code Tracker - Project Structure

## Core File Trees

### IPC Communication Layer
```
src/helpers/ipc/ccusage/
├── ccusage-context.ts      # Exposes ccusage API to renderer via contextBridge
└── ccusage-listeners.ts    # Main process IPC handlers for executing ccusage CLI

src/preload/
└── index.ts               # Preload script that sets up window.ccusageApi
```

### Pages and UI Components
```
src/pages/
├── HomePage.tsx           # Dashboard with raw command output display
├── DailyPage.tsx         # Daily usage visualization with cost/token cards and charts
├── MonthlyPage.tsx       # Monthly aggregated data with trend charts
├── BlocksPage.tsx        # 5-hour billing window visualization
└── SecondPage.tsx        # Placeholder page with i18n support

src/renderer/components/
├── charts/
│   └── cost-chart.tsx    # Reusable line chart component using Recharts
├── layout/
│   ├── sidebar.tsx       # Main navigation sidebar
│   └── root.tsx          # Root layout with sidebar
├── ui/                   # shadcn/ui components
└── theme-switcher.tsx    # Dark/light mode toggle
```

### Hooks and Utilities
```
src/hooks/
└── use-ccusage.ts        # Custom hook for fetching ccusage data

src/lib/
├── utils.ts              # Utility functions (cn helper)
└── i18n/                 # Internationalization setup
```

### Electron Main Process
```
src/main/
├── main.ts               # Main entry point, window creation
├── preload.ts           # Preload configuration
└── utils/
    └── Constants.ts      # App constants and configuration
```

### Routing
```
src/router/
├── index.tsx            # TanStack Router setup
└── routes/              # Route definitions for each page
```

## Other Key Files

### Configuration Files
- `electron-forge.config.js` - Electron Forge build configuration
- `vite.config.ts` - Vite bundler configuration
- `tailwind.config.js` - Tailwind CSS v4 configuration
- `components.json` - shadcn/ui component configuration

### Project Documentation
- `CLAUDE.md` - Comprehensive project instructions and architecture guide
- `package.json` - Dependencies and scripts definition