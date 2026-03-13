#!/bin/bash

# Infisical Project Id
PROJECT_ID=" 32b9ffbc-b336-4a82-a728-5d38a4e9e5ef"
ENV="dev"

while [[ $# -gt 0 ]]; do
	case $1 in
		--env) ENV="$2"; shift 2 ;;
		*) echo "Unknown flag: $1"; exit 1 ;;
	esac
done

# Format: "infisical/path:local/.env"
APPS=(
	"golden-retriever:apps/golden-retriever/.env"
	"border-collie:apps/border-collie/.env"
	"web:apps/web/.env"
)

set -e

if ! command -v infisical &>/dev/null; then
	echo "Error: infisical CLI is not installed. See https://infisical.com/docs/cli/overview"
	exit 1
fi

if ! infisical user get token &>/dev/null; then
	echo "Error: not logged in. Run: infisical login"
	exit 1
fi

for entry in "${APPS[@]}"; do
	path="${entry%%:*}"
	dest="${entry##*:}"

	echo "Syncing /$path ($ENV) → $dest ..."
	infisical export \
		--projectId "$PROJECT_ID" \
		--env "$ENV" \
		--path "/$path" \
		--format dotenv >"$dest"
	echo "✓ Done"
done
