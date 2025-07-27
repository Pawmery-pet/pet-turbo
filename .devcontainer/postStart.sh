#! /bin/bash

pnpm install

gh auth login --with-token $GH_TOKEN

echo "✅ Workspace is ready"
