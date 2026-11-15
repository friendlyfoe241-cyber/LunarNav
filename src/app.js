import {SITES,fmtCoord} from './sites.js';
import {simulateMission,DEFAULT_ENGINEERING} from './mission.js';
import {ephemeris,sampleWindow,summarize,longestDualWindow} from './astro.js';
import {TIMELINE} from './timeline.js';
import {skyBodies} from './celestial.js';
import {inspectSituation,buildSkyDiagram,fmtMargin,findNextHorizonEvent} from './situation.js';
import {loadLolaTerrain} from './terrain.js';
import {windowMetrics,comparisonRows} from './compare.js';
import {findMissionWindows} from './finder.js';
import {estimateSurfaceTraverse} from './travel.js';
import {estimateEarthMoonTransit} from './transit.js';
import {deriveGridHorizon,deriveSldemPatch,loadSiteHeights} from './grid-terrain.js';
import {loadBundledTerrain} from './terrain-cache.js';
const SUN_CIRCUIT_HOURS=714;
const params=new URLSearchParams(location.search);
const startSite=SITES.find(x=>x.id===params.get('site'))||SITES[0];
const startDays=[3,7,14,28].includes(Number(params.get('days')))?Number(params.get('days')):7;
const $=s=>document.querySelector(s);
const fmtPct=n=>`${n.toFixed(1)}%`;
const fmtUTC=iso=>String(iso).slice(0,16).replace('T',' ')+' UTC';
const shortDate=date=>date.toLocaleDateString('en-GB',{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'});
const escapeHTML=str=>String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const state={site:startSite,date:'2026-11-14',time:'12:00',days:startDays,offset:0,base:null,samples:[],terrain:null};
let toastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800);}
const siteSelect=$('#site-select');
SITES.forEach(site=>siteSelect.add(new Option(site.name,site.id)));
siteSelect.value=state.site.id;
siteSelect.addEventListener('change',()=>selectSite(SITES.find(s=>s.id===siteSelect.value)||SITES[0]));
$('#mission-date').addEventListener('change',updateAnalysis);
$('#mission-time').addEventListener('change',updateAnalysis);
document.querySelectorAll('#duration button').forEach(b=>b.addEventListener('click',()=>{state.days=Number(b.dataset.days);document.querySelectorAll('#duration button').forEach(x=>x.classList.toggle('selected',x===b));updateAnalysis();}));
function readDate(){const date=$('#mission-date').value;const time=$('#mission-time').value;if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d\d:\d\d$/.test(time))throw new Error('Enter a valid UTC date and time.');return {date,time,base:new Date(`${date}T${time}:00Z`)};}
function selectSite(site){state.site=site;siteSelect.value=site.id;updateAnalysis();toast(`${site.name} selected`);}
function updateAnalysis(){try{const x=readDate();state.date=x.date;state.time=x.time;state.base=x.base;state.samples=sampleWindow({start:state.base,lat:state.site.lat,lon:state.site.lon,days:state.days,stepHours:2,profile:state.terrain});updateSelected();updateMetrics();drawTimeline();drawSky();renderGlobe();updateInspection();updateTerrainBadge();maybeAutoTerrain();renderComparePanel();runFinder();renderDateComparison();updateMissionPanels();hydrateBundledTerrain();}catch(e){toast(e.message||'Could not calculate the mission window.');}}
function updateSelected(){$('#selected-name').textContent=state.site.name;$('#selected-coord').textContent=fmtCoord(state.site.lat,state.site.lon);}
function updateMetrics(){const stats=summarize(state.samples);$('#dual-value').textContent=stats.dual.toFixed(1);$('#sun-value').textContent=fmtPct(stats.sun);$('#earth-value').textContent=fmtPct(stats.earth);$('#blackout-value').textContent=stats.longestBlackoutHours.toFixed(0)+' h';const best=longestDualWindow(state.samples);$('#best-window-length').textContent=best.hours?`${best.hours.toFixed(0)} hours`:'No dual-access window';}
function drawTimeline(){const list=state.samples.slice(0,-1),N=Math.max(1,list.length);const rows=[['Sun',x=>x.sun.visible,'#ffd166'],['Earth',x=>x.earth.visible,'#6fe3ff'],['Both',x=>x.dual,'#7fc8ff']];let svg=`<svg class="timeline-svg" viewBox="0 0 960 126" role="img" aria-label="Mission visibility timeline">`;rows.forEach(([label,test,color],r)=>{const y=17+r*34;svg+=`<text x="8" y="${y+13}" fill="#96a0ac" font-size="12">${label}</text>`;list.forEach((s,i)=>{const w=(960-112-12)/N;if(test(s))svg+=`<rect x="${112+i*w}" y="${y}" width="${w+0.5}" height="17" fill="${color}"/>`;});});$('#timeline-graph').innerHTML=svg+'</svg>';}
updateAnalysis();

