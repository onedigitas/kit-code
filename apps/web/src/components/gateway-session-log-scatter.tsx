const SESSION_TRACKS = [
  {id: '0x12f', label: 'session.open', t: '09:14:02', x: '6%', y: '3%'},
  {id: '0x18a', label: 'equals.batch', t: '09:16:41', x: '38%', y: '7%'},
  {id: '0x201', label: 'tracker.idle', t: '09:21:08', x: '68%', y: '4%'},
  {id: '0x244', label: 'reward.tick', t: '09:28:55', x: '14%', y: '16%'},
  {id: '0x29c', label: 'source.diff', t: '09:33:12', x: '52%', y: '18%'},
  {id: '0x2f1', label: 'break.pause', t: '09:41:03', x: '78%', y: '14%'},
  {id: '0x330', label: 'mini.sync', t: '09:47:29', x: '8%', y: '28%'},
  {id: '0x37e', label: 'pet.nudge', t: '09:52:17', x: '44%', y: '31%'},
  {id: '0x3c2', label: 'ledger.write', t: '10:01:44', x: '71%', y: '27%'},
  {id: '0x410', label: 'focus.gain', t: '10:08:06', x: '22%', y: '42%'},
  {id: '0x458', label: 'break.resume', t: '10:15:33', x: '58%', y: '44%'},
  {id: '0x4a9', label: 'equals.count', t: '10:22:51', x: '84%', y: '39%'},
  {id: '0x4f3', label: 'snapshot.ok', t: '10:31:19', x: '11%', y: '55%'},
  {id: '0x531', label: 'break.claim', t: '10:38:02', x: '41%', y: '58%'},
  {id: '0x57c', label: 'dashboard.poll', t: '10:44:47', x: '69%', y: '53%'},
  {id: '0x5c0', label: 'session.keep', t: '10:51:11', x: '18%', y: '69%'},
  {id: '0x60d', label: 'break.ready', t: '10:58:36', x: '49%', y: '72%'},
  {id: '0x655', label: 'tracker.tick', t: '11:04:09', x: '76%', y: '67%'},
  {id: '0x69a', label: 'break.hold', t: '11:11:28', x: '9%', y: '83%'},
  {id: '0x6e2', label: 'session.close', t: '11:18:54', x: '36%', y: '86%'},
  {id: '0x72f', label: 'equals.flush', t: '11:24:16', x: '63%', y: '81%'},
  {id: '0x771', label: 'break.queue', t: '11:31:40', x: '88%', y: '88%'},
];

function TrackLayer() {
  return (
    <div className="gateway-scatter-layer" aria-hidden="true">
      {SESSION_TRACKS.map((track) => (
        <div
          key={`${track.id}-${track.t}`}
          className="gateway-scatter-entry"
          style={{left: track.x, top: track.y}}
        >
          ■{track.id} {track.label}
          <br />
          <span>{track.t}</span>
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
