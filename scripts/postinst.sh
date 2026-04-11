#!/bin/bash
# Post-install script for Loopi .deb package
# Creates the `loopi` CLI command in /usr/local/bin

CLI_JS="/usr/lib/loopi/resources/loopi-cli.js"
CLI_BIN="/usr/local/bin/loopi-cli"

if [ -f "$CLI_JS" ]; then
  cat > "$CLI_BIN" << 'WRAPPER'
#!/usr/bin/env node
require("/usr/lib/loopi/resources/loopi-cli.js");
WRAPPER
  chmod 755 "$CLI_BIN"
  echo "Loopi CLI installed at $CLI_BIN"
fi
