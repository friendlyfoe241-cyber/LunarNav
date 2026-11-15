
<div align="center">
  <img src="https://lunarnav-v2.vercel.app/assets/lunarnav-loading.webp" alt="LunarNav" width="220">
</div>

# LunarNav

LunarNav is an interactive lunar mission planning platform developed for the NASA Space Apps Challenge 2026 by Adam Simson and Ankush Dutta.

The project focuses on exploring the lunar surface, analysing environmental conditions, and identifying suitable locations and time windows for potential lunar missions.

## Overview

Planning a mission to the Moon involves more than selecting a location. Sunlight availability, Earth visibility, surrounding terrain, communication interruptions, and power requirements all influence whether a site is suitable for exploration.

These challenges become particularly important near the lunar south pole, where the Sun remains close to the horizon and surrounding terrain can produce extended periods of darkness.

LunarNav combines these considerations in a browser-based application. Users can explore the Moon in 3D, select locations, examine environmental conditions, compare mission windows, and estimate basic engineering requirements.

The platform uses astronomical calculations, lunar elevation datasets, and interactive visualisations to support preliminary mission planning.

## Features

### Interactive 3D Lunar Globe

LunarNav features a rotatable 3D model of the Moon built using WebGL.

The globe uses lunar imagery and elevation data to represent the surface, allowing users to examine different regions and understand the surrounding topography.

Users can navigate the globe, adjust the viewing angle, and select locations for further analysis.

Three graphics presets are available to accommodate different devices. Visual terrain exaggeration can be adjusted without changing the elevation values used in scientific calculations.

### Landing Site Selection

The platform includes five predefined lunar south pole study locations.

| Location | Description |
| --- | --- |
| Mons Mouton | Documented IM-2 lunar landing location |
| Malapert Region | Reference region of interest for illumination and communications |
| Shackleton Rim | Approximate historical candidate location |
| Faustini Rim | Illustrative south polar study location |
| Nobile Region | Illustrative south polar study location |

Users can also select their own custom waypoint directly on the lunar globe.

Each selected location is associated with geographic coordinates that can be used for further analysis.

The predefined locations include a combination of documented coordinates, reference regions, and illustrative study points. They should not all be treated as verified landing sites.

### Mission Planning

LunarNav allows users to configure a mission using a selected location, UTC start date, start time, and mission duration.

The application calculates approximate Sun and Earth visibility over the selected period.

Results include sunlight availability, periods of darkness, Earth visibility, communication gaps, and periods when both the Sun and Earth are simultaneously visible.

These measurements can help identify potential operational constraints before a mission is developed in greater detail.

### Mission Window Finder

The Mission Window Finder searches for potentially suitable mission periods based on selected locations and planning priorities.

Users can prioritise solar visibility, Earth visibility, or a balance between the two.

The system evaluates candidate dates and ranks results using the selected criteria.

For balanced searches, the scoring model assigns 70% weight to simultaneous Sun and Earth visibility, 15% to solar visibility, and 15% to Earth visibility.

Recommended windows can be opened directly in the lunar explorer for closer examination.

### Landing Site Comparison

LunarNav allows users to compare multiple lunar locations using the same mission parameters.

The comparison considers illumination, darkness, Earth visibility, communication interruptions, simultaneous visibility, and reference solar energy.

This makes it possible to examine how conditions vary between different lunar regions and mission dates.

### Terrain and Horizon Analysis

The platform incorporates NASA-derived lunar elevation data to estimate how the surrounding terrain affects visibility.

Local terrain horizons are used to determine whether the Sun or Earth is obstructed by nearby topography.

The application includes bundled elevation grids and horizon profiles, with additional terrain refinement available from supported elevation datasets.

Users can also examine a 360-degree terrain panorama generated from elevation data at a selected waypoint.

Terrain calculations use actual elevation values rather than the exaggerated relief displayed in the 3D globe.

### Sun and Earth Visibility

LunarNav calculates approximate Sun and Earth positions relative to a selected lunar location.

The results are presented through visibility timelines, local sky diagrams, and mission analysis panels.

When terrain data is available, visibility calculations account for the local horizon at the corresponding azimuth.

Without terrain data, the application uses a flat geometric horizon.

These calculations provide preliminary estimates of illumination and direct Earth visibility rather than guaranteed communication or power availability.

### Engineering Analysis

The Engineering workspace provides simplified calculations for evaluating mission requirements.

Users can explore solar energy estimates, electrical loads, idealised battery behaviour, and the effects of changing mission conditions.

The platform also includes approximate surface travel distance calculations and reference Earth-to-Moon transit timing.

These models are intended for early engineering comparisons and do not represent complete spacecraft or mission simulations.

### Ask Spacey AI

LunarNav includes an optional AI assistant called Ask Spacey AI.

