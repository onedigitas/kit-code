const SESSION_TRACKS = [
  {id: '0x12f', label: 'session.open', t: '09:14:02'},
  {id: '0x18a', label: 'equals.batch', t: '09:16:41'},
  {id: '0x201', label: 'tracker.idle', t: '09:21:08'},
  {id: '0x244', label: 'reward.tick', t: '09:28:55'},
  {id: '0x29c', label: 'source.diff', t: '09:33:12'},
  {id: '0x2f1', label: 'break.pause', t: '09:41:03'},
  {id: '0x330', label: 'mini.sync', t: '09:47:29'},
  {id: '0x37e', label: 'pet.nudge', t: '09:52:17'},
  {id: '0x3c2', label: 'ledger.write', t: '10:01:44'},
  {id: '0x410', label: 'focus.gain', t: '10:08:06'},
  {id: '0x458', label: 'break.resume', t: '10:15:33'},
  {id: '0x4a9', label: 'equals.count', t: '10:22:51'},
  {id: '0x4f3', label: 'snapshot.ok', t: '10:31:19'},
  {id: '0x531', label: 'break.claim', t: '10:38:02'},
  {id: '0x57c', label: 'dashboard.poll', t: '10:44:47'},
  {id: '0x5c0', label: 'session.keep', t: '10:51:11'},
  {id: '0x60d', label: 'break.ready', t: '10:58:36'},
  {id: '0x655', label: 'tracker.tick', t: '11:04:09'},
  {id: '0x69a', label: 'break.hold', t: '11:11:28'},
  {id: '0x6e2', label: 'session.close', t: '11:18:54'},
  {id: '0x72f', label: 'equals.flush', t: '11:24:16'},
  {id: '0x771', label: 'break.queue', t: '11:31:40'},
];

const SCATTER_COLUMNS = [-8, 24, 56, 88] as const;
const SCATTER_ROW_COUNT = 4;
const SCATTER_ROW_GAP = 24;
const SCATTER_STAGGER = 16;

function TrackLayer() {
  return (
    <div className="gateway-scatter-layer" aria-hidden="true">
      {SESSION_TRACKS.slice(0, SCATTER_COLUMNS.length * SCATTER_ROW_COUNT).map((track, index) => (
        <div
          key={`${track.id}-${track.t}`}
          className="gateway-scatter-entry"
          style={{
            left: `${
              SCATTER_COLUMNS[index % SCATTER_COLUMNS.length] +
              (Math.floor(index / SCATTER_COLUMNS.length) % 2) * SCATTER_STAGGER
            }%`,
            top: `${2 + Math.floor(index / SCATTER_COLUMNS.length) * SCATTER_ROW_GAP}%`,
          }}
        >
          <img src="/ascii-kitcode-bar.png" alt="" />
        </div>
      ))}
    </div>
  );
}

export function GatewaySessionLogScatter() {
  return (
    <div className="gateway-session-scatter" aria-hidden="true" data-testid="gateway-session-scatter">
      <div className="gateway-scatter-scroll">
        <TrackLayer />
        <TrackLayer />
      </div>
    </div>
  );
}
