#!/bin/sh
if ! command -v jq >/dev/null 2>&1; then
  echo 'error: missing jq command!' >&2;
  exit 1;
fi;

version="$(jq -r '.version' package.json)";
git tag -a "v${version}" -m "Release v${version}";
git push origin "v${version}";
