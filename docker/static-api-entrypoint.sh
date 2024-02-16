#!/bin/bash

# Check if DISPLAY is already in use
if ! ps aux | grep -q "[X]vfb.*${DISPLAY}"; then
  echo "Starting Xvfb..."
  # Start Xvfb
  Xvfb ${DISPLAY} -screen 0 "1024x768x24" &
else
  echo "Xvfb is already running on ${DISPLAY}"
fi

# Start your node application
node /app/index.js