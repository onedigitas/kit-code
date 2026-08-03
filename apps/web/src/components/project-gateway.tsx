import {useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import {assistantSetupPromptFor} from '../../../../packages/kitcode-cli/src/integration-spec.mjs';
import type {Summary} from '../lib/kitcode-api';
import {GatewaySessionLogScatter} from './gateway-session-log-scatter';

const GITHUB_REPO_URL = 'https://github.com/onedigitas/kit-code';
const LANDING_URL = 'https://kitcode.vercel.app/';

type CopyOption = {
  agent: 'codex' | 'claude';
  label: string;
  hint: string;
  pasteHint: string;
  copyText: string;
};

const PROMPT_COPY_OPTIONS: CopyOption[] = [
  {
    agent: 'codex',
    label: 'CODEX',
    hint: 'copy Codex setup prompt with SKILL.md',
    pasteHint: 'Paste into Codex Task or a project chat, then let it run the setup.',
    copyText: assistantSetupPromptFor('codex'),
  },
  {
    agent: 'claude',
    label: 'CLAUDE',
    hint: 'copy Claude setup prompt with SKILL.md',
    pasteHint: 'Paste into Claude Code, then let it run the setup.',
    copyText: assistantSetupPromptFor('claude'),
  },
];

const AGENT_REQUIREMENTS = {
  codex: {
    label: 'Codex',
    app: 'ChatGPT desktop app',
    permission: 'Approve for me or Full access',
    accountPlan: 'Go (or higher)',
  },
  claude: {
    label: 'Claude Code',
    app: 'Claude Desktop (Code tab)',
    permission: 'Auto or Bypass permissions',
    accountPlan: 'Pro (or higher)',
  },
} as const;

function CopyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M16 5.5V4.5A1.5 1.5 0 0 0 14.5 3H5.5A1.5 1.5 0 0 0 4 4.5v11A1.5 1.5 0 0 0 5.5 17h1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CopiedCheckIcon() {
  return (
    <span className="gateway-copy-status-icon" aria-hidden="true">
      <svg className="gateway-copy-check" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M7.75 12.25 10.6 15.1 16.4 9.1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function TrafficLights({variant}: {variant: 'intro' | 'actions'}) {
  return (
    <span className={`gateway-traffic gateway-traffic-${variant}`} aria-hidden="true">
      <span className="gateway-traffic-dot gateway-traffic-dot-close" />
      <span className="gateway-traffic-dot" />
      <span className="gateway-traffic-dot" />
    </span>
  );
}

function CopyRow({
  option,
  copied,
  active,
  onActivate,
  onCopy,
}: {
  option: CopyOption;
  copied: boolean;
  active: boolean;
  onActivate: () => void;
  onCopy: () => void;
}) {
  const hintRef = useRef<HTMLSpanElement>(null);
  const [multiline, setMultiline] = useState(false);
  const hintText = copied ? option.pasteHint : option.hint;

  useLayoutEffect(() => {
    const hint = hintRef.current;
    if (!hint) {
      return undefined;
    }

    function measure() {
      const previousWhiteSpace = hint.style.whiteSpace;
      hint.style.whiteSpace = 'normal';
      const lineHeight = Number.parseFloat(getComputedStyle(hint).lineHeight);
      const needsMultiline =
        Number.isFinite(lineHeight) && lineHeight > 0
          ? hint.scrollHeight > lineHeight * 1.25
          : hint.scrollHeight > hint.clientHeight + 1;
      hint.style.whiteSpace = previousWhiteSpace;
      setMultiline((current) => (current === needsMultiline ? current : needsMultiline));
    }

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(hint);
    window.addEventListener('resize', measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [hintText]);

  return (
    <button
      className={`gateway-copy-row${copied ? ' is-copied' : ''}${multiline ? ' is-multiline' : ''}${active ? ' is-active' : ''}`}
      type="button"
      data-testid={`copy-${option.agent}`}
      data-copied={copied ? 'true' : 'false'}
      data-multiline={multiline ? 'true' : 'false'}
      data-active={active ? 'true' : 'false'}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={() => {
        onActivate();
        onCopy();
      }}
      aria-label={`Copy ${option.label} setup prompt`}
      aria-describedby={active ? `gateway-requirements-${option.agent}` : undefined}
    >
      <span className="gateway-copy-label">{option.label}</span>
      <span ref={hintRef} className="gateway-copy-hint">
        {hintText}
      </span>
      {copied ? <CopiedCheckIcon /> : <CopyIcon />}
    </button>
  );
}

function RequirementsPopover({agent}: {agent: 'codex' | 'claude'}) {
  const requirements = AGENT_REQUIREMENTS[agent];
  if (!requirements) {
    return null;
  }

  return (
    <aside
      className="gateway-requirements-popover is-visible"
      data-testid="gateway-requirements-popover"
      data-agent={agent}
      aria-live="polite"
    >
      <p className="gateway-requirements-popover-eyebrow">Minimum requirements</p>
      <div
        className="gateway-requirements-popover-lines"
        id={`gateway-requirements-${agent}`}
      >
        <p>
          {requirements.label}: {requirements.app}
        </p>
        <p>Permission control: {requirements.permission}</p>
        <p>Account Plan: {requirements.accountPlan}</p>
      </div>
    </aside>
  );
}

function GatewayCopyActions({
  copiedAgent,
  onCopy,
}: {
  copiedAgent: 'codex' | 'claude' | null;
  onCopy: (option: CopyOption) => void;
}) {
  const [activeAgent, setActiveAgent] = useState<'codex' | 'claude' | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!shellRef.current?.contains(event.target as Node)) {
        setActiveAgent(null);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div
      ref={shellRef}
      className={`gateway-actions-shell${activeAgent ? ' has-popover' : ''}`}
      data-testid="gateway-copy-actions"
      onMouseLeave={() => setActiveAgent(null)}
    >
      <section className="gateway-actions-window" aria-label="Choose an assistant setup prompt">
        <div className="gateway-window-chrome">
          <TrafficLights variant="actions" />
        </div>
        <div className="gateway-actions-body">
          {PROMPT_COPY_OPTIONS.map((option) => (
            <CopyRow
              key={option.agent}
              option={option}
              copied={copiedAgent === option.agent}
              active={activeAgent === option.agent}
              onActivate={() => setActiveAgent(option.agent)}
              onCopy={() => onCopy(option)}
            />
          ))}
        </div>
      </section>
      {activeAgent ? <RequirementsPopover agent={activeAgent} /> : null}
    </div>
  );
}

function AboutDialog({open, onClose}: {open: boolean; onClose: () => void}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="gateway-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="gateway-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="gateway-about-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gateway-window-chrome">
          <TrafficLights variant="actions" />
          <button
            className="gateway-dialog-close"
            type="button"
            aria-label="Close about dialog"
            data-testid="gateway-about-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="gateway-dialog-body">
          <p className="gateway-dialog-eyebrow">WHO MADE THIS?</p>
          <h2 id={titleId}>KitCode campaign info</h2>
          <p>
            KitCode is a local-first companion for developers. It tracks aggregate coding activity on your
            machine and unlocks KitKat-style break rewards through the OneDigitas campaign experience.
          </p>
          <p>
            Source stays local by default. The hosted dashboard at{' '}
            <a href={LANDING_URL} target="_blank" rel="noreferrer">
              kitcode.vercel.app
            </a>{' '}
            only reads aggregate progress from your local tracker. Setup prompts copy into Codex or Claude;
            in a project chat, Welcome pre-adds the current folder — otherwise choose projects there.
          </p>
          <ul>
            <li>Local tracking and rewards run through `@onedigitas/kitcode`.</li>
            <li>Open-source repo and campaign docs live on GitHub.</li>
          </ul>
          <div className="gateway-dialog-links">
            <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
              GitHub repository →
            </a>
            <span
              className="gateway-dialog-link-disabled"
              aria-disabled="true"
              data-testid="gateway-privacy-link"
              title="Coming soon"
            >
              Privacy →
            </span>
            <span
              className="gateway-dialog-link-disabled"
              aria-disabled="true"
              data-testid="gateway-terms-link"
              title="Coming soon"
            >
              Terms &amp; Conditions →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const GATEWAY_MIN_SCALE = 0.55;
const GATEWAY_MOBILE_MAX_SCALE = 1.15;

function Shell({children, status}: {children: ReactNode; status: string}) {
  const [contentScale, setContentScale] = useState(1);
  const [stageNode, setStageNode] = useState<HTMLDivElement | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const stage = stageNode;
    if (!stage) {
      return undefined;
    }

    function fitGatewayToViewport() {
      const main = stage.querySelector<HTMLElement>('.gateway-main');
      if (!main) {
        return;
      }

      main.style.minHeight = '';

      const designWidth = main.offsetWidth;
      const designHeight = main.scrollHeight;
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;

      if (designWidth <= 0 || designHeight <= 0 || stageWidth <= 0 || stageHeight <= 0) {
        return;
      }

      const availableWidth = Math.max(0, stageWidth - 24);
      const availableHeight = Math.max(0, stageHeight - 16);
      const maxScale = window.matchMedia('(max-width: 1024px)').matches
        ? GATEWAY_MOBILE_MAX_SCALE
        : 1;
      const scale = Math.min(
        availableWidth / designWidth,
        availableHeight / designHeight,
        maxScale,
      );
      const clampedScale = Math.max(GATEWAY_MIN_SCALE, Math.min(scale, maxScale));
      setContentScale((current) =>
        Math.abs(current - clampedScale) < 0.001 ? current : clampedScale,
      );
    }

    fitGatewayToViewport();

    const resizeObserver = new ResizeObserver(() => {
      fitGatewayToViewport();
    });
    resizeObserver.observe(stage);
    const main = stage.querySelector<HTMLElement>('.gateway-main');
    if (main) {
      resizeObserver.observe(main);
    }

    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener('resize', fitGatewayToViewport);
    window.addEventListener('resize', fitGatewayToViewport);

    return () => {
      resizeObserver.disconnect();
      visualViewport?.removeEventListener('resize', fitGatewayToViewport);
      window.removeEventListener('resize', fitGatewayToViewport);
    };
  }, [stageNode, status]);

  return (
    <div
      className="gateway-page selection:bg-brand-primary selection:text-white"
      data-testid="gateway-page"
    >
      <div
        className="gateway-frame"
        data-testid="gateway-session-log"
        aria-label="KITCODE SESSION LOG"
      >
        <GatewaySessionLogScatter />
        <div
          ref={setStageNode}
          className="gateway-stage"
          style={{'--gateway-content-scale': contentScale} as CSSProperties}
        >
          {children}
        </div>
        <footer className="gateway-footer">
          <div className="gateway-footer-left">
            <a
              className="gateway-github-logo"
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open KitCode GitHub repository"
              data-testid="gateway-github-logo"
            >
              <img src="/github-mark.png" alt="" width={36} height={36} />
            </a>
            <div className="gateway-footer-meta">
              <a
                className="gateway-repo-link"
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                data-testid="gateway-repo-link"
              >
                github.com/onedigitas/kit-code
              </a>
              <div className="gateway-status-prompt" title={status} data-testid="gateway-status">
                <span>{status}</span>
                <i className="gateway-idle-cursor" aria-hidden="true" />
              </div>
            </div>
          </div>
          <span className="gateway-footer-tagline">THE LIFE AND TIMES OF A DEV EARNING BREAKS.</span>
          <div className="gateway-footer-right">
            <button
              className="gateway-about-cta"
              type="button"
              data-testid="gateway-about-cta"
              onClick={() => setAboutOpen(true)}
            >
              WHO MADE THIS?
            </button>
            <span className="gateway-footer-rights">ALL RIGHTS RESERVED</span>
          </div>
        </footer>
      </div>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

export function ProjectGateway({
  isChecking,
  isConnected,
  summary,
}: {
  isChecking: boolean;
  isConnected: boolean;
  summary: Summary | null;
}) {
  const [copiedAgent, setCopiedAgent] = useState<'codex' | 'claude' | null>(null);

  useEffect(() => {
    if (!copiedAgent) {
      return undefined;
    }

    const resetTimer = window.setTimeout(() => {
      setCopiedAgent(null);
    }, 12000);

    return () => window.clearTimeout(resetTimer);
  }, [copiedAgent]);

  async function handleCopy(option: CopyOption) {
    try {
      await navigator.clipboard.writeText(option.copyText);
      setCopiedAgent(option.agent);
    } catch {
      setCopiedAgent(null);
    }
  }

  function renderIntro(status: string) {
    return (
      <Shell status={status}>
        <main className="gateway-main">
          <section className="gateway-intro-window" aria-labelledby="gateway-title">
            <div className="gateway-window-chrome">
              <TrafficLights variant="intro" />
            </div>
            <div className="gateway-intro-body">
              <p className="gateway-intro-eyebrow">
                /////////////////// +++++ =========== WELCOME TO =========== ###++ ///////////////////
              </p>
              <div className="gateway-intro-title-frame">
                <h1 id="gateway-title">KitCode</h1>
              </div>
              <p className="gateway-intro-lead">
                /* A LOCAL-FIRST COMPANION THAT REWARDS YOUR HARD WORK WITH KIT-KAT BREAKS. */
              </p>
            </div>
          </section>

          <GatewayCopyActions
            copiedAgent={copiedAgent}
            onCopy={(option) => {
              void handleCopy(option);
            }}
          />
        </main>
      </Shell>
    );
  }

  if (!isConnected) {
    return renderIntro(isChecking ? 'CHECKING LOCALHOST:4747' : 'WAITING FOR CONNECTION');
  }

  const totalProjects = summary?.global.totalProjects ?? 0;
  const activeFolders = summary?.global.trackingProjects ?? 0;

  if (activeFolders === 0) {
    return renderIntro(totalProjects === 0 ? 'NO FOLDERS ACTIVE' : 'KITCODE IS ON BREAK');
  }

  return null;
}
