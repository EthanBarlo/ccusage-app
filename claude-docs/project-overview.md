# Claude Code Tracker - Project Overview

## Project Goals

The Claude Code Tracker is designed to be a comprehensive desktop application for visualizing and managing Claude Code usage statistics. The key objectives are:

1. **Real-time Usage Monitoring**: Execute and display ccusage CLI data in a user-friendly graphical interface
2. **Plan Management**: Track usage against subscription limits (max5: 500k tokens, max20: 2M tokens, pro: unlimited)
3. **Historical Tracking**: Store and visualize usage trends over time
4. **Multi-view Analytics**: Provide daily, monthly, session, and 5-hour block views of usage data
5. **Cross-platform Desktop App**: Work seamlessly on Windows, macOS, and Linux

## Current Project Status

### ✅ Completed Features

1. **Core Architecture**
   - Electron app with proper security setup (context isolation, IPC via contextBridge)
   - React + TypeScript renderer with modern tooling (Vite, TanStack Router)
   - Successful integration with ccusage CLI via `npx ccusage@latest`

2. **Working Pages**
   - **Home Page** (`src/pages/HomePage.tsx`): Basic dashboard with command buttons
   - **Daily Page** (`src/pages/DailyPage.tsx`): Shows daily costs, tokens, and 7-day trend chart
   - **Monthly Page** (`src/pages/MonthlyPage.tsx`): Displays monthly totals and historical trends
   - **Blocks Page** (`src/pages/BlocksPage.tsx`): Visualizes 5-hour billing windows with activity status

3. **UI Components**
   - Integrated shadcn/ui component library
   - Dark/light theme switching
   - Responsive sidebar navigation
   - Reusable chart components with Recharts

4. **Data Flow**
   - Custom `useCcusage` hook (`src/hooks/use-ccusage.ts`) for data fetching
   - IPC communication layer (`src/helpers/ipc/ccusage/`)
   - JSON parsing and display of ccusage output

### ❌ Not Yet Implemented

1. **Plan Configuration**
   - Settings page to select active plan (max5, max20, pro)
   - Visual indicators showing usage relative to plan limits
   - Token limit warnings and notifications

2. **Data Persistence**
   - electron-store integration for caching usage data
   - Historical data storage beyond current session
   - User preferences storage (plan type, reset date)

3. **Missing Pages**
   - **Sessions Page**: Route exists but no implementation
   - **Settings Page**: Link in sidebar but no page created

4. **Enhanced Features**
   - Monthly billing cycle reset date configuration
   - Auto-refresh functionality with configurable intervals
   - Export functionality for usage data
   - Proper error handling and user-friendly error messages

5. **Testing**
   - Unit tests for utilities and hooks
   - Integration tests for IPC communication
   - E2E tests with Playwright

## Technical Implementation Details

### Data Fetching Pattern
The app uses a consistent pattern for fetching ccusage data:
1. User triggers action (button click or page load)
2. React component calls `useCcusage` hook
3. Hook invokes `window.ccusageApi.runCommand()`
4. Main process executes CLI command with `--json` flag
5. Parsed JSON data returns to renderer for display

### Key Files for Core Functionality
- **IPC Setup**: `src/helpers/ipc/ccusage/ccusage-listeners.ts`
- **Data Hook**: `src/hooks/use-ccusage.ts`
- **Page Components**: `src/pages/*.tsx`
- **Chart Component**: `src/renderer/components/charts/cost-chart.tsx`

## Next Steps Priority

1. **Settings Page**: Implement plan selection and reset date configuration
2. **Data Persistence**: Add electron-store for caching usage data
3. **Sessions Page**: Create session-based usage visualization
4. **Plan Limits**: Add visual indicators for token usage vs limits
5. **Error Handling**: Improve error states and user feedback