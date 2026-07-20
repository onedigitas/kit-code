import {Fragment, useEffect, useId, useState, type CSSProperties, type ReactNode} from 'react';
import {assistantSetupPromptFor} from '../../../../packages/kitcode-cli/src/integration-spec.mjs';
import type {Summary} from '../lib/kitcode-api';
import {GatewaySessionLogScatter} from './gateway-session-log-scatter';

const GITHUB_REPO_URL = 'https://github.com/onedigitas/kit-code';
const LANDING_URL = 'https://kitcode.onedigitas.com/';

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
    pasteHint: 'Paste into a local Codex chat, then let it run the setup.',
    copyText: assistantSetupPromptFor('codex'),
  },
  {
    agent: 'claude',
    label: 'CLAUDE',
    hint: 'copy Claude setup prompt with SKILL.md',
    pasteHint: 'Paste into a local Claude chat, then let it run the setup.',
    copyText: assistantSetupPromptFor('claude'),
  },
];

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
  onCopy,
}: {
  option: CopyOption;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      className={`gateway-copy-row${copied ? ' is-copied' : ''}`}
      type="button"
      data-testid={`copy-${option.agent}`}
      data-copied={copied ? 'true' : 'false'}
      onClick={onCopy}
      aria-label={`Copy ${option.label} setup prompt`}
    >
      <span className="gateway-copy-label">{option.label}</span>
      <span className="gateway-copy-hint">{copied ? option.pasteHint : option.hint}</span>
      {copied ? <CopiedCheckIcon /> : <CopyIcon />}
    </button>
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
              kitcode.onedigitas.com
            </a>{' '}
            only reads aggregate progress from your local tracker. Setup prompts copy into Codex or Claude;
            projects are chosen later in KitCode Welcome.
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
      setContentScale(clampedScale);
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
  }, [stageNode, children, status]);

  return (
    <div
      className="gateway-page selection:bg-brand-primary selection:text-white"
      data-testid="gateway-page"
    >
      <div className="gateway-frame" data-testid="gateway-session-log">
        <GatewaySessionLogScatter />
        <header className="gateway-topbar">
          <div className="gateway-wordmark">
            <span aria-hidden="true">■</span> KITCODE <em>SESSION LOG</em>
          </div>
          <div className="gateway-telemetry">0 TELEMETRY ©2026</div>
        </header>
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
              <p className="gateway-intro-eyebrow">Introducing</p>
              <h1 id="gateway-title">KitCode.</h1>
              <p className="gateway-intro-lead">
                A local-first companion that tracks your coding and unlocks KitKat-style breaks.
              </p>
            </div>
          </section>

          <section className="gateway-actions-window" aria-label="Choose an assistant setup prompt">
            <div className="gateway-window-chrome">
              <TrafficLights variant="actions" />
            </div>
            <div className="gateway-actions-body">
              {PROMPT_COPY_OPTIONS.map((option) => (
                <Fragment key={option.agent}>
                  <CopyRow
                    option={option}
                    copied={copiedAgent === option.agent}
                    onCopy={() => {
                      void handleCopy(option);
                    }}
                  />
                </Fragment>
              ))}
            </div>
          </section>
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
