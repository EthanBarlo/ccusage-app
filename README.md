# Ccusage

A desktop **viewer** for the [ccusage CLI](https://github.com/ryoppippi/ccusage). It gives the same rich analytics in a native window – charts, live session monitor, navigation – using the JSON output of the command-line tool.

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

> **Prerequisite** – install the underlying CLI first:
> ```bash
> npm i -g ccusage
> ```
> The desktop app shells out to `ccusage` under the hood; without it the charts will be empty.


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

## Development

Developer setup, architecture and troubleshooting have been moved to **[DEVELOPMENT.md](DEVELOPMENT.md)** to keep this README focused for end-users.


## Credits

Built with [electron-shadcn](https://github.com/LuanRoger/electron-shadcn) template.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
