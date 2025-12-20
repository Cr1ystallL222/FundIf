#!/bin/sh
set -e

npm install --legacy-peer-deps
npm run dev -- --hostname 0.0.0.0 --port $PORT
