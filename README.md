# LunarNav: Lunar Mission Planning

A NASA Space Apps Challenge 2026 prototype built by **Team 1st LunarNav**. Pick
a lunar site and a UTC timeframe to screen Sun and Earth visibility, local
terrain horizons, and first-order engineering constraints. Keep in mind that
these are exploratory estimates rather than landing certification, guaranteed
power, or an RF link budget. This project is not affiliated with or endorsed by
NASA.

## Run locally

You will need **Node 22.13+** (Node 24 is also tested). The client runs on
native browser ES modules.

```sh
npm ci
npm test
npm run build                  # Outputs to dist/
npm run dev                    # http://localhost:4173
```

## Workspace

* **Explore (default):** A rotatable displaced globe with 5 study sites (or any
  custom point you click), UTC time inspection, a visibility timeline, a sky
  diagram, and mission results. Clicking *View panorama of location* flies the
  globe down to your selected waypoint and renders a drag-to-look 360 degree
  horizon panorama ray-marched from the DEM heights, plotting the Sun and Earth
  at their real azimuth/elevation with silhouette terrain obstruction.
* **Plan Mission:** Set one date, time, duration and horizon to drive a 6-metric
  site table, Sun/Earth timelines and 3 recommended windows that open straight
  into Explore. Window searches sample every 4 hours, comparisons every 2
  hours. Exports preserve all search windows and terrain provenance.
* **Engineering:** Simulates a horizontal solar array, constant load and an
  ideal battery, alongside terrain refinement/import and spherical
  surface-traverse estimates, plus reference Earth-to-Moon transit timing.

## Data and models

* **Globe and surface panorama:** Uses the NASA SVS LROC color mosaic, served
  same-origin via local proxies. Elevation grids are baked from real NASA
  height data using `scripts/build-relief.mjs` (never from color maps).
* **Sites:** Mons Mouton uses the NASA PDS IM-2 landing coordinate, Malapert a
  NASA reference coordinate, Shackleton Rim an approximate historical
  candidate. Faustini and Nobile are illustrative study points.
* **Geometry (`src/astro.js`):** Moon-fixed local azimuth and elevation from
  truncated lunar/solar series and IAU 2015 lunar rotation. This rule is shared
  across the timeline, comparison, Finder, engineering and AI tools, though
  sampling rates differ explicitly.
* **Relief and rendering:** Ships with an 8192 x 4096 global grid (~1.33 km/px)
  and ~480 m/px north and south polar grids (provenance in `data/relief.json`).
  Graphics presets control visual relief exaggeration only, while scientific
  calculations always use true elevations.
* **Native terrain and horizons:** Pre-archived profiles in
  `data/lola-horizons.json` cover the 5 study sites. Optional runtime
  refinement calculates 360 bins at 1 degree using bounded HTTP range requests
  against NASA LOLA GeoTIFFs and SLDEM2015, preserving Float32 meters, NoData
  masks and georeferencing. Horizons account for spherical curvature over a
  20 km radius.
* **Engineering and travel:** Power modeling assumes a fixed horizontal array
  (1361 W/m2), constant load and a full ideal battery. Traverse estimates use
  great-circle distance on a 1737.4 km spherical Moon. Transit timing uses
  reference durations (~3.5 days direct, ~7.5 days extended).

## References

- [NASA Space Apps : Team 1st LunarNav](https://www.spaceappschallenge.org/2026/find-a-team/1st-lunarnav/)
- [NASA PGDA : LOLA south-polar DEM](https://pgda.gsfc.nasa.gov/products/90)
- [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/manual.html)
- [IAU WGCCRE 2015 report](https://doi.org/10.1007/s10569-017-9805-5)
