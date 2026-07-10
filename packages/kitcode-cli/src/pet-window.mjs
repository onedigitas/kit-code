import {
  effectivePetAnimation,
  PET_ANIMATIONS,
  PET_ATLAS,
  petAnimationForSummary,
} from './pet-animations.mjs';

export function renderPetWindow() {
  const atlasJson = JSON.stringify(PET_ATLAS);
  const animationsJson = JSON.stringify(PET_ANIMATIONS);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KitCode Pet</title>
  <style>
    :root {
      color-scheme: dark;
      --primary: #fc0a0a;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: transparent;
      user-select: none;
    }

    body {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding-top: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }

    .pet-shell {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    .bubble {
      position: relative;
      max-width: 232px;
      min-height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 2px;
      padding: 7px 10px;
      border: 1px solid rgba(252, 10, 10, 0.9);
      border-radius: 14px;
      background: rgba(9, 9, 9, 0.92);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 20px rgba(0, 0, 0, 0.28);
      color: #fff8f8;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.18;
      text-align: center;
      text-shadow: 0 0 10px rgba(252, 10, 10, 0.34);
      pointer-events: none;
    }

    .bubble-main,
    .bubble-meta {
      position: relative;
      z-index: 1;
    }

    .bubble-main {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bubble-meta {
      color: rgba(255, 248, 248, 0.72);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0;
      text-shadow: none;
      white-space: nowrap;
    }

    .bubble::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -7px;
      width: 12px;
      height: 12px;
      border-right: 1px solid rgba(252, 10, 10, 0.9);
      border-bottom: 1px solid rgba(252, 10, 10, 0.9);
      background: rgba(9, 9, 9, 0.92);
      transform: translateX(-50%) rotate(45deg);
    }

    .bubble[data-tone="ready"] {
      color: #ffffff;
      background: rgba(252, 10, 10, 0.96);
      border-color: rgba(255, 255, 255, 0.88);
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.24);
    }

    .bubble[data-tone="ready"] .bubble-meta {
      color: rgba(255, 255, 255, 0.82);
    }

    .bubble[data-tone="ready"]::after {
      background: rgba(252, 10, 10, 0.96);
      border-color: rgba(255, 255, 255, 0.88);
    }

    .bubble[data-tone="offline"],
    .bubble[data-tone="sync"] {
      color: #ffb4b4;
    }

    .sprite {
      width: 192px;
      height: 208px;
      margin-top: 10px;
      background-image: url('/pet-assets/kit-terminal/spritesheet.webp');
      background-repeat: no-repeat;
      background-size: 1536px 2288px;
      background-position: 0 0;
      cursor: grab;
      touch-action: none;
      -webkit-app-region: no-drag;
    }

    body[data-dragging="true"] .sprite {
      cursor: grabbing;
    }

    @media (prefers-reduced-motion: reduce) {
      .sprite {
        background-position: 0 0 !important;
      }
    }
  </style>
</head>
<body data-animation="idle">
  <div class="pet-shell">
    <div class="bubble" id="petBubble" data-tone="waiting" aria-live="polite">
      <span class="bubble-main" id="petBubbleMain">Waiting for progress</span>
      <span class="bubble-meta" id="petBubbleMeta">= 0 · Work 0m</span>
    </div>
    <div class="sprite" id="petSprite" role="img" aria-label="Kit Terminal pet"></div>
  </div>
  <script>
    const ATLAS = ${atlasJson};
    const ANIMATIONS = ${animationsJson};
    const bubble = document.getElementById('petBubble');
    const bubbleMain = document.getElementById('petBubbleMain');
    const bubbleMeta = document.getElementById('petBubbleMeta');
    const sprite = document.getElementById('petSprite');

    let baseAnimation = 'idle';
    let motionState = 'idle';
    let currentAnimation = 'idle';
    let frameIndex = 0;
    let frameTimer = null;
    let blinkTimer = null;
    let blinkEndTimer = null;
    let rendererVisible = false;
    let latestSummary = null;
    let transientAnimation = null;
    let transientTimer = null;
    let bubbleDetailTimer = null;
    let bubbleDetailMode = false;
    let latestConnectionState = 'online';
    let lastHoverActionAt = 0;
    let lastWorkingActionAt = 0;
    let pointerStart = null;
    let dragging = false;
    const dragThreshold = 4;
    const bubbleDetailMs = 2600;
    const hoverActionCooldownMs = 8000;
    const workingActionCooldownMs = 3200;

    function chooseEffectiveAnimation() {
      if (
        motionState === 'walking-left' ||
        motionState === 'walking-right' ||
        motionState === 'waving' ||
        motionState === 'jumping'
      ) {
        return motionState;
      }

      if (
        transientAnimation === 'blink' ||
        transientAnimation === 'working' ||
        transientAnimation === 'review' ||
        transientAnimation === 'waving' ||
        transientAnimation === 'jumping'
      ) {
        return transientAnimation;
      }

      if (baseAnimation === 'jumping' || baseAnimation === 'failed' || baseAnimation === 'waiting') {
        return baseAnimation;
      }

      return baseAnimation;
    }

    function stopBlinkTimers() {
      if (blinkTimer) {
        clearTimeout(blinkTimer);
        blinkTimer = null;
      }
      if (blinkEndTimer) {
        clearTimeout(blinkEndTimer);
        blinkEndTimer = null;
      }
    }

    function clearTransientAnimation() {
      if (transientTimer) {
        clearTimeout(transientTimer);
        transientTimer = null;
      }
      if (blinkEndTimer) {
        clearTimeout(blinkEndTimer);
        blinkEndTimer = null;
      }
      transientAnimation = null;
    }

    function triggerTransientAnimation(animation, duration = 900) {
      if (!rendererVisible || motionState !== 'idle' || baseAnimation !== 'idle') {
        return;
      }

      clearTransientAnimation();
      transientAnimation = animation;
      refreshAnimation();
      transientTimer = setTimeout(() => {
        transientTimer = null;
        if (transientAnimation === animation) {
          transientAnimation = null;
          refreshAnimation();
          scheduleBlink();
        }
      }, duration);
    }

    function scheduleBlink() {
      if (blinkTimer) {
        clearTimeout(blinkTimer);
      }
      if (!rendererVisible) {
        blinkTimer = null;
        return;
      }

      blinkTimer = setTimeout(() => {
        blinkTimer = null;
        if (baseAnimation !== 'idle' || motionState !== 'idle' || transientAnimation) {
          scheduleBlink();
          return;
        }

        transientAnimation = 'blink';
        refreshAnimation();
        blinkEndTimer = setTimeout(() => {
          blinkEndTimer = null;
          transientAnimation = null;
          refreshAnimation();
          scheduleBlink();
        }, 950);
      }, 4800 + Math.floor(Math.random() * 4200));
    }

    function renderFrame() {
      const animation = ANIMATIONS[currentAnimation] ?? ANIMATIONS.idle;
      const column = animation.frames[frameIndex] ?? animation.frames[0];
      sprite.style.backgroundPosition = (-column * ATLAS.cellWidth) + 'px ' + (-animation.row * ATLAS.cellHeight) + 'px';
      document.body.dataset.animation = currentAnimation;
    }

    function stopFrames() {
      if (frameTimer) {
        clearTimeout(frameTimer);
        frameTimer = null;
      }
    }

    function scheduleFrame() {
      stopFrames();
      if (!rendererVisible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        frameIndex = 0;
        renderFrame();
        return;
      }

      const animation = ANIMATIONS[currentAnimation] ?? ANIMATIONS.idle;
      const delay = animation.durations[frameIndex] ?? 160;
      frameTimer = setTimeout(() => {
        frameIndex = (frameIndex + 1) % animation.frames.length;
        renderFrame();
        scheduleFrame();
      }, delay);
    }

    function refreshAnimation() {
      const nextAnimation = chooseEffectiveAnimation();
      if (nextAnimation !== currentAnimation) {
        currentAnimation = nextAnimation;
        frameIndex = 0;
      }

      renderFrame();
      scheduleFrame();
    }

    function safeRatio(value, target) {
      const normalizedValue = Math.max(0, Number(value) || 0);
      const normalizedTarget = Math.max(1, Number(target) || 1);
      return Math.min(1, normalizedValue / normalizedTarget);
    }

    function milestoneProgress(summary, milestone) {
      const reward = summary?.reward ?? {};
      return Math.round(Math.min(
        safeRatio(reward.earnedSeconds, milestone?.requiredSeconds),
        safeRatio(reward.totalEquals, milestone?.requiredEquals),
      ) * 100);
    }

    function nextMilestone(summary) {
      const milestones = summary?.reward?.milestones ?? [];
      return milestones.find((milestone) => (
        !milestone.redeemed &&
        milestone.status !== 'ready' &&
        milestone.status !== 'redeemed' &&
        !milestone.unlocked
      )) ?? milestones.find((milestone) => !milestone.redeemed && milestone.status === 'locked') ?? null;
    }

    function readyTierPercents(summary) {
      return new Set((summary?.reward?.tiers ?? [])
        .filter((tier) => tier.status === 'ready')
        .map((tier) => tier.percent));
    }

    function unlockedMilestonePercents(summary) {
      return new Set((summary?.reward?.milestones ?? [])
        .filter((milestone) => milestone.unlocked || milestone.status === 'ready')
        .map((milestone) => milestone.percent));
    }

    function hasNewPercent(previousSet, nextSet) {
      for (const percent of nextSet) {
        if (!previousSet.has(percent)) {
          return true;
        }
      }

      return false;
    }

    function progressIncreased(previousSummary, nextSummary) {
      const previousReward = previousSummary?.reward ?? {};
      const nextReward = nextSummary?.reward ?? {};
      return (
        (Number(nextReward.earnedSeconds) || 0) > (Number(previousReward.earnedSeconds) || 0) ||
        (Number(nextReward.totalEquals) || 0) > (Number(previousReward.totalEquals) || 0)
      );
    }

    function formatWorkTime(seconds) {
      const totalMinutes = Math.max(0, Math.floor((Number(seconds) || 0) / 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0 && minutes > 0) {
        return hours + 'h ' + minutes + 'm';
      }

      if (hours > 0) {
        return hours + 'h';
      }

      return minutes + 'm';
    }

    function bubbleMetaForSummary(summary) {
      const reward = summary?.reward ?? {};
      const totalEquals = Math.max(0, Math.floor(Number(reward.totalEquals) || 0));
      return '= ' + totalEquals + ' · Work ' + formatWorkTime(reward.earnedSeconds);
    }

    function bubbleDetailForSummary(summary, connectionState = 'online') {
      if (!summary && connectionState !== 'online') {
        return {
          text: connectionState === 'offline' ? 'No tracker data' : 'Syncing tracker',
          meta: '= -- · Work --',
          tone: connectionState === 'offline' ? 'offline' : 'sync',
        };
      }

      const reward = summary?.reward ?? {};
      const totalEquals = Math.max(0, Math.floor(Number(reward.totalEquals) || 0));
      return {
        text: totalEquals + ' equals counted',
        meta: 'Work ' + formatWorkTime(reward.earnedSeconds),
        tone: 'progress',
      };
    }

    function bubbleStateForSummary(summary, connectionState = 'online') {
      if (connectionState === 'offline') {
        return {text: 'Tracker offline', meta: bubbleMetaForSummary(summary), tone: 'offline'};
      }

      if (connectionState === 'reconnecting') {
        return {text: 'Reconnecting tracker', meta: bubbleMetaForSummary(summary), tone: 'sync'};
      }

      const reward = summary?.reward ?? {};
      const global = summary?.global ?? {};
      const readyTier = (reward.tiers ?? []).find((tier) => tier.status === 'ready');
      if (readyTier) {
        return {text: readyTier.percent + '% reward ready', meta: bubbleMetaForSummary(summary), tone: 'ready'};
      }

      const milestone = nextMilestone(summary);
      if (milestone) {
        const progress = milestoneProgress(summary, milestone);
        if (progress >= 80) {
          return {text: 'Almost at ' + milestone.percent + '%', meta: bubbleMetaForSummary(summary), tone: 'progress'};
        }
        return {text: 'Next milestone ' + milestone.percent + '%', meta: bubbleMetaForSummary(summary), tone: 'progress'};
      }

      if ((Number(global.trackingProjects) || 0) > 0) {
        return {text: 'Building break progress', meta: bubbleMetaForSummary(summary), tone: 'progress'};
      }

      return {text: 'Start tracking to feed me', meta: bubbleMetaForSummary(summary), tone: 'waiting'};
    }

    function updateBubble(summary, connectionState = 'online') {
      const state = bubbleDetailMode
        ? bubbleDetailForSummary(summary, connectionState)
        : bubbleStateForSummary(summary, connectionState);
      bubbleMain.textContent = state.text;
      bubbleMeta.textContent = state.meta;
      bubble.dataset.tone = state.tone;
    }

    function showBubbleDetail() {
      bubbleDetailMode = true;
      updateBubble(latestSummary, latestConnectionState);
      if (bubbleDetailTimer) {
        clearTimeout(bubbleDetailTimer);
      }
      bubbleDetailTimer = setTimeout(() => {
        bubbleDetailTimer = null;
        bubbleDetailMode = false;
        updateBubble(latestSummary, latestConnectionState);
      }, bubbleDetailMs);
    }

    function showActionBubble(text, meta = bubbleMetaForSummary(latestSummary), tone = 'progress') {
      bubbleDetailMode = true;
      bubbleMain.textContent = text;
      bubbleMeta.textContent = meta;
      bubble.dataset.tone = tone;
      if (bubbleDetailTimer) {
        clearTimeout(bubbleDetailTimer);
      }
      bubbleDetailTimer = setTimeout(() => {
        bubbleDetailTimer = null;
        bubbleDetailMode = false;
        updateBubble(latestSummary, latestConnectionState);
      }, bubbleDetailMs);
    }

    function handleSummaryAction(previousSummary, nextSummary) {
      if (!previousSummary || !nextSummary || latestConnectionState !== 'online') {
        return;
      }

      const previousReady = readyTierPercents(previousSummary);
      const nextReady = readyTierPercents(nextSummary);
      if (hasNewPercent(previousReady, nextReady)) {
        triggerTransientAnimation('jumping', 1180);
        showActionBubble('Reward unlocked', bubbleMetaForSummary(nextSummary), 'ready');
        return;
      }

      const previousMilestones = unlockedMilestonePercents(previousSummary);
      const nextMilestones = unlockedMilestonePercents(nextSummary);
      if (hasNewPercent(previousMilestones, nextMilestones)) {
        triggerTransientAnimation('waving', 980);
        showActionBubble('Milestone reached', bubbleMetaForSummary(nextSummary), 'progress');
        return;
      }

      const now = Date.now();
      if (progressIncreased(previousSummary, nextSummary) && now - lastWorkingActionAt >= workingActionCooldownMs) {
        lastWorkingActionAt = now;
        triggerTransientAnimation('working', 820);
      }
    }

    function setBaseAnimation(summary, connectionState = 'online') {
      latestConnectionState = connectionState;
      updateBubble(summary, connectionState);
      if (connectionState === 'offline') {
        baseAnimation = 'failed';
      } else if (connectionState === 'reconnecting') {
        baseAnimation = 'waiting';
      } else {
        baseAnimation = 'idle';
      }

      if (baseAnimation !== 'idle') {
        clearTransientAnimation();
      }
      refreshAnimation();
    }

    function pointFromEvent(event) {
      return {
        x: Math.round(event.screenX),
        y: Math.round(event.screenY),
      };
    }

    function dragDistance(event) {
      if (!pointerStart) {
        return 0;
      }

      return Math.hypot(event.screenX - pointerStart.x, event.screenY - pointerStart.y);
    }

    sprite.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      pointerStart = {
        id: event.pointerId,
        x: event.screenX,
        y: event.screenY,
      };
      dragging = false;
      sprite.setPointerCapture?.(event.pointerId);
      document.body.dataset.dragging = 'true';
    });

    sprite.addEventListener('pointermove', (event) => {
      if (!pointerStart || event.pointerId !== pointerStart.id) {
        return;
      }

      event.preventDefault();
      if (!dragging && dragDistance(event) >= dragThreshold) {
        dragging = true;
        window.kitcodePet?.dragStart?.({
          x: Math.round(pointerStart.x),
          y: Math.round(pointerStart.y),
        });
      }

      if (dragging) {
        window.kitcodePet?.dragMove?.(pointFromEvent(event));
      }
    });

    function finishPointer(event, cancelled = false) {
      if (!pointerStart || event.pointerId !== pointerStart.id) {
        return;
      }

      event.preventDefault();
      if (dragging) {
        window.kitcodePet?.dragEnd?.();
      } else if (!cancelled) {
        showBubbleDetail();
        window.kitcodePet?.click?.();
      }

      sprite.releasePointerCapture?.(event.pointerId);
      pointerStart = null;
      dragging = false;
      document.body.dataset.dragging = 'false';
    }

    sprite.addEventListener('pointerup', (event) => finishPointer(event));
    sprite.addEventListener('pointercancel', (event) => finishPointer(event, true));
    sprite.addEventListener('pointerenter', () => {
      const now = Date.now();
      if (!dragging && now - lastHoverActionAt >= hoverActionCooldownMs) {
        lastHoverActionAt = now;
        triggerTransientAnimation('waving', 640);
      }
    });

    window.kitcodePet?.onMotionState?.((state) => {
      motionState = state;
      refreshAnimation();
    });

    window.kitcodePet?.onVisibilityState?.((visible) => {
      rendererVisible = visible;
      if (!visible) {
        transientAnimation = null;
        pointerStart = null;
        dragging = false;
        bubbleDetailMode = false;
        if (bubbleDetailTimer) {
          clearTimeout(bubbleDetailTimer);
          bubbleDetailTimer = null;
        }
        clearTransientAnimation();
        document.body.dataset.dragging = 'false';
        stopBlinkTimers();
        stopFrames();
        return;
      }

      refreshAnimation();
      scheduleBlink();
    });

    window.kitcodePet?.onAction?.((action) => {
      if (action === 'review') {
        triggerTransientAnimation('review', 1250);
        showActionBubble('Reviewing progress', bubbleMetaForSummary(latestSummary), 'progress');
      }
    });

    fetch('/api/summary', {cache: 'no-store'})
      .then((response) => {
        if (!response.ok) throw new Error('summary request failed');
        return response.json();
      })
      .then((summary) => {
        const previousSummary = latestSummary;
        latestSummary = summary;
        setBaseAnimation(summary);
        handleSummaryAction(previousSummary, latestSummary);
      })
      .catch(() => setBaseAnimation(null, 'offline'));

    const events = new EventSource('/api/events');
    events.addEventListener('summary', (event) => {
      const previousSummary = latestSummary;
      latestSummary = JSON.parse(event.data);
      setBaseAnimation(latestSummary);
      handleSummaryAction(previousSummary, latestSummary);
    });
    events.addEventListener('error', () => setBaseAnimation(latestSummary, 'reconnecting'));

    renderFrame();
  </script>
</body>
</html>`;
}

export {effectivePetAnimation, petAnimationForSummary};
