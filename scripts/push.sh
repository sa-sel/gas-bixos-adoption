#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"/..

./scripts/setup-clasp.sh

mkdir -p .build
npm run build
cp "appsscript.json" ".claspignore" ".clasp.json" ".build"

exit $(clasp push &> /dev/null)
