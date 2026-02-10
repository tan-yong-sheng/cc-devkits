/**
 * Key Rotation Utilities - Rotate through multiple API keys
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface RotationOptions {
  stateFile?: string;
}

const DEFAULT_STATE_DIR = join(homedir(), '.claude', 'cc-devkits');
const DEFAULT_STATE_FILE = join(DEFAULT_STATE_DIR, 'rotation.json');

/**
 * Get rotated API keys from environment variable
 * @param envVar The environment variable containing semi-colon separated keys
 * @param stateKey Unique key for this rotation set (e.g., 'serper')
 * @returns The next API key to use
 */
export function rotateKeys(envVar: string, stateKey: string, options: RotationOptions = {}): string {
  const { stateFile = DEFAULT_STATE_FILE } = options;
  const rawKeys = process.env[envVar];

  if (!rawKeys) {
    return '';
  }

  const keys = rawKeys.split(';').map(k => k.trim()).filter(k => k.length > 0);
  if (keys.length === 0) {
    return '';
  }

  if (keys.length === 1) {
    return keys[0];
  }

  // Load state
  let state: Record<string, number> = {};
  if (existsSync(stateFile)) {
    try {
      state = JSON.parse(readFileSync(stateFile, 'utf-8'));
    } catch {
      // Ignore parse errors
    }
  }

  // Get last index
  const lastIndex = state[stateKey] ?? -1;
  const nextIndex = (lastIndex + 1) % keys.length;

  // Save new state
  state[stateKey] = nextIndex;
  try {
    const dir = join(stateFile, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(stateFile, JSON.stringify(state, null, 2));
  } catch {
    // Ignore write errors
  }

  return keys[nextIndex];
}
