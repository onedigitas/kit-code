import {
  Activity,
  BarChart3,
  Copy,
  Gift,
  Github,
  PackageCheck,
  Target,
  Terminal,
  Trophy,
  Users,
} from 'lucide-react';

const ADMIN_DUMMY_STATS = [
  {label: 'Devs joined', value: '1,248', delta: '+18%', icon: Users},
  {label: 'Instruction copies', value: '3,904', delta: '+31%', icon: Copy},
  {label: 'CLI runs', value: '2,176', delta: '+24%', icon: Terminal},
  {label: 'GitHub installs', value: '486', delta: '+12%', icon: Github},
  {label: 'Activation rate', value: '55.7%', delta: '+6.4pp', icon: Target},
  {label: 'Claim rate', value: '37.2%', delta: '+4.1pp', icon: Gift},
] as const;

const ADMIN_DUMMY_FUNNEL = [
  {label: 'Visited campaign', value: 6420, rate: 100},
  {label: 'Copied instruction', value: 3904, rate: 61},
  {label: 'Ran CLI', value: 2176, rate: 34},
  {label: 'Installed integration', value: 1248, rate: 19},
  {label: 'Claimed reward', value: 464, rate: 7},
] as const;

const ADMIN_DUMMY_CHANNELS = [
  {source: 'Codex', copies: 1840, installs: 672, activation: '36.5%', claimRate: '41.2%', trend: '+14%'},
  {source: 'Claude', copies: 1268, installs: 386, activation: '30.4%', claimRate: '35.8%', trend: '+9%'},
  {source: 'GitHub', copies: 486, installs: 486, activation: '100%', claimRate: '29.6%', trend: '+12%'},
  {source: 'Direct CLI', copies: 310, installs: 214, activation: '69.0%', claimRate: '48.1%', trend: '+22%'},
] as const;

const ADMIN_DUMMY_REWARDS = [
  {tier: '10%', name: 'Starter break', status: 'available', claimed: 318, inventory: 420, rate: 76},
  {tier: '20%', name: 'Focus refill', status: 'available', claimed: 154, inventory: 260, rate: 59},
  {tier: '30%', name: 'Momentum pack', status: 'claimed', claimed: 96, inventory: 96, rate: 100},
  {tier: '50%', name: 'Medium stake unlock', status: 'locked', claimed: 0, inventory: 160, rate: 0},
  {tier: '100%', name: 'Final break code', status: 'locked', claimed: 0, inventory: 80, rate: 0},
] as const;

const ADMIN_DUMMY_LEADERBOARD = [
  {rank: 1, dev: 'red-main', source: 'codex', equals: 184, rewards: 5, active: '3h 42m', trend: '+24'},
  {rank: 2, dev: 'ship-signal', source: 'cli', equals: 151, rewards: 4, active: '3h 08m', trend: '+19'},
  {rank: 3, dev: 'breakpoint-vn', source: 'github', equals: 133, rewards: 4, active: '2h 54m', trend: '+17'},
  {rank: 4, dev: 'red-loop', source: 'claude', equals: 119, rewards: 3, active: '2h 21m', trend: '+12'},
  {rank: 5, dev: 'focus-stack', source: 'codex', equals: 104, rewards: 3, active: '2h 05m', trend: '+10'},
] as const;

const ADMIN_DUMMY_DAILY_ACTIVITY = [
  {day: 'Mon', copies: 360, runs: 198, claims: 42},
  {day: 'Tue', copies: 514, runs: 271, claims: 61},
  {day: 'Wed', copies: 608, runs: 344, claims: 78},
  {day: 'Thu', copies: 552, runs: 308, claims: 69},
  {day: 'Fri', copies: 710, runs: 421, claims: 96},
  {day: 'Sat', copies: 492, runs: 260, claims: 54},
  {day: 'Sun', copies: 668, runs: 374, claims: 64},
] as const;

