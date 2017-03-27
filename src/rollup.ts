import { BuildContext, BuildState, ChangedFile, TaskInfo } from './util/interfaces';
import { BuildError } from './util/errors';
import { fillConfigDefaults, getUserConfigFile, replacePathVars } from './util/config';
import { ionicRollupResolverPlugin, PLUGIN_NAME } from './rollup/ionic-rollup-resolver-plugin';
import { join, isAbsolute, normalize, sep } from 'path';
import { Logger } from './logger/logger';
import * as rollupBundler from 'rollup';


export function rollup(context: BuildContext, configFile: string) {
  const configFiles = getUserConfigFile(context, taskInfo, configFile);

  const logger = new Logger('rollup');

  return Promise.all(configFiles.map((configPath) => {
    return rollupWorker(context, configPath);
  })).then(() => {
    context.bundleState = BuildState.SuccessfulBuild;
    logger.finish();
  })
  .catch(err => {
    context.bundleState = BuildState.RequiresBuild;
    throw logger.fail(err);
  });
}


export function rollupUpdate(changedFiles: ChangedFile[], context: BuildContext) {
  const logger = new Logger('rollup update');

  const configFiles = getUserConfigFile(context, taskInfo, null);

  return Promise.all(configFiles.map((configPath) => {
    return rollupWorker(context, configPath);
  }))
  .then(() => {
    context.bundleState = BuildState.SuccessfulBuild;
    logger.finish();
  })
  .catch(err => {
    context.bundleState = BuildState.RequiresBuild;
    throw logger.fail(err);
  });
}


export function rollupWorker(context: BuildContext, configFile: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let rollupConfig = getRollupConfig(context, configFile);

    rollupConfig.dest = getOutputDest(context, rollupConfig);

    // replace any path vars like {{TMP}} with the real path
    rollupConfig.entry = replacePathVars(context, normalize(rollupConfig.entry));
    rollupConfig.dest = replacePathVars(context, normalize(rollupConfig.dest));

    addRollupPluginIfNecessary(context, rollupConfig.plugins);

    // tell rollup to use a previous bundle as its starting point
    rollupConfig.cache = cachedBundle;

    if (!rollupConfig.onwarn) {
      // use our own logger if one wasn't already provided
      rollupConfig.onwarn = createOnWarnFn();
    }

    Logger.debug(`entry: ${rollupConfig.entry}, dest: ${rollupConfig.dest}, cache: ${rollupConfig.cache}, format: ${rollupConfig.format}`);

    // bundle the app then create create css
    rollupBundler.rollup(rollupConfig)
      .then((bundle: RollupBundle) => {

        Logger.debug(`bundle.modules: ${bundle.modules.length}`);

        // set the module files used in this bundle
        // this reference can be used elsewhere in the build (sass)
        context.moduleFiles = bundle.modules.map((m) => {
          // sometimes, Rollup appends weird prefixes to the path like commonjs:proxy
          const index = m.id.indexOf(sep);
          if (index >= 0) {
            return m.id.substring(index);
          }
          return m.id;
        });

        // cache our bundle for later use
        if (context.isWatch) {
          cachedBundle = bundle;
        }

        // write the bundle
        return bundle.write(rollupConfig);
      })
      .then(() => {
        // clean up any references (overkill yes, but let's play it safe)
        rollupConfig = rollupConfig.cache = rollupConfig.onwarn = rollupConfig.plugins = null;

        resolve();
      })
      .catch((err: any) => {
        // ensure references are cleared up when there's an error
        cachedBundle = rollupConfig = rollupConfig.cache = rollupConfig.onwarn = rollupConfig.plugins = null;
        reject(new BuildError(err));
      });
  });
}

function addRollupPluginIfNecessary(context: BuildContext, plugins: any[]) {
  let found = false;
  for (const plugin of plugins) {
    if (plugin.name === PLUGIN_NAME) {
      found = true;
      break;
    }
  }
  if (!found) {
    // always add the Ionic plugin to the front of the list
    plugins.unshift(ionicRollupResolverPlugin(context));
  }
}


export function getRollupConfig(context: BuildContext, configFile: string): RollupConfig {
  return fillConfigDefaults(configFile, taskInfo.defaultConfigFile);
}


export function getOutputDest(context: BuildContext, rollupConfig: RollupConfig) {
  if (!isAbsolute(rollupConfig.dest)) {
    // user can pass in absolute paths
    // otherwise save it in the build directory
    return join(context.buildDir, rollupConfig.dest);
  }
  return rollupConfig.dest;
}

export function invalidateCache() {
  cachedBundle = null;
}

let cachedBundle: RollupBundle = null;


function createOnWarnFn() {
  const previousWarns: {[key: string]: boolean} = {};

  return function onWarningMessage(msg: string) {
    if (msg in previousWarns) {
      return;
    }
    previousWarns[msg] = true;

    if (!(IGNORE_WARNS.some(warnIgnore => msg.indexOf(warnIgnore) > -1))) {
      Logger.warn(`rollup: ${msg}`);
    }
  };
}

const IGNORE_WARNS = [
  'keyword is equivalent to'
];


const taskInfo: TaskInfo = {
  fullArg: '--rollup',
  shortArg: '-r',
  envVar: 'IONIC_ROLLUP',
  packageConfig: 'ionic_rollup',
  defaultConfigFile: 'rollup.config'
};


export interface RollupConfig {
  // https://github.com/rollup/rollup/wiki/JavaScript-API
  entry?: string;
  sourceMap?: boolean;
  plugins?: any[];
  format?: string;
  dest?: string;
  cache?: RollupBundle;
  onwarn?: Function;
}


export interface RollupBundle {
  // https://github.com/rollup/rollup/wiki/JavaScript-API
  write?: Function;
  modules: RollupModule[];
}


export interface RollupModule {
  id: string;
}