const map=createMap($('#moon-map'),{onPick:site=>selectSite(site),onHover:point=>{$('#map-tooltip').hidden=!point;}});
function drawSky(){const obs=ephemeris(state.base,state.site.lat,state.site.lon);const layout=skyBodies(obs,state.site.lat,state.site.lon,$('#sky-plot').clientWidth,$('#sky-plot').clientHeight);$('#sky-plot').innerHTML=layout.map(b=>`<span style="position:absolute;left:${b.x}px;top:${b.y}px">${b.label} ${b.elevation.toFixed(1)}°</span>`).join('');}
function renderGlobe(){map.render(state.site);}

function updateInspection(){const obs=ephemeris(new Date(state.base.getTime()+state.offset*3600000),state.site.lat,state.site.lon);const report=inspectSituation(obs,state.terrain);$('#mission-verdict').textContent=report.verdict;$('#mission-sun-margin').textContent=fmtMargin(report.sunMargin);$('#mission-earth-margin').textContent=fmtMargin(report.earthMargin);$('#sky-plot').innerHTML=buildSkyDiagram(obs,state.terrain);}

function horizonBadgeText(profile){return profile?`NASA LOLA ${profile.radiusKm} km terrain horizon`:'Flat 0° horizon';}
function updateTerrainBadge(){const text=horizonBadgeText(state.terrain);const badge=$('#timeline-model');if(badge)badge.textContent=text;}
async function maybeAutoTerrain(){if(state.terrain||state.terrainTried)return;state.terrainTried=true;try{state.terrain=await loadLolaTerrain(state.site);updateAnalysis();}catch(e){toast('Terrain horizon unavailable: '+(e.message||'unknown error'));}}

