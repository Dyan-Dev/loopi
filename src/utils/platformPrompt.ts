/**
 * Returns the OS-specific shell/command section injected into every AI system prompt.
 * Keeps Chat, Telegram, and any future entrypoint in sync automatically.
 *
 * @param platform - Node's process.platform value ("win32" | "darwin" | "linux" | ...)
 */
export function buildPlatformShellNote(platform: string): string {
  if (platform === "win32") {
    return `## Platform: Windows
run-command uses PowerShell. Write native PowerShell — do NOT wrap in \`powershell -command "..."\`.
- Open apps: \`Start-Process notepad\`, \`Start-Process calc\`
- Create dirs: \`New-Item -ItemType Directory -Force "$env:USERPROFILE\\Desktop\\MyFolder"\`
- Write files: \`Set-Content "$env:TEMP\\file.txt" "content"\`
- Read files: \`Get-Content "$env:TEMP\\file.txt"\`
- User paths: \`$env:USERPROFILE\`, \`$env:APPDATA\`, \`$env:TEMP\` — never hardcode \`C:\\Users\\...\`
- Screenshots: prefer the \`desktopScreenshot\` workflow step; for run-command use:
  \`Add-Type -AssemblyName System.Windows.Forms,System.Drawing; $s=[System.Windows.Forms.Screen]::PrimaryScreen; $b=New-Object System.Drawing.Bitmap($s.Bounds.Width,$s.Bounds.Height); $g=[System.Drawing.Graphics]::FromImage($b); $g.CopyFromScreen($s.Bounds.Location,[System.Drawing.Point]::Empty,$s.Bounds.Size); $b.Save("$env:USERPROFILE\\Desktop\\screenshot.png"); $g.Dispose(); $b.Dispose()\`
- Notifications: \`Add-Type -AssemblyName System.Windows.Forms; $n=New-Object System.Windows.Forms.NotifyIcon; $n.Icon=[System.Drawing.SystemIcons]::Information; $n.Visible=$true; $n.ShowBalloonTip(5000,'Loopi','Message',[System.Windows.Forms.ToolTipIcon]::Info)\`
- Schedule: \`schtasks /create /tn "TaskName" /tr "powershell -File $env:TEMP\\script.ps1" /sc MINUTE /mo 5 /f\`
- ALWAYS write scripts/data to \`$env:TEMP\` or \`$env:APPDATA\` — never to \`C:\\\` root (access denied)
- Chain commands with \`;\` or use separate run-command blocks`;
  }

  if (platform === "darwin") {
    return `## Platform: macOS
run-command uses /bin/zsh.
- Open apps: \`open -a "App Name"\`, \`open ~/Desktop/file.txt\`, \`open https://example.com\`
- Screenshots: \`screencapture ~/Desktop/screenshot.png\` (built-in, no extra tools needed)
- Notifications: \`osascript -e 'display notification "Body" with title "Title"'\`
- Create dirs: \`mkdir -p ~/path/to/dir\`
- Write files: \`echo "content" > ~/Desktop/file.txt\`
- Schedule: cron via \`crontab -e\` or launchd plists in ~/Library/LaunchAgents/
- User paths: \`$HOME\`, \`~/Desktop\`, \`~/Documents\`, \`~/Library\`
- Chain commands: \`&&\` or \`;\` or separate run-command blocks`;
  }

  // Linux (and any other Unix-like platform)
  return `## Platform: Linux
run-command uses /bin/bash.
- Open files/URLs: \`xdg-open file\` or \`xdg-open https://example.com\`
- Screenshots: \`scrot ~/Desktop/screenshot.png\` or \`gnome-screenshot -f ~/Desktop/shot.png\` or \`import -window root ~/Desktop/screenshot.png\`
- Notifications: \`notify-send "Title" "Body"\`
- Create dirs: \`mkdir -p ~/path/to/dir\`
- Write files: \`echo "content" > ~/Desktop/file.txt\`
- Schedule: cron via \`crontab -e\`
- User paths: \`$HOME\`, \`~/Desktop\`, \`~/Documents\`
- Chain commands: \`&&\` or \`;\` or separate run-command blocks`;
}
