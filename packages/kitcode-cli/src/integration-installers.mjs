import {hookStatus, installHook, uninstallHook} from './hook-installers.mjs';
import {installSkill, skillStatus, uninstallSkill} from './skill-installer.mjs';

export function installIntegration(source) {
  return {
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
    hook: hookStatus(source),
    skill: skillStatus(source),
  };
}
