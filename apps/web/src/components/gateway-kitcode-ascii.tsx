/** Geometric KitCode ASCII mark for the gateway intro (stroke 1.25 / dash 8 / gap 4). */
export function GatewayKitCodeAscii() {
  return (
    <svg
      className="gateway-intro-ascii-mark"
      viewBox="-4 57 1466 246"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="KitCode"
    >
      <title>KitCode</title>

      <g transform="translate(729 180) scale(1.06 0.93) translate(-729 -180)">
      <g aria-label="K">
        <path className="gateway-ascii-segment" d="M40 48H88 M40 312H88" />
        <path
          className="gateway-ascii-segment gateway-ascii-dash"
          d="M40 48V312 M88 48V312 M88 180L185 48 M88 180L185 312 M123 180L220 48 M123 180L220 312"
        />
        <path className="gateway-ascii-segment" d="M185 48H220 M185 312H220" />
      </g>

      <g aria-label="i">
        <path className="gateway-ascii-segment" d="M264 48H306 M264 106H306 M252 137H294 M252 312H294" />
        <path
          className="gateway-ascii-segment gateway-ascii-dash"
          d="M264 48L250 77L264 106 M306 48L320 77L306 106 M252 137V312 M294 137V312"
        />
      </g>

      <g aria-label="t">
        <path
          className="gateway-ascii-segment"
          d="M390 48H430 M350 112H500 M350 137H390 M430 137H500 M390 312H496 M430 285H496"
        />
        <path
          className="gateway-ascii-segment gateway-ascii-dash"
          d="M390 48V112 M430 48V112 M350 112V137 M500 112V137 M390 137V312 M430 137V285 M496 285V312"
        />
      </g>

      <g aria-label="C">
        <path className="gateway-ascii-segment" d="M575 48H730 M600 105H730 M600 255H730 M575 312H730" />
        <path
          className="gateway-ascii-segment gateway-ascii-dash"
          d="M575 48L535 105V255L575 312 M600 105L575 140V220L600 255 M730 48V105 M730 255V312"
        />
      </g>

      <g aria-label="o">
        <path className="gateway-ascii-segment" d="M835 137H925 M850 177H910 M850 272H910 M835 312H925" />
        <path
          className="gateway-ascii-segment gateway-ascii-dash"
          d="M835 137L795 190V258L835 312 M925 137L965 190V258L925 312 M850 177L830 205V244L850 272 M910 177L930 205V244L910 272"
        />
      </g>

      <g aria-label="d">
        <path
          className="gateway-ascii-segment"
          d="M1045 137H1137 M1060 177H1120 M1060 272H1120 M1045 312H1165 M1137 48H1165"
        />
        <path
          className="gateway-ascii-segment gateway-ascii-dash"
          d="M1045 137L1005 190V258L1045 312 M1165 48V312 M1137 48V137 M1060 177L1040 205V244L1060 272 M1120 177L1137 200V249L1120 272"
        />
      </g>

      <g aria-label="e">
        <path
          className="gateway-ascii-segment"
          d="M1255 137H1383 M1285 177H1360 M1260 224H1418 M1255 255H1395 M1255 312H1395"
        />
        <path
          className="gateway-ascii-segment gateway-ascii-dash"
          d="M1255 137L1215 190V258L1255 312 M1383 137L1418 190V224 M1285 177L1260 205V224 M1360 177L1380 205V224 M1395 255V312"
        />
      </g>
      </g>
    </svg>
  );
}
