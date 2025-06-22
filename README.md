# Ccusage

A beautiful desktop application for visualizing Claude Code usage statistics. Track your Claude Code token usage, costs, and billing periods with an intuitive interface.

<div align="center">
  <img src="build-resources/icon-256.png" alt="Ccusage Icon" width="128" height="128">
</div>

## Features

- **Real-time Usage Tracking**: Monitor your current Claude Code session with live updates
- **Comprehensive Analytics**: View daily, monthly, and session-based usage statistics
- **Active Session Monitor**: See countdown timers, burn rates, and projected costs for active sessions
- **Project Management**: Organize and rename your Claude Code projects
- **Billing Period Tracking**: Automatically tracks usage within your billing cycle
- **Cross-Platform**: Works on macOS, Windows, and Linux

## Why Ccusage?

If you're using Claude Code, you need visibility into your token usage and costs. Ccusage provides:

- **Cost Control**: Know exactly how much you're spending on Claude Code
- **Usage Insights**: Understand your usage patterns across different projects
- **Plan Optimization**: See if you're maximizing your plan limits (max5, max20, or pro)
- **Project Organization**: Keep track of different coding projects with custom names

## Installation

### Download

Grab the installers from the **[latest release](https://github.com/EthanBarlo/ccusage-app/releases/latest)**.

Direct links for v1.0.1:

- **macOS (Apple Silicon)** – [Ccusage-darwin-arm64-1.0.1.zip](https://github.com/EthanBarlo/ccusage-app/releases/download/v1.0.1/Ccusage-darwin-arm64-1.0.1.zip)
- **Windows** – [Ccusage-1.0.1 Setup.exe](https://github.com/EthanBarlo/ccusage-app/releases/download/v1.0.1/Ccusage-1.0.1.Setup.exe)
- **Linux (DEB, amd64)** – [ccusage_1.0.1_amd64.deb](https://github.com/EthanBarlo/ccusage-app/releases/download/v1.0.1/ccusage_1.0.1_amd64.deb)
- **Linux (RPM, x86_64)** – [ccusage-1.0.1-1.x86_64.rpm](https://github.com/EthanBarlo/ccusage-app/releases/download/v1.0.1/ccusage-1.0.1-1.x86_64.rpm)

---

### Unsigned builds & security warnings

These artifacts are **not** code-signed.

- **macOS** – Gatekeeper may say “is damaged and can’t be opened”.
  1. Right-click → Open once, _or_
  2. Remove the quarantine flag:
     ```bash
     xattr -dr com.apple.quarantine /path/to/Ccusage.app
     ```
- **Windows** – SmartScreen will show “unrecognized app”. Click “More info → Run anyway”.
- **Linux** – The DEB/RPM installs normally; for the portable ZIP make the binary executable (`chmod +x`).

---

### Build from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-code-tracker.git
cd claude-code-tracker

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for your platform
npm run make
```

## Prerequisites

- [ccusage CLI](https://github.com/claudeai/ccusage) - The app uses `npx ccusage@latest` commands internally
- Node.js 18 or higher (for building from source)

## Tech Stack

- **Electron**: Cross-platform desktop framework
- **React 19**: Modern UI framework with TypeScript
- **shadcn/ui**: Beautiful UI components
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool
- **date-fns**: Date manipulation and formatting

## Screenshots

### Dashboard
View your overall usage statistics and current billing period progress.

### Active Session
Monitor your current Claude Code session with real-time updates, countdown timer, and burn rate.

### Projects
Organize and track usage across different coding projects with custom naming.

### Daily Usage
Visualize your daily token usage and costs over the past 14 days.

## Configuration

The app stores configuration and cached data in:

- **macOS**: `~/Library/Application Support/ccusage/`
- **Windows**: `%APPDATA%/ccusage/`
- **Linux**: `~/.config/ccusage/`

## Development

### Project Structure

```plaintext
ccusage-gui/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React app (renderer process)
│   │   ├── components/ # React components
│   │   ├── pages/      # Application pages
│   │   ├── hooks/      # Custom React hooks
│   │   └── lib/        # Utilities and services
│   └── preload/        # Electron preload scripts
├── electron/           # Electron configuration
└── build-resources/    # Build assets (icons, etc.)
```

### Key Features Implementation

- **IPC Communication**: Secure communication between main and renderer processes
- **Data Caching**: Smart caching to reduce API calls with cache age indicators
- **Auto-refresh**: Active session page refreshes every 15 seconds
- **Persistent Storage**: Custom project names saved locally
- **Date Range Filtering**: Automatic filtering based on billing periods

### Available Scripts

```bash
# Development
npm run dev          # Start the app in development mode
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier

# Building
npm run build        # Build the app
npm run make         # Create platform-specific distributables

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Troubleshooting

### ccusage command not found

If you encounter "ccusage: command not found" errors:

1. Ensure you have Node.js and npm installed
2. The app will automatically use `npx ccusage@latest` to run commands
3. Check your internet connection as npx needs to download the package

### Build Issues

If you have issues building the app:

1. Ensure you're using Node.js 18 or higher
2. Delete `node_modules` and `package-lock.json`, then run `npm install`
3. For macOS, you may need to install Xcode Command Line Tools

## Credits

Built with [electron-shadcn](https://github.com/LuanRoger/electron-shadcn) template.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
