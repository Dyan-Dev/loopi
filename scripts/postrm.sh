#!/bin/bash
# Post-remove script for Loopi .deb package
# Removes the `loopi` CLI command

CLI_BIN="/usr/local/bin/loopi-cli"

if [ -f "$CLI_BIN" ]; then
  rm -f "$CLI_BIN"
  echo "Loopi CLI removed from $CLI_BIN"
fi
