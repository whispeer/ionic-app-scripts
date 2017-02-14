import { Logger } from './logger/logger';
import { fillConfigDefaults, getUserConfigFile } from './util/config';
import { BuildContext, TaskInfo } from './util/interfaces';
import { AotCompiler } from './aot/aot-compiler';

export function ngc(context: BuildContext, configFile?: string) {
  const configFiles = getUserConfigFile(context, taskInfo, configFile);

  const logger = new Logger('ngc');

  return Promise.all(configFiles.map((configPath) => {
    return ngcWorker(context, configPath);
  })).then(() => {
    logger.finish();
  })
  .catch((err: any) => {
    throw logger.fail(err);
  });
}

export function ngcWorker(context: BuildContext, configFile: string) {
  const ngcConfig: any = fillConfigDefaults(configFile, taskInfo.defaultConfigFile);

  ngcConfig.rootDir = context.rootDir;

  const compiler = new AotCompiler(context, ngcConfig);
  return compiler.compile();
}

const taskInfo: TaskInfo = {
  fullArg: '--ngc',
  shortArg: '-n',
  envVar: 'IONIC_NGC',
  packageConfig: 'ionic_ngc',
  defaultConfigFile: 'ngc.config'
};
