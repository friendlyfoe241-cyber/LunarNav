import {SITES,fmtCoord} from './sites.js';
import {simulateMission,DEFAULT_ENGINEERING} from './mission.js';
import {ephemeris,sampleWindow,summarize,longestDualWindow} from './astro.js';
import {TIMELINE} from './timeline.js';
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
function updateAnalysis(){try{const x=readDate();state.date=x.date;state.time=x.time;state.base=x.base;state.samples=sampleWindow({start:state.base,lat:state.site.lat,lon:state.site.lon,days:state.days,stepHours:2,profile:state.terrain});updateSelected();updateMetrics();drawTimeline();}catch(e){toast(e.message||'Could not calculate the mission window.');}}
function updateSelected(){$('#selected-name').textContent=state.site.name;$('#selected-coord').textContent=fmtCoord(state.site.lat,state.site.lon);}
function updateMetrics(){const stats=summarize(state.samples);$('#dual-value').textContent=stats.dual.toFixed(1);$('#sun-value').textContent=fmtPct(stats.sun);$('#earth-value').textContent=fmtPct(stats.earth);$('#blackout-value').textContent=stats.longestBlackoutHours.toFixed(0)+' h';const best=longestDualWindow(state.samples);$('#best-window-length').textContent=best.hours?`${best.hours.toFixed(0)} hours`:'No dual-access window';}
function drawTimeline(){const list=state.samples.slice(0,-1),N=Math.max(1,list.length);const rows=[['Sun',x=>x.sun.visible,'#ffd166'],['Earth',x=>x.earth.visible,'#6fe3ff'],['Both',x=>x.dual,'#7fc8ff']];let svg=`<svg class="timeline-svg" viewBox="0 0 960 126" role="img" aria-label="Mission visibility timeline">`;rows.forEach(([label,test,color],r)=>{const y=17+r*34;svg+=`<text x="8" y="${y+13}" fill="#96a0ac" font-size="12">${label}</text>`;list.forEach((s,i)=>{const w=(960-112-12)/N;if(test(s))svg+=`<rect x="${112+i*w}" y="${y}" width="${w+0.5}" height="17" fill="${color}"/>`;});});$('#timeline-graph').innerHTML=svg+'</svg>';}
updateAnalysis();
