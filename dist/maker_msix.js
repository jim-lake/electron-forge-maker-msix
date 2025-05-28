"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakerMsiX = void 0;
const node_path_1 = __importDefault(require("node:path"));
const maker_base_1 = require("@electron-forge/maker-base");
const electron_windows_msix_1 = require("electron-windows-msix");
const fs_extra_1 = __importDefault(require("fs-extra"));
const SDK_PATHS = [
    `C:\\Program Files\\Windows Kits\\10\\bin\\${process.arch}`,
    `C:\\Program Files (x86)\\Windows Kits\\10\\bin\\${process.arch}`,
    'C:\\Program Files\\Windows Kits\\10\\bin\\x64',
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64',
];
async function findSdkTool(exe) {
    let sdkTool;
    for (const testPath of SDK_PATHS) {
        if (await fs_extra_1.default.pathExists(testPath)) {
            let testExe = node_path_1.default.resolve(testPath, exe);
            if (await fs_extra_1.default.pathExists(testExe)) {
                sdkTool = testExe;
                break;
            }
            const topDir = node_path_1.default.dirname(testPath);
            for (const subVersion of await fs_extra_1.default.readdir(topDir)) {
                if (!(await fs_extra_1.default.stat(node_path_1.default.resolve(topDir, subVersion))).isDirectory())
                    continue;
                if (subVersion.substr(0, 2) !== '10')
                    continue;
                testExe = node_path_1.default.resolve(topDir, subVersion, process.arch, 'makeappx.exe');
                if (await fs_extra_1.default.pathExists(testExe)) {
                    sdkTool = testExe;
                    break;
                }
                const testExe64 = node_path_1.default.resolve(topDir, subVersion, 'x64', 'makeappx.exe');
                if (await fs_extra_1.default.pathExists(testExe64)) {
                    sdkTool = testExe64;
                    break;
                }
            }
        }
    }
    if (!sdkTool || !(await fs_extra_1.default.pathExists(sdkTool))) {
        throw new Error(`Can't find ${exe} in PATH. You probably need to install the Windows SDK.`);
    }
    return sdkTool;
}
class MakerMsiX extends maker_base_1.MakerBase {
    constructor() {
        super(...arguments);
        this.name = 'msix';
        this.defaultPlatforms = ['win32'];
    }
    isSupportedOnCurrentPlatform() {
        return process.platform === 'win32';
    }
    async make(params) {
        const outPath = node_path_1.default.resolve(params.makeDir, `msix/${params.targetArch}`);
        await this.ensureDirectory(outPath);
        const opts = {
            appDir: params.dir,
            outputDir: outPath,
            appManifest: this.config.appManifest,
            packageName: this.config.packageName,
            packageAssets: this.config.packageAssets,
            windowsKitPath: this.config.windowsKitPath ||
                node_path_1.default.dirname(await findSdkTool('makeappx.exe')),
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
        console.log('opts:', opts);
        await (0, electron_windows_msix_1.packageMSIX)(opts);
        return [node_path_1.default.resolve(outPath, opts.packageName)];
    }
}
exports.MakerMsiX = MakerMsiX;
exports.default = MakerMsiX;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZXJfbXNpeC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWtlcl9tc2l4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDBEQUE2QjtBQUU3QiwyREFBcUU7QUFFckUsaUVBQW9EO0FBQ3BELHdEQUEwQjtBQWExQixNQUFNLFNBQVMsR0FBRztJQUNoQiw2Q0FBNkMsT0FBTyxDQUFDLElBQUksRUFBRTtJQUMzRCxtREFBbUQsT0FBTyxDQUFDLElBQUksRUFBRTtJQUNqRSwrQ0FBK0M7SUFDL0MscURBQXFEO0NBQ3RELENBQUM7QUFFRixLQUFLLFVBQVUsV0FBVyxDQUFDLEdBQVc7SUFDcEMsSUFBSSxPQUEyQixDQUFDO0lBQ2hDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFLENBQUM7UUFDakMsSUFBSSxNQUFNLGtCQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDbEMsSUFBSSxPQUFPLEdBQUcsbUJBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLElBQUksTUFBTSxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUNsQixNQUFNO1lBQ1IsQ0FBQztZQUNELE1BQU0sTUFBTSxHQUFHLG1CQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RDLEtBQUssTUFBTSxVQUFVLElBQUksTUFBTSxrQkFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNsRCxJQUFJLENBQUMsQ0FBQyxNQUFNLGtCQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO29CQUNsRSxTQUFTO2dCQUNYLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxD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