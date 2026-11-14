# LunarNav: lunar mission planning

A small tool for screening Sun and Earth visibility at candidate lunar south
pole landing sites. Pick one of the five study sites and a UTC timeframe and it
samples the Sun and Earth elevation over the window, shows a visibility
timeline and summarises sunlight, geometric Earth access and their overlap.

## Run locally

You will need Node 22.13+. The app is plain browser ES modules, no build step
needed for development.

```sh
npm run dev            # http://localhost:4173
npm test               # syntax checks on the modules
```

## What it does so far

* **Study sites:** Mons Mouton (NASA PDS IM-2 landing coordinate), Malapert
  (NASA reference coordinate), Shackleton Rim (approximate historical
  candidate), plus Faustini and Nobile as illustrative study points.
* **Geometry:** Moon-fixed local azimuth and elevation for the Sun and Earth
  from truncated lunar/solar series with the IAU 2015 rotation model. A body
  counts as visible when its centre clears the local horizon (0 degrees for
  now).
* **Timeline:** a Sun/Earth/both visibility track for the selected window with
  summary percentages, the longest Earth blackout and the longest continuous
  dual-access stretch.

## Known gaps

No terrain horizons yet (everything assumes a flat 0 degree horizon), no power
or thermal model, and geometric Earth visibility is line of sight only, not an
RF link budget.
