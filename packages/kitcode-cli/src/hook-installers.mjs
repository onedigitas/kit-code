import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  hookConfigFor,
  hookCommandFor as specHookCommandFor,
  legacyHookCommandFor,
  sourceConfig as integrationSourceConfig,
} from './integration-spec.mjs';
import {runnerPath} from './runner-installer.mjs';

function configPath(source) {
  return path.join(os.homedir(), ...integrationSourceConfig(source).hookConfigPathParts);
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});

  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.kitcode.bak`;

    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }
  }

  const tmpPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(tmpPath, filePath);
}

function sourceConfig(source) {
  return {
    path: configPath(source),
  };
}

function hookCommandFor(source) {
  return specHookCommandFor(source, {runnerPath: runnerPath()});
}

function createKitCodeHook(source) {
  return hookConfigFor(source, {runnerPath: runnerPath()});
}

function isKitCodeHook(source, hook) {
  return hook?.type === 'command' && (
    hook.command === hookCommandFor(source) ||
    hook.command === specHookCommandFor(source) ||
    hook.command === legacyHookCommandFor(source)
  );
}

function normalizeHookConfig(config) {
  return {
    ...config,
    hooks: config.hooks && typeof config.hooks === 'object' ? config.hooks : {},
  };
}

export function isHookInstalled(source) {
  const configInfo = sourceConfig(source);
  const config = normalizeHookConfig(readJson(configInfo.path));
  const groups = Array.isArray(config.hooks.UserPromptSubmit) ? config.hooks.UserPromptSubmit : [];

  return groups.some((group) => (
    Array.isArray(group?.hooks) &&
    group.hooks.some((hook) => isKitCodeHook(source, hook))
  ));
}

export function installHook(source) {
  const configInfo = sourceConfig(source);
  const config = normalizeHookConfig(readJson(configInfo.path));
  const groups = Array.isArray(config.hooks.UserPromptSubmit) ? config.hooks.UserPromptSubmit : [];
  const nextGroups = [];

  for (const group of groups) {
    const hooks = Array.isArray(group?.hooks)
      ? group.hooks.filter((hook) => !isKitCodeHook(source, hook))
      : [];

    if (hooks.length > 0) {
      nextGroups.push({
        ...group,
        hooks,
      });
    }
  }

  nextGroups.push({
      matcher: '',
      hooks: [createKitCodeHook(source)],
  });

  config.hooks.UserPromptSubmit = nextGroups;
  writeJsonAtomic(configInfo.path, config);

  return {
    installed: true,
    path: configInfo.path,
    command: hookCommandFor(source),
  };
}

export function uninstallHook(source) {
  const configInfo = sourceConfig(source);
  const config = normalizeHookConfig(readJson(configInfo.path));
  const groups = Array.isArray(config.hooks.UserPromptSubmit) ? config.hooks.UserPromptSubmit : [];
  const nextGroups = [];

  for (const group of groups) {
    const hooks = Array.isArray(group?.hooks)
      ? group.hooks.filter((hook) => !isKitCodeHook(source, hook))
      : [];

    if (hooks.length > 0) {
      nextGroups.push({
        ...group,
        hooks,
      });
    }
  }

  if (nextGroups.length > 0) {
    config.hooks.UserPromptSubmit = nextGroups;
  } else {
    delete config.hooks.UserPromptSubmit;
  }

  writeJsonAtomic(configInfo.path, config);

  return {
    installed: false,
    path: configInfo.path,
  };
}

export function hookStatus(source) {
  const configInfo = sourceConfig(source);

  return {
    installed: isHookInstalled(source),
    path: configInfo.path,
    command: hookCommandFor(source),
  };
}
