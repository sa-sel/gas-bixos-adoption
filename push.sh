#!/bin/bash

mkdir -p .build

if [ -f ".env" ]; then
  source ".env"
fi

if [ ! -f ".clasp.json" ]; then
  clasp clone "$SCRIPT_ID" --rootDir ".build" >> /dev/null
else
  clasp settings "rootDir" ".build" >> /dev/null
  clasp settings "scriptId" "$SCRIPT_ID" >> /dev/null
fi

npm run build

cp "appsscript.json" ".claspignore" ".clasp.json" ".build"
clasp push
