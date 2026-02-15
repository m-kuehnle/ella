#!/bin/bash

# Kill any existing server on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null

echo "Starting Valentine's Game Server with Logging..."

# Use the custom server.py instead of the one-liner
python3 server.py
