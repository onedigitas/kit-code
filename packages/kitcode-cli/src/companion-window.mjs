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
.top-brand{display:flex;align-items:center;gap:8px;min-width:0}
.mark{color:var(--primary)}
.dashboard-button{margin-left:auto;-webkit-app-region:no-drag;padding:2px 7px;border:1px solid rgba(252,10,10,.45);border-radius:4px;background:rgba(255,255,255,.06);color:#ffb0b0;font:900 8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;cursor:pointer;white-space:nowrap}
.dashboard-button[data-ready="true"]{background:var(--primary);border-color:rgba(255,255,255,.88);color:#100606;box-shadow:0 0 12px rgba(252,10,10,.38)}
.dashboard-button:hover,.dashboard-button:focus-visible{outline:1px solid var(--primary);outline-offset:1px;color:#fff}
.dashboard-button[data-ready="true"]:hover,.dashboard-button[data-ready="true"]:focus-visible{color:#100606}
.body{display:flex;align-items:center;gap:9px;min-height:0}
.percent{font-size:25px;line-height:1;color:#fff}
.state{font-size:11px;color:#ffb0b0}
.metrics{display:grid;grid-template-columns:1.05fr 1.25fr .85fr;gap:4px;min-width:0}
.metric{min-width:0;display:flex;align-items:center;justify-content:space-between;gap:4px;padding:2px 5px;border:1px solid #ffffff12;border-radius:4px;background:#ffffff06;color:var(--muted);font-size:8px;font-weight:900;line-height:1;white-space:nowrap}
.metric-label{color:#ff8d8d;letter-spacing:.05em}
.metric-value{min-width:0;overflow:hidden;color:#fff;text-overflow:ellipsis}
.offline .metric-value{color:#806f6f}
${COMPANION_SWITCHER_CSS}
</style></head>
<body><main id="main"><div class="top"><div class="top-brand"><span class="mark">KITCODE</span><span>MINI</span></div><button class="dashboard-button" id="dashboardButton" data-testid="companion-dashboard" type="button" data-ready="false">Dashboard</button></div><div class="body"><strong class="percent" id="percent">--</strong><span class="state" id="state">CONNECTING</span></div><div class="metrics" aria-label="Equals and time needed until next break"><span class="metric"><span class="metric-label">= TO BREAK</span><strong class="metric-value" id="equalsLeftValue" data-testid="mini-equals-left">--</strong></span><span class="metric"><span class="metric-label">TIME TO BREAK</span><strong class="metric-value" id="timeLeftValue" data-testid="mini-time-left">--</strong></span><span class="metric"><span class="metric-label">NEXT</span><strong class="metric-value" id="nextValue" data-testid="mini-next-break">--</strong></span></div></main>${renderCompanionSwitcher('mini')}<script>
const API_BASE=${JSON.stringify(apiBase)};const percent=document.getElementById('percent'),state=document.getElementById('state'),equalsLeftValue=document.getElementById('equalsLeftValue'),timeLeftValue=document.getElementById('timeLeftValue'),nextValue=document.getElementById('nextValue'),main=document.getElementById('main'),dashboardButton=document.getElementById('dashboardButton');let lastActiveSeconds=null,lastIdleSeconds=null;
function equalsToBreakValue(nextBreak){const left=Math.max(0,Math.floor(Number(nextBreak.equalsLeft)||0));return left===0?'done':String(left)}
function timeToBreakValue(nextBreak){return nextBreak.durationLeft||'0s'}
function render(summary){const reward=summary?.reward||{},global=summary?.global||{},tiers=reward.tiers||[],ready=tiers.some((tier)=>tier.status==='ready'),active=Math.max(0,Number(global.totalActiveSeconds)||0),idle=Math.max(0,Number(global.totalIdleSeconds)||0),tracking=Math.max(0,Number(global.trackingProjects)||0),working=lastActiveSeconds!==null&&active>lastActiveSeconds,idling=lastIdleSeconds!==null&&idle>lastIdleSeconds,value=Math.max(0,Math.min(100,(Number(reward.progress)||0)*100)),nextBreak=reward.nextBreak||null;percent.textContent=Math.round(value)+'%';state.textContent=ready?'BREAK READY':working?'WORKING':idling?'IDLE':tracking?'TRACKING':'NO PROJECTS';equalsLeftValue.textContent=nextBreak?equalsToBreakValue(nextBreak):'--';timeLeftValue.textContent=nextBreak?timeToBreakValue(nextBreak):'--';nextValue.textContent=nextBreak?(Math.max(0,Math.floor(Number(nextBreak.percent)||0))+'%'):(ready?'READY':'--');lastActiveSeconds=active;lastIdleSeconds=idle;dashboardButton.dataset.ready=ready?'true':'false';dashboardButton.textContent=ready?'Claim':'Dashboard';main.classList.remove('offline')}
function offline(){percent.textContent='--';state.textContent='OFFLINE';equalsLeftValue.textContent='--';timeLeftValue.textContent='--';nextValue.textContent='--';dashboardButton.dataset.ready='false';dashboardButton.textContent='Dashboard';main.classList.add('offline')}
async function sync(){try{const response=await fetch(API_BASE+'/api/summary');if(!response.ok)throw new Error();render(await response.json())}catch{offline()}}
document.getElementById('miniModeButton').addEventListener('click',()=>{});
document.getElementById('petModeButton').addEventListener('click',()=>window.kitcodeCompanion.switchView('pet'));
document.getElementById('hideButton').addEventListener('click',()=>window.kitcodeCompanion.hide());
dashboardButton.addEventListener('pointerdown',(event)=>event.stopPropagation());
dashboardButton.addEventListener('click',()=>window.kitcodeCompanion.openDashboard());
sync();const events=new EventSource(API_BASE+'/api/events');events.addEventListener('summary',(event)=>{try{render(JSON.parse(event.data))}catch{offline()}});events.onerror=offline;
</script></body></html>`;
}