const ADMIN_DUMMY_EVENTS = [
  {time: '22:48', source: 'codex', action: 'copied instruction', detail: 'setup prompt'},
  {time: '22:42', source: 'cli', action: 'ran installer', detail: 'npx kitcode codex on'},
  {time: '22:31', source: 'github', action: 'installed repo', detail: 'onedigitas/kit-code'},
  {time: '22:18', source: 'reward', action: 'claimed code', detail: '10% starter break'},
  {time: '22:05', source: 'claude', action: 'copied instruction', detail: 'skill setup prompt'},
  {time: '21:54', source: 'admin', action: 'stock warning', detail: '30% tier fully claimed'},
] as const;

const PERFORMANCE_SERIES = [
  {key: 'copies', label: 'Copies', color: '#fc0a0a'},
  {key: 'runs', label: 'CLI runs', color: '#FFFFFF'},
  {key: 'claims', label: 'Claims', color: '#7e1f1f'},
] as const;

function statusClass(status: string) {
  if (status === 'available') return 'border-brand-primary bg-[rgba(252, 10, 10, 0.16)] text-brand-primary';
  if (status === 'claimed') return 'border-[#3f4b54] bg-[#101417] text-white';

  return 'border-brand-border bg-[#050505] text-brand-gray';
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 bg-[#283138]">
      <div
        className="h-full bg-brand-primary shadow-[0_0_16px_rgba(252, 10, 10, 0.48)]"
        style={{width: `${Math.min(100, Math.max(0, value))}%`}}
      />
    </div>
  );
}

