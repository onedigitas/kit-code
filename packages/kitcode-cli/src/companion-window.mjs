import {COMPANION_SWITCHER_CSS, renderCompanionSwitcher} from './companion-controls.mjs';

export function renderCompanionWindow(apiBase = '') {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>KitCode Mini</title><style>
:root{color-scheme:dark;--primary:#fc0a0a;--bg:#0a0909;--line:#5b1d1d;--text:#fff8f8;--muted:#c6aaaa}
*{box-sizing:border-box}
html,body{position:relative;width:100%;height:100%;margin:0;overflow:hidden;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:transparent;color:var(--text)}
main{position:relative;width:100%;height:74px;border:1px solid var(--line);border-radius:10px;background:linear-gradient(135deg,#210909,var(--bg) 62%);box-shadow:0 12px 30px #0008;padding:6px 10px;display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:3px;-webkit-app-region:drag}
.top{display:flex;align-items:center;gap:8px;padding-right:26px;font-size:10px;font-weight:900;letter-spacing:.08em}
.mark{color:var(--primary)}
.body{display:flex;align-items:center;gap:9px;min-height:0}
.percent{font-size:25px;line-height:1;color:#fff}
.state{font-size:11px;color:#ffb0b0}
.metrics{display:grid;grid-template-columns:.72fr 1.18fr 1fr;gap:4px;min-width:0}
.metric{min-width:0;display:flex;align-items:center;justify-content:space-between;gap:5px;padding:2px 6px;border:1px solid #ffffff12;border-radius:4px;background:#ffffff06;color:var(--muted);font-size:9px;font-weight:900;line-height:1;white-space:nowrap}
.metric-label{color:#ff8d8d;letter-spacing:.05em}
.metric-value{min-width:0;overflow:hidden;color:#fff;text-overflow:ellipsis}
.offline .metric-value{color:#806f6f}
${COMPANION_SWITCHER_CSS}
</style></head>
<body><main id="main"><div class="top"><span class="mark">KITCODE</span><span>MINI</span></div><div class="body"><strong class="percent" id="percent">--</strong><span class="state" id="state">CONNECTING</span></div><div class="metrics" aria-label="Tracker metrics"><span class="metric"><span class="metric-label">=</span><strong class="metric-value" id="equalsValue">--</strong></span><span class="metric"><span class="metric-label">WORK</span><strong class="metric-value" id="workValue">--</strong></span><span class="metric"><span class="metric-label">IDLE</span><strong class="metric-value" id="idleValue">--</strong></span></div></main>${renderCompanionSwitcher('mini')}<script>
const API_BASE=${JSON.stringify(apiBase)};const percent=document.getElementById('percent'),state=document.getElementById('state'),equalsValue=document.getElementById('equalsValue'),workValue=document.getElementById('workValue'),idleValue=document.getElementById('idleValue'),main=document.getElementById('main');let lastActiveSeconds=null,lastIdleSeconds=null;
function formatDuration(seconds){const total=Math.max(0,Math.floor(Number(seconds)||0));if(total<60)return total+'s';const minutes=Math.floor(total/60);if(minutes<60)return minutes+'m';const hours=Math.floor(minutes/60),rest=minutes%60;return hours+'h'+(rest?' '+rest+'m':'')}
function render(summary){const reward=summary?.reward||{},global=summary?.global||{},tiers=reward.tiers||[],ready=tiers.some((tier)=>tier.status==='ready'),active=Math.max(0,Number(global.totalActiveSeconds)||0),idle=Math.max(0,Number(global.totalIdleSeconds)||0),tracking=Math.max(0,Number(global.trackingProjects)||0),working=lastActiveSeconds!==null&&active>lastActiveSeconds,idling=lastIdleSeconds!==null&&idle>lastIdleSeconds,value=Math.max(0,Math.min(100,(Number(reward.progress)||0)*100));percent.textContent=Math.round(value)+'%';state.textContent=ready?'BREAK READY':working?'WORKING':idling?'IDLE':tracking?'TRACKING':'NO PROJECTS';equalsValue.textContent=Math.max(0,Math.floor(Number(global.totalEquals??reward.totalEquals)||0));workValue.textContent=formatDuration(active);idleValue.textContent=formatDuration(idle);lastActiveSeconds=active;lastIdleSeconds=idle;main.classList.remove('offline')}
function offline(){percent.textContent='--';state.textContent='OFFLINE';equalsValue.textContent='--';workValue.textContent='--';idleValue.textContent='--';main.classList.add('offline')}
async function sync(){try{const response=await fetch(API_BASE+'/api/summary');if(!response.ok)throw new Error();render(await response.json())}catch{offline()}}
document.getElementById('miniModeButton').addEventListener('click',()=>{});
document.getElementById('petModeButton').addEventListener('click',()=>window.kitcodeCompanion.switchView('pet'));
document.getElementById('hideButton').addEventListener('click',()=>window.kitcodeCompanion.hide());
sync();const events=new EventSource(API_BASE+'/api/events');events.addEventListener('summary',(event)=>{try{render(JSON.parse(event.data))}catch{offline()}});events.onerror=offline;
</script></body></html>`;
}