function compareEntries(){return SITES.map(site=>({site,metrics:windowMetrics({start:state.base,days:state.days,lat:site.lat,lon:site.lon,profile:null})}));}
function renderComparePanel(){const rows=comparisonRows(compareEntries());$('#compare-table').innerHTML=`<table><thead><tr><th>Site</th>${rows.header.map(h=>`<th>${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${rows.body.map(r=>`<tr>${r.map(c=>`<td>${escapeHTML(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}

function runFinder(){const results=findMissionWindows({start:state.base,days:state.days,windowDays:3,searchDays:Number($('#finder-range').value)||30,priority:$('#finder-priority').value||'balanced',profiles:null});$('#finder-top').innerHTML=`<table><thead><tr><th>Window</th><th>Site</th><th>Sun</th><th>Earth</th><th>Score</th></tr></thead><tbody>${results.top.map(w=>`<tr><td>${escapeHTML(w.startDate)}</td><td>${escapeHTML(w.siteName)}</td><td>${w.sunPct.toFixed(0)}%</td><td>${w.earthPct.toFixed(0)}%</td><td>${w.score.toFixed(2)}</td></tr>`).join('')}</tbody></table>`;$('#finder-caption').textContent=`Top ${results.top.length} windows from ${results.searched} sampled start dates.`;}
function exportFinderCSV(){downloadCSV(`lunarnav-finder-${state.date}.csv`,[['site','start_date','sun_pct','earth_pct','score']]);toast('Finder CSV exported');}

function generateCSV(){const rows=[['utc','site','sun_visible','earth_visible','both_visible']];state.samples.forEach(r=>rows.push([r.time,state.site.name,r.sun.visible,r.earth.visible,r.dual]));downloadCSV(`lunarnav-${state.site.id}-${state.date}-${state.days}d.csv`,rows);toast('Mission timeline CSV exported');}
function briefText(){const q=summarize(state.samples);return `LunarNav: Mission screening brief\nSite: ${state.site.name}\nPeriod: ${state.date} ${state.time} UTC + ${state.days} days\nSun visible: ${fmtPct(q.sun)}\nGeometric Earth visible: ${fmtPct(q.earth)}\nSun + Earth together: ${fmtPct(q.dual)}\n\nResearch screening only. Not for flight operations.\n`;}
function openBrief(){$('#brief-content').innerHTML=`<pre>${escapeHTML(briefText())}</pre>`;$('#brief-dialog').showModal();}
function renderDateComparison(){const a=windowMetrics({start:state.base,days:state.days,lat:state.site.lat,lon:state.site.lon,profile:state.terrain});const b=windowMetrics({start:new Date(state.base.getTime()+86400000),days:state.days,lat:state.site.lat,lon:state.site.lon,profile:state.terrain});$('#date-compare-table').innerHTML=`<table><tr><th>Date</th><th>Sun</th><th>Earth</th></tr><tr><td>${shortDate(state.base)}</td><td>${a.sunPct.toFixed(1)}%</td><td>${a.earthPct.toFixed(1)}%</td></tr><tr><td>${shortDate(new Date(state.base.getTime()+86400000))}</td><td>${b.sunPct.toFixed(1)}%</td><td>${b.earthPct.toFixed(1)}%</td></tr></table>`;}

function engineeringInputs(){return {area:Number($('#eng-area').value)||12,loadW:Number($('#eng-load').value)||200,batteryWh:Number($('#eng-battery').value)||500};}
function updateMissionPanels(){const sim=simulateMission(state.samples,engineeringInputs(),state.terrain);state.simulation=sim;$('#eng-summary').textContent=sim.minimumSocPct>0?`Battery holds: minimum state of charge ${sim.minimumSocPct.toFixed(0)}%.`:`Power deficit: ${sim.unmetWh.toFixed(0)} Wh unmet.`;}
function exportEngineeringCSV(){downloadCSV(`lunarnav-engineering-${state.site.id}-${state.date}.csv`,[['metric','value']]);toast('Engineering CSV exported');}

function runTravelEstimate(){const target=SITES.find(s=>s.id===$('#travel-destination').value)||SITES[0];const departure=new Date(`${$('#travel-date').value}T${$('#travel-time').value}:00Z`);const estimate=estimateSurfaceTraverse({from:state.site,to:target,departureUTC:departure.toISOString(),speedKmh:Number($('#travel-speed').value)||8,delayHours:Number($('#travel-delay').value)||0,profile:state.terrain});renderTravelResults(estimate,state.site,target);}
function renderTravelResults(estimate,origin,target){$('#travel-results').innerHTML=`<div class="travel-summary"><div><small>Distance</small><strong>${estimate.distanceKm.toFixed(1)} km</strong></div><div><small>Driving time</small><strong>${estimate.drivingHours.toFixed(1)} h</strong></div></div><div class="travel-schedule"><div><small>Departure (UTC)</small><strong>${fmtUTC(estimate.departureUTC)}</strong></div><div><small>Arrival (UTC)</small><strong>${fmtUTC(estimate.arrivalUTC)}</strong></div></div><p class="planning-note">Great-circle estimate on a 1737.4 km spherical Moon; visibility sampled at the origin only.</p>`;}
function runTransitEstimate(){const profile=$('#transit-profile').value;const departure=new Date(`${$('#transit-date').value}T${$('#transit-time').value}:00Z`);const estimate=estimateEarthMoonTransit({mode:$('#transit-mode').value,departureUTC:departure.toISOString(),profile,customHours:Number($('#transit-custom-hours').value)||undefined,target:state.site});renderTransitResults(estimate);}
function renderTransitResults(estimate){$('#transit-results').innerHTML=`<div class="transit-summary"><div><small>Total transit</small><strong>${estimate.totalTransitHours.toFixed(1)} h</strong></div><div><small>Arrival (UTC)</small><strong>${fmtUTC(estimate.arrivalUTC)}</strong></div></div><p class="transit-limitation">The schedule uses reference transfer durations. Trajectories, delta-v and launch windows are outside the estimate.</p>`;}

async function hydrateBundledTerrain(){const bundled=await loadBundledTerrain();Object.entries(bundled).forEach(([id,profile])=>{const site=SITES.find(s=>s.id===id);if(site)cacheTerrain(site,profile);});refreshTerrainResults();}
async function requestTerrain(){try{$('#terrain-badge').textContent='Reading NASA LOLA grid…';const profile=state.site.lat<-60?await deriveGridHorizon(state.site):await deriveSldemPatch(state.site);profile.source=profile.source||'Derived from the bundled NASA relief grids (data/relief.json)';cacheTerrain(state.site,profile);state.terrain=profile;updateAnalysis();}catch(e){toast('Terrain refinement failed: '+(e.message||'unknown error'));}}
function cacheTerrain(site,profile){terrainProfiles.set(terrainKey(site),profile);}
function refreshTerrainResults(){updateTerrainBadge();renderComparePanel();}
const terrainProfiles=new Map();
const terrainKey=site=>site.id+'|'+site.lat.toFixed(6)+'|'+site.lon.toFixed(6);