function EngagementFunnelChart() {
  return (
    <div className="grid gap-2">
      {ADMIN_DUMMY_FUNNEL.map((step, index) => {
        const previous = ADMIN_DUMMY_FUNNEL[index - 1];
        const dropOff = previous ? Math.round(100 - (step.value / previous.value) * 100) : 0;
        const inset = Math.max(0, (100 - step.rate) / 2);

        return (
          <article className="grid gap-2" key={step.label}>
            <div className="flex items-center justify-between gap-3 text-[11px] uppercase">
              <span className="min-w-0 truncate text-brand-gray">{step.label}</span>
              <span className="shrink-0 text-white">{step.value.toLocaleString()} / {step.rate}%</span>
            </div>
            <div
              className="relative min-h-[42px] overflow-hidden border border-brand-border bg-[#050505]"
              title={`${step.label}: ${step.value.toLocaleString()} users, ${step.rate}% of visits`}
            >
              <div
                className="absolute inset-y-0 border-x border-brand-primary bg-[rgba(252, 10, 10, 0.2)] shadow-[0_0_22px_rgba(252, 10, 10, 0.2)]"
                style={{left: `${inset}%`, right: `${inset}%`}}
              />
              <div className="relative z-10 flex min-h-[42px] items-center justify-between gap-3 px-3">
                <span className="font-title text-3xl leading-none text-brand-primary">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-right text-[10px] uppercase text-brand-gray">
                  {index === 0 ? 'entry stage' : `${dropOff}% drop-off`}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function PerformanceLineGraph() {
  const width = 420;
  const height = 224;
  const padding = {top: 16, right: 18, bottom: 34, left: 34};
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(
    ...ADMIN_DUMMY_DAILY_ACTIVITY.flatMap((day) => PERFORMANCE_SERIES.map((series) => day[series.key])),
  );
  const yTicks = [0, Math.round(maxValue / 2), maxValue];

  const xFor = (index: number) => padding.left + (plotWidth / (ADMIN_DUMMY_DAILY_ACTIVITY.length - 1)) * index;
  const yFor = (value: number) => padding.top + plotHeight - (value / maxValue) * plotHeight;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase">
        {PERFORMANCE_SERIES.map((series) => (
          <div className="flex items-center gap-2 text-brand-gray" key={series.key}>
            <span className="h-2 w-2" style={{backgroundColor: series.color}} />
            <span>{series.label}</span>
          </div>
        ))}
      </div>

      <svg className="h-[224px] w-full overflow-visible" role="img" viewBox={`0 0 ${width} ${height}`}>
        <title>Weekly performance line graph for instruction copies, CLI runs, and reward claims</title>
        {yTicks.map((tick) => {
          const y = yFor(tick);

          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#1A1A1A" />
              <text fill="#A6A6A6" fontSize="9" textAnchor="end" x={padding.left - 8} y={y + 3}>
                {tick}
              </text>
            </g>
          );
        })}

        {ADMIN_DUMMY_DAILY_ACTIVITY.map((day, index) => (
          <text fill="#A6A6A6" fontSize="9" key={day.day} textAnchor="middle" x={xFor(index)} y={height - 10}>
            {day.day}
          </text>
        ))}

        {PERFORMANCE_SERIES.map((series) => {
          const points = ADMIN_DUMMY_DAILY_ACTIVITY.map((day, index) => `${xFor(index)},${yFor(day[series.key])}`).join(' ');

          return (
            <g key={series.key}>
              <polyline
                fill="none"
                points={points}
                stroke={series.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
              {ADMIN_DUMMY_DAILY_ACTIVITY.map((day, index) => (
                <circle
                  cx={xFor(index)}
                  cy={yFor(day[series.key])}
                  fill="#070707"
                  key={`${series.key}-${day.day}`}
                  r="4"
                  stroke={series.color}
                  strokeWidth="2"
                >
                  <title>{`${day.day} ${series.label}: ${day[series.key].toLocaleString()}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PanelTitle({ icon: Icon, title }: { icon: typeof BarChart3; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon size={15} className="text-brand-primary" />
      <h2 className="text-sm font-bold uppercase text-white">{title}</h2>
    </div>
  );
}

export function AdminPage() {
  return (
    <section className="terminal-pane flex min-h-[660px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="reward-dashboard flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="flex min-h-full min-w-[1180px] flex-1 flex-col">
          <header className="flex items-start justify-between gap-6 border-b border-brand-border p-4">
            <div className="flex min-w-0 items-start gap-3">
              <PackageCheck size={18} className="mt-1 shrink-0 text-brand-primary" />
              <div>
                <h1 className="text-base font-bold uppercase text-white">Admin Control Room</h1>
                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-brand-gray">
                  Dummy campaign performance dashboard for adoption, rewards, channel quality, and top developers.
                </p>
              </div>
            </div>
            <div className="border border-brand-border px-3 py-2 text-[10px] uppercase text-brand-gray">
              demo data
            </div>
          </header>

          <div className="grid grid-cols-6 gap-3 border-b border-brand-border p-3">
            {ADMIN_DUMMY_STATS.map(({delta, icon: Icon, label, value}) => (
              <article className="reward-card flex min-h-[104px] flex-col justify-between p-3" key={label}>
                <div className="flex items-center justify-between gap-3 text-[10px] uppercase text-brand-gray">
                  <span>{label}</span>
                  <Icon size={15} className="text-white" />
                </div>
                <div>
                  <div className="font-title text-[2.35rem] leading-none text-brand-primary">{value}</div>
                  <div className="mt-1 text-[11px] uppercase text-white">{delta} this week</div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 p-3">
            <div className="grid gap-3">
              <section className="reward-panel p-4">
                <PanelTitle icon={Target} title="Engagement Funnel" />
                <EngagementFunnelChart />
              </section>

              <section className="reward-panel p-4">
                <PanelTitle icon={Gift} title="Reward Performance" />
                <div className="grid gap-3">
                  {ADMIN_DUMMY_REWARDS.map((reward) => (
                    <article className="reward-card grid grid-cols-[72px_minmax(0,1fr)_92px] items-center gap-3 p-3" key={reward.tier}>
                      <div className="font-title text-3xl leading-none text-brand-primary">{reward.tier}</div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold uppercase text-white">{reward.name}</div>
                        <div className="mt-2 grid grid-cols-[1fr_72px] items-center gap-2">
                          <ProgressBar value={reward.rate} />
                          <span className="text-right text-[10px] uppercase text-brand-gray">
                            {reward.claimed}/{reward.inventory}
                          </span>
                        </div>
                      </div>
                      <div className={`inline-flex min-h-8 items-center justify-center border px-2 text-[10px] font-bold uppercase ${statusClass(reward.status)}`}>
                        {reward.status}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid gap-3">
              <section className="reward-panel overflow-hidden">
                <div className="border-b border-brand-border p-4">
                  <PanelTitle icon={Trophy} title="Developer Leaderboard" />
                </div>
                <table className="quickfix-table w-full text-left text-[11px] uppercase">
                  <thead className="text-brand-gray">
                    <tr>
                      <th className="px-4 py-2 font-normal">Rank</th>
                      <th className="px-4 py-2 font-normal">Developer</th>
                      <th className="px-4 py-2 font-normal">Source</th>
                      <th className="px-4 py-2 font-normal">Equals</th>
                      <th className="px-4 py-2 font-normal">Rewards</th>
                      <th className="px-4 py-2 font-normal">Active</th>
                      <th className="px-4 py-2 font-normal">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {ADMIN_DUMMY_LEADERBOARD.map((row) => (
                      <tr key={row.rank}>
                        <td className="px-4 py-3 font-title text-2xl leading-none text-brand-primary">#{row.rank}</td>
                        <td className="px-4 py-3">{row.dev}</td>
                        <td className="px-4 py-3 text-brand-gray">{row.source}</td>
                        <td className="px-4 py-3">{row.equals}</td>
                        <td className="px-4 py-3">{row.rewards}</td>
                        <td className="px-4 py-3 text-brand-gray">{row.active}</td>
                        <td className="px-4 py-3 text-brand-primary">{row.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-3">
                <section className="reward-panel overflow-hidden">
                  <div className="border-b border-brand-border p-4">
                    <PanelTitle icon={BarChart3} title="Channel Performance" />
                  </div>
                  <table className="quickfix-table w-full text-left text-[11px] uppercase">
                    <thead className="text-brand-gray">
                      <tr>
                        <th className="px-4 py-2 font-normal">Source</th>
                        <th className="px-4 py-2 font-normal">Copies</th>
                        <th className="px-4 py-2 font-normal">Installs</th>
                        <th className="px-4 py-2 font-normal">Activation</th>
                        <th className="px-4 py-2 font-normal">Claims</th>
                        <th className="px-4 py-2 font-normal">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      {ADMIN_DUMMY_CHANNELS.map((channel) => (
                        <tr key={channel.source}>
                          <td className="px-4 py-3 text-brand-primary">{channel.source}</td>
                          <td className="px-4 py-3">{channel.copies.toLocaleString()}</td>
                          <td className="px-4 py-3">{channel.installs.toLocaleString()}</td>
                          <td className="px-4 py-3 text-brand-gray">{channel.activation}</td>
                          <td className="px-4 py-3 text-brand-gray">{channel.claimRate}</td>
                          <td className="px-4 py-3 text-white">{channel.trend}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                <section className="reward-panel p-4">
                  <PanelTitle icon={Activity} title="Performance Line Graph" />
                  <PerformanceLineGraph />
                </section>
              </div>

              <section className="reward-panel overflow-hidden">
                <div className="border-b border-brand-border p-4">
                  <PanelTitle icon={Gift} title="Recent Campaign Events" />
                </div>
                <table className="quickfix-table w-full text-left text-[11px] uppercase">
                  <thead className="text-brand-gray">
                    <tr>
                      <th className="px-4 py-2 font-normal">Time</th>
                      <th className="px-4 py-2 font-normal">Source</th>
                      <th className="px-4 py-2 font-normal">Action</th>
                      <th className="px-4 py-2 font-normal">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {ADMIN_DUMMY_EVENTS.map((event) => (
                      <tr key={`${event.time}-${event.source}-${event.action}`}>
                        <td className="px-4 py-3 text-brand-gray">{event.time}</td>
                        <td className="px-4 py-3 text-brand-primary">{event.source}</td>
                        <td className="px-4 py-3">{event.action}</td>
                        <td className="px-4 py-3 text-brand-gray">{event.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
