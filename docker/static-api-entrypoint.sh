#!/bin/bash

rm /tmp/.X${DISPLAY:1}-lock
echo "Starting Xvfb..."
Xvfb ${DISPLAY} -screen 0 "1024x768x24" &

# Start your node application
node /app/index.js