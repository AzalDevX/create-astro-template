// src/utils/github-desktop.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export function checkGitHubDesktop() {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      // Verificar en Windows
      const appDataPath = process.env.LOCALAPPDATA;
      return fs.existsSync(path.join(appDataPath, 'GitHubDesktop'));
    } else if (platform === 'darwin') {
      // Verificar en macOS
      return fs.existsSync('/Applications/GitHub Desktop.app');
    }
    return false;
  } catch (error) {
    return false;
  }
}

export function openInGitHubDesktop(repoPath) {
  try {
    if (os.platform() === 'win32') {
      execSync(
        `"${process.env.LOCALAPPDATA}\\GitHubDesktop\\GitHubDesktop.exe" --open-repository "${repoPath}"`
      );
    } else if (os.platform() === 'darwin') {
      execSync(`open -a "GitHub Desktop" "${repoPath}"`);
    }
    return true;
  } catch (error) {
    return false;
  }
}
