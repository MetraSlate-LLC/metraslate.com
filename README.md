# metraslate.com

The public site of MetraSlate LLC, served by GitHub Pages from this repository. This is the deploy target only: the site is a React + HeroUI app built and prerendered in the MetraSlate vault (`marketing-site/`, source under `marketing-site/src/`) and copied here as static output, so edit it there, then:

```
cd marketing-site
npm run build
node prerender.mjs
```

and copy `dist/*` here (a change made in this repository by hand is overwritten by the next publish). `404.html` is a copy of the SPA shell, doubling as GitHub Pages' fallback for any client-routed path that isn't one of the prerendered routes. The old static-HTML system (`marketing-site/landing/`) is retired.
