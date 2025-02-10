// src/utils/os.js
import os from 'os';

export function getOSCommands() {
  const platform = os.platform();

  const commands = {
    // Windows
    win32: {
      removeDir: (dir) => `rmdir /s /q ${dir}`,
      removeFile: (file) => `del /f /q ${file}`,
    },
    // Linux/Unix/macOS
    default: {
      removeDir: (dir) => `rm -rf ${dir}`,
      removeFile: (file) => `rm -f ${file}`,
    },
  };

  return commands[platform] || commands.default;
}