The assistant uses Google's Gemini API and can access selected mission parameters and application analysis tools.

Users can ask questions about mission conditions, visibility, power requirements, suitable dates, and other aspects of the selected scenario.

The assistant is implemented through a server-side API endpoint so that the Gemini API key is not exposed in the browser.

The rest of LunarNav can operate independently of the AI assistant.

### Mission Reports and Data Export

LunarNav supports exporting mission data for further analysis.

Users can export CSV files containing visibility timelines, mission window results, and engineering calculations.

The application also supports generating mission briefings that can be copied, printed, or saved as PDF documents.

Shareable links allow preset-site mission configurations to be reopened with their selected dates and durations.

### Guided Tutorial

LunarNav includes a 12-step interactive tutorial covering the main sections of the application.

The tutorial introduces site selection, mission settings, globe navigation, visibility analysis, site comparisons, terrain refinement, engineering calculations, and the AI assistant.

It can be replayed from the Methods section.

## Technology

LunarNav is built primarily with JavaScript, HTML, CSS, and WebGL.

The application uses native JavaScript modules for the interface, lunar calculations, mission planning, and visualisation.

WebGL and GLSL are used for rendering the lunar globe and terrain.

Node.js is used for development scripts, builds, and testing.

The optional AI assistant uses the Google Gemini SDK through a server-side endpoint.

The application is deployed using Vercel, with Playwright used for automated browser testing.

## Scientific Data

LunarNav uses publicly available lunar datasets and scientific references.

### Lunar Reconnaissance Orbiter

Lunar imagery and elevation information are derived from NASA lunar observation datasets.

### Lunar Orbiter Laser Altimeter

LOLA elevation data is used for terrain modelling and local horizon calculations.

The application includes bundled terrain profiles and supports additional resolution refinement where source data is available.

### SLDEM2015

SLDEM2015 contributes to the global elevation model used for lunar terrain representation.

### Astronomical Calculations

Sun and Earth positions are estimated using analytical astronomical calculations and lunar rotation conventions.

The calculations are implemented within the application rather than relying on a live external ephemeris service.

NASA JPL Horizons and NAIF SPICE are useful references for more detailed mission geometry and independent validation.

## Project Structure

The repository separates the application into modules responsible for astronomical calculations, visualisation, mission analysis, terrain processing, and engineering tools.

The main application entry point is `index.html`.

The `src` directory contains the browser application and scientific calculation modules.

The `data` directory contains bundled elevation and terrain information.

The `scripts` directory contains the build process, local development server, validation utilities, and browser testing tools.

The `api` directory contains the optional server-side AI assistant.

Deployment configuration is maintained in `vercel.json`.

## Running Locally

LunarNav requires Node.js 22.13 or newer and npm.

Clone the repository, open the project directory, and install the dependencies.

```bash
npm ci
```

Start the local development server.

```bash
npm run dev
```

Open the application in your browser at:

http://localhost:4173

To create a production build, run:

```bash
npm run build
```

The production files are generated in the `dist` directory.

To run the project checks:

```bash
npm test
```

To preview the production build locally:

```bash
npm run preview
```

### Optional Gemini Configuration

The AI assistant requires a Gemini API key configured on the server.

The repository includes an `.env.example` file documenting the available configuration variables.

```dotenv
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-3.8-flash
```

The API key must remain server-side and should never be committed to the repository.

The local development server does not automatically provide the deployed Gemini serverless endpoint.

## Limitations

LunarNav is a research and educational prototype developed for preliminary lunar mission analysis.

Astronomical calculations are approximate and do not replace high-precision mission ephemerides.

Terrain models have limited resolution and may not capture smaller obstacles, local hazards, or distant terrain obstructions.

Sun and Earth visibility estimates describe geometric visibility and should not be interpreted as guaranteed communications or electrical power availability.

The engineering models use simplified assumptions and do not include complete thermal, electrical, orbital, or spacecraft performance simulations.

Mission window calculations use discrete time samples and may not capture every short-duration visibility event.

The results should not be used as the sole basis for operational mission decisions.

## Future Development

Further development of LunarNav may include higher-resolution terrain analysis, improved astronomical precision, additional lunar datasets, expanded engineering models, and more detailed surface route planning.

Additional validation against scientific reference models would also help improve the accuracy and reliability of the platform.

## Live Demo

LunarNav can be accessed at:

https://lunarnav-v2.vercel.app/

## NASA Space Apps Challenge 2026

LunarNav was developed as a submission to the NASA Space Apps Challenge 2026.

The project explores how publicly available lunar data, scientific calculations, and interactive software can be used for preliminary lunar mission planning.

The application is an independent student project and is not affiliated with or endorsed by NASA.

## Developers

**Adam Simson**

**Ankush Dutta**

NASA Space Apps Challenge 2026

Team 1st LunarNav
