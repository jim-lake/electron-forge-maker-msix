import path from 'node:path';
import { MakerBase, MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import { packageMSIX } from 'electron-windows-msix';
import fs from 'fs-extra';

export interface MakerMsiXConfig {
  appManifest: string | ((params: MakerOptions) => Promise<string>);
  packageName: string;
  packageAssets: string;
  windowsKitPath?: string;
  createPri?: boolean;
  cert?: string;
  cert_pass?: string;
  logLevel?: string;
}

const SDK_PATHS = [
  `C:\\Program Files\\Windows Kits\\10\\bin\\${process.arch}`,
  `C:\\Program Files (x86)\\Windows Kits\\10\\bin\\${process.arch}`,
  'C:\\Program Files\\Windows Kits\\10\\bin\\x64',
  'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64',
];

async function findSdkTool(exe: string) {
  let sdkTool: string | undefined;
  for (const testPath of SDK_PATHS) {
    if (await fs.pathExists(testPath)) {
      let testExe = path.resolve(testPath, exe);
      if (await fs.pathExists(testExe)) {
        sdkTool = testExe;
        break;
      }
      const topDir = path.dirname(testPath);
      for (const subVersion of await fs.readdir(topDir)) {
        if (!(await fs.stat(path.resolve(topDir, subVersion))).isDirectory())
          continue;
        if (subVersion.substr(0, 2) !== '10') continue;

        testExe = path.resolve(
          topDir,
          subVersion,
          process.arch,
          'makeappx.exe'
        );
        if (await fs.pathExists(testExe)) {
          sdkTool = testExe;
          break;
        }
        const testExe64 = path.resolve(
          topDir,
          subVersion,
          'x64',
          'makeappx.exe'
        );
        if (await fs.pathExists(testExe64)) {
          sdkTool = testExe64;
          break;
        }
      }
    }
  }
  if (!sdkTool || !(await fs.pathExists(sdkTool))) {
    throw new Error(
      `Can't find ${exe} in PATH. You probably need to install the Windows SDK.`
    );
  }
  return sdkTool;
}
export class MakerMsiX extends MakerBase<MakerMsiXConfig> {
  name = 'msix';

  defaultPlatforms: ForgePlatform[] = ['win32'];

  isSupportedOnCurrentPlatform(): boolean {
    return process.platform === 'win32';
  }

  async make(params: MakerOptions): Promise<string[]> {
    const outPath = path.resolve(params.makeDir, `msix/${params.targetArch}`);
    await this.ensureDirectory(outPath);

    const appManifest =
      typeof this.config.appManifest === 'string'
        ? this.config.appManifest
        : await this.config.appManifest(params);

    const opts: any = {
      appDir: params.dir,
      outputDir: outPath,
      appManifest,
      packageName: this.config.packageName,
      packageAssets: this.config.packageAssets,
      windowsKitPath:
        this.config.windowsKitPath ||
        path.dirname(await findSdkTool('makeappx.exe')),
    };
    if (this.config.createPri !== undefined) {
      opts.createPri = this.config.createPri;
    }
    if (this.config.cert !== undefined) {
      opts.cert = this.config.cert;
    }
    if (this.config.cert_pass !== undefined) {
      opts.cert_pass = this.config.cert_pass;
    }
    if (this.config.logLevel !== undefined) {
      opts.logLevel = this.config.logLevel;
    }

    await packageMSIX(opts);
    return [path.resolve(outPath, opts.packageName)];
  }
}
export default MakerMsiX;
