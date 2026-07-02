import {hookStatus, installHook, uninstallHook} from './hook-installers.mjs';
import {installRunner, runnerStatus} from './runner-installer.mjs';
import {installSkill, skillStatus, uninstallSkill} from './skill-installer.mjs';

export function installIntegration(source) {
  const runner = installRunner();

  return {
    runner,
    hook: installHook(source),
    skill: installSkill(source),
  };
}

export function uninstallIntegration(source) {
  return {
    hook: uninstallHook(source),
    skill: uninstallSkill(source),
  };
}

export function integrationStatus(source) {
  return {
    runner: runnerStatus(),
    hook: hookStatus(source),
    skill: skillStatus(source),
  };
}
