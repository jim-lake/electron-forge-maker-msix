import { MakerBase, MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
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
export declare class MakerMsiX extends MakerBase<MakerMsiXConfig> {
    name: string;
    defaultPlatforms: ForgePlatform[];
    isSupportedOnCurrentPlatform(): boolean;
    make(params: MakerOptions): Promise<string[]>;
}
export default MakerMsiX;
//# sourceMappingURL=maker_msix.d.ts.map