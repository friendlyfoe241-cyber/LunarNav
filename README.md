# LunarNav: lunar mission planning

Screen Sun and Earth visibility at candidate lunar south pole landing sites,
compare sites and mission dates, and search for good mission windows. Built
for exploratory research screening: not landing certification, guaranteed
power or an RF link budget.

## Run locally

You will need Node 22.13+. The client runs on native browser ES modules.

```sh
npm ci
npm test
npm run dev            # http://localhost:4173
```

## Workspace

* **Explore:** A rotatable relief globe with 5 study sites (or any custom
  point you click), UTC time inspection, a visibility timeline, a sky diagram
  and mission results.
* **Plan Mission:** Set one date, time, duration and horizon to drive a
  6-metric site table and 3 recommended windows that open straight into
  Explore. The Finder samples every 4 hours and can rank by balanced, sunlight
  or Earth access, with CSV export.

## Data and models

* **Sites:** Mons Mouton uses the NASA PDS IM-2 landing coordinate, Malapert a
  NASA reference coordinate, Shackleton Rim an approximate historical
  candidate. Faustini and Nobile are illustrative study points.
* **Geometry (`src/astro.js`):** Moon-fixed local azimuth and elevation from
  truncated lunar/solar series and IAU 2015 lunar rotation. A body counts as
  visible when its centre clears the local terrain horizon (or 0 degrees if no
  terrain is loaded). Eclipses, disc/limb corrections and light-time are not
  included.
* **Native terrain:** Pre-archived profiles in `data/lola-horizons.json` cover
  the 5 study sites (20 km radius, 72 bins at 5 degrees) and are derived from
  NASA LOLA south-polar DEMs. No runtime refinement yet.

## References

- [NASA PGDA : LOLA south-polar DEM](https://pgda.gsfc.nasa.gov/products/90)
- [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/manual.html)
- [IAU WGCCRE 2015 report](https://doi.org/10.1007/s10569-017-9805-5)
