#!/usr/bin/env bash
set -euo pipefail
if [ -d .output/public ]; then OUT=.output/public
elif [ -d dist ]; then OUT=dist
elif [ -d .vercel/output/static ]; then OUT=.vercel/output/static
else echo "No static output" && ls -la && exit 1
fi
mkdir -p _site
cp -R "$OUT"/. _site/
touch _site/.nojekyll
if [ ! -f _site/index.html ]; then
  CSS=$(basename "$(ls _site/assets/styles-*.css | head -1)")
  JS=$(basename "$(ls _site/assets/index-*.js | head -1)")
  cat > _site/index.html <<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>HOSHIIXDD</title>
  <link rel="stylesheet" href="/atelier/assets/${CSS}" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/atelier/assets/${JS}"></script>
</body>
</html>
HTML
  cp _site/index.html _site/404.html
fi
ls -la _site | head
