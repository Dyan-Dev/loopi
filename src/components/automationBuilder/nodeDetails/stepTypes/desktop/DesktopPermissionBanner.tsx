export function DesktopPermissionBanner() {
  return (
    <div className="bg-blue-50 p-3 rounded border border-blue-200">
      <p className="text-xs font-semibold mb-1">Desktop Control</p>
      <p className="text-xs text-blue-700">
        Controls the system cursor/keyboard outside the browser. On macOS, grant Accessibility
        permission in System Settings &gt; Privacy &amp; Security &gt; Accessibility.
      </p>
    </div>
  );
}
