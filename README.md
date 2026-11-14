# LunarNav: Mission Planning Notes

Working on a rough idea for a mission-planning helper tailored for the lunar south pole. Whenever you're looking at candidate landing sites and UTC windows, the big bottleneck is figuring out if the Sun and Earth are actually up. That single factor dictates pretty much everything about power, comms, and thermal design.

## What we want it to figure out

* **Visibility windows:** For a given site and mission timeline, what percentage of the time is the Sun above the local horizon? What about Earth visibility?
* **The sweet spots:** When's the longest continuous stretch where *both* are available at the same time?
* **Site trade studies:** How do different candidate sites stack up against one another for the exact same window?
* **Future-proofing:** Down the line, maybe rough power/battery estimates and factoring in terrain horizons.

## Rough game plan

1. **Geometry core first:** Build out Moon-fixed azimuth/elevation calcs for the Sun and Earth, starting with a simple 0-degree flat horizon. Nail down the sampling and summary stats.
2. **Web interface:** Spin up a lightweight static app—pick a site, drop in a date and duration, and output a clean visibility timeline with summary numbers.
3. **Terrain horizons:** Layer in real topography. NASA’s LOLA south-polar DEMs (like the PGDA 80m and 60m products) should work well for pulling local horizon profiles at our study sites.
4. **Planning features:** Once the core math is bulletproof, add site comparisons, window searching, and maybe some basic engineering metrics.

## Data sources on the radar

* **NASA GSFC PGDA LOLA south-polar DEM** (LDEM_80S / LDEM_60S ADJ products)
* **JPL Horizons** for sanity-checking the geometry
* **NASA SVS LROC color mosaic** for a decent basemap
* **IAU WGCCRE 2015 report** for the lunar rotation model