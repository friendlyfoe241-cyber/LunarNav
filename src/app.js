import {SITES,fmtCoord} from './sites.js';
import {simulateMission,DEFAULT_ENGINEERING} from './mission.js';
import {ephemeris,sampleWindow,summarize,longestDualWindow} from './astro.js';
import {TIMELINE} from './timeline.js';
import {skyBodies} from './celestial.js';
import {inspectSituation,buildSkyDiagram,fmtMargin,findNextHorizonEvent} from './situation.js';
import {loadLolaTerrain} from './terrain.js';
import {windowMetrics,comparisonRows} from './compare.js';
import {findMissionWindows} from './finder.js';
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
function updateAnalysis(){try{const x=readDate();state.date=x.date;state.time=x.time;state.base=x.base;state.samples=sampleWindow({start:state.base,lat:state.site.lat,lon:state.site.lon,days:state.days,stepHours:2,profile:state.terrain});updateSelected();updateMetrics();drawTimeline();drawSky();renderGlobe();updateInspection();updateTerrainBadge();maybeAutoTerrain();renderComparePanel();runFinder();}catch(e){toast(e.message||'Could not calculate the mission window.');}}
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
