import { BuildContext, ChangedFile } from './util/interfaces';
export declare function rollup(context: BuildContext, configFile: string): Promise<void>;
export declare function rollupUpdate(changedFiles: ChangedFile[], context: BuildContext): Promise<void>;
export declare function rollupWorker(context: BuildContext, configFile: string): Promise<any>;
export declare function getRollupConfig(context: BuildContext, configFile: string): RollupConfig;
export declare function getOutputDest(context: BuildContext, rollupConfig: RollupConfig): string;
export declare function invalidateCache(): void;
export interface RollupConfig {
    entry?: string;
    sourceMap?: boolean;
    plugins?: any[];
    format?: string;
    dest?: string;
    cache?: RollupBundle;
    onwarn?: Function;
}
export interface RollupBundle {
    write?: Function;
    modules: RollupModule[];
}
export interface RollupModule {
    id: string;
}
