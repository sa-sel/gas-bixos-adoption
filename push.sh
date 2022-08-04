#!/bin/bash
npm run build

if [ -f ".env" ]; then
  source .env
fi

clasp settings rootDir .build
clasp settings scriptId "$SCRIPT_ID"
cp appsscript.json .claspignore .clasp.json .build
clasp push
