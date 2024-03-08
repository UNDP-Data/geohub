#!/bin/sh
xvfb-run -a --server-args="-screen 0 1024x768x24" -- node /app/index.js

# # rm /tmp/.X${DISPLAY:1}-lock
# echo "Starting Xvfb..."
# Xvfb ${DISPLAY} -screen 0 "1024x768x24" &

# # Start your node application
# node /app/index.js
