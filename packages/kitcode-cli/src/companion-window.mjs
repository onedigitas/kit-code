import {COMPANION_HIDE_CSS, renderCompanionTitleBar} from './companion-controls.mjs';
import {DASHBOARD_URL} from './integration-spec.mjs';

export function renderCompanionWindow(apiBase = '') {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>KitCode Counter</title><style>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=VT323&display=swap');
:root{color-scheme:dark;--bg-color:#0c0c0c;--red-color:#f03030;--white-text:#e0e0e0;--font-mono:'Fira Code',monospace;--font-pixel:'VT323',monospace}
*{box-sizing:border-box;margin:0;padding:0}
html,body{position:relative;width:100%;height:100%;margin:0;overflow:hidden;background:transparent;color:var(--white-text);font-family:var(--font-mono)}
button{cursor:pointer}
.widget-window{position:relative;width:100%;height:100%;display:flex;flex-direction:column;background:var(--bg-color);border:2px solid var(--red-color);border-radius:8px;overflow:hidden;-webkit-app-region:drag}
.title-bar{padding:6px 10px 4px;display:flex;align-items:center;gap:7px;border-bottom:1px solid var(--red-color)}
.dot{width:12px;height:12px;border-radius:50%;border:1px solid var(--red-color);background:transparent}
.dot.filled{background-color:var(--red-color)}
.widget-body{flex:1;min-height:0;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0;-webkit-app-region:drag}
.brand-label{color:var(--red-color);font-family:var(--font-mono);font-size:10px;font-weight:700;line-height:1.15;letter-spacing:.6px;text-transform:uppercase;white-space:nowrap}
.percentage{font-family:var(--font-pixel),var(--font-mono);font-size:30px;letter-spacing:1px;line-height:1;color:var(--white-text);white-space:nowrap}
.progress-box{border-top:2px solid var(--white-text);border-bottom:2px solid var(--white-text);border-left:1px dashed var(--white-text);border-right:1px dashed var(--white-text);padding:3px 6px;width:120px;height:32px;display:flex;align-items:center;flex:0 0 120px;overflow:hidden}
.progress-fill{width:0;height:100%;display:flex;flex-direction:column;justify-content:center;gap:1px;overflow:hidden;transition:width .2s ease}
.progress-row{width:max-content;color:var(--white-text);font:700 9px/1 var(--font-mono);letter-spacing:1px;white-space:nowrap}
.metrics-group{display:flex;align-items:flex-end;gap:14px;min-width:0}
.metric-item{display:flex;flex-direction:column;align-items:center;min-width:0}
.metric-value{color:var(--white-text);font-family:var(--font-pixel),var(--font-mono);font-size:24px;line-height:1;margin-bottom:2px;letter-spacing:.5px;white-space:nowrap}
.metric-label{color:var(--red-color);font-family:var(--font-mono);font-size:7px;font-weight:500;letter-spacing:.3px;text-transform:uppercase;white-space:nowrap}
.claim-btn{-webkit-app-region:no-drag;background:transparent;color:var(--white-text);font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:1px;padding:8px 14px;cursor:pointer;text-transform:uppercase;border-top:2px solid var(--red-color);border-bottom:2px solid var(--red-color);border-left:1px dashed var(--red-color);border-right:1px dashed var(--red-color);white-space:nowrap;transition:background-color .2s ease}
.claim-btn[data-ready="true"]{background:rgba(240,48,48,.18)}
.claim-btn:hover,.claim-btn:focus-visible{background:rgba(240,48,48,.15);outline:none}
.offline .percentage,.offline .metric-value{color:#6f6f6f}
.offline .progress-row{color:#6f6f6f}
${COMPANION_HIDE_CSS}
</style></head>
<body><main class="widget-window" id="main" data-testid="companion-counter-bar">${renderCompanionTitleBar()}<div class="widget-body"><div class="brand-label" aria-label="KitCode Counter">KITCODE<br>COUNTER</div><strong class="percentage" id="percent" data-testid="mini-percent">--</strong><div class="progress-box" aria-hidden="true"><div class="progress-fill" id="progressFill"><div class="progress-row">========================</div><div class="progress-row">========================</div></div></div><div class="metrics-group" aria-label="KitCode counters"><div class="metric-item"><div class="metric-value" id="countValue" data-testid="mini-count">--</div><div class="metric-label">= COUNT</div></div><div class="metric-item"><div class="metric-value" id="workedValue" data-testid="mini-worked">--</div><div class="metric-label">WORKED</div></div><div class="metric-item"><div class="metric-value" id="idleValue" data-testid="mini-idle">--</div><div class="metric-label">IDLE</div></div></div><button class="claim-btn" id="dashboardButton" data-testid="companion-dashboard" type="button" data-ready="false">CLAIM</button></div></main><script>
const API_BASE=${JSON.stringify(apiBase)};const percent=document.getElementById('percent'),countValue=document.getElementById('countValue'),workedValue=document.getElementById('workedValue'),idleValue=document.getElementById('idleValue'),progressFill=document.getElementById('progressFill'),main=document.getElementById('main'),dashboardButton=document.getElementById('dashboardButton');
function formatDuration(seconds){const totalSeconds=Math.max(0,Math.floor(Number(seconds)||0));if(totalSeconds<60)return totalSeconds+'s';const hours=Math.floor(totalSeconds/3600),minutes=Math.floor((totalSeconds%3600)/60);if(hours>0)return minutes>0?hours+'h '+minutes+'m':hours+'h';return minutes+'m'}
function updateProgress(value){progressFill.style.width=Math.max(0,Math.min(100,Number(value)||0))+'%'}
function render(summary){const reward=summary?.reward||{},global=summary?.global||{},tiers=reward.tiers||[],ready=tiers.some((tier)=>tier.status==='ready'),value=Math.max(0,Math.min(100,(Number(reward.progress)||0)*100));percent.textContent=Math.round(value)+'%';countValue.textContent=String(Math.max(0,Math.floor(Number(reward.totalEquals)||0)));workedValue.textContent=formatDuration(global.totalActiveSeconds);idleValue.textContent=formatDuration(global.totalIdleSeconds);updateProgress(value);dashboardButton.dataset.ready=ready?'true':'false';main.classList.remove('offline')}
function offline(){percent.textContent='--';countValue.textContent='--';workedValue.textContent='--';idleValue.textContent='--';updateProgress(0);dashboardButton.dataset.ready='false';main.classList.add('offline')}
async function sync(){try{const response=await fetch(API_BASE+'/api/summary');if(!response.ok)throw new Error();render(await response.json())}catch{offline()}}
const hideButton=document.getElementById('hideButton');function hideCompanion(){try{const result=window.kitcodeCompanion?.hide?.();if(result&&typeof result.catch==='function')result.catch(()=>window.close());if(!result)window.close()}catch{window.close()}}
hideButton.addEventListener('pointerdown',(event)=>event.stopPropagation());hideButton.addEventListener('click',(event)=>{event.stopPropagation();hideCompanion()});
dashboardButton.addEventListener('pointerdown',(event)=>event.stopPropagation());
dashboardButton.addEventListener('click',()=>{if(window.kitcodeCompanion?.openDashboard){window.kitcodeCompanion.openDashboard();return}window.open(${JSON.stringify(DASHBOARD_URL)},'_blank','noopener')});
sync();const events=new EventSource(API_BASE+'/api/events');events.addEventListener('summary',(event)=>{try{render(JSON.parse(event.data))}catch{offline()}});events.onerror=offline;
</script></body></html>`;
}
