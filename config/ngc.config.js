import * as Constants from './util/constants';

module.exports = {
	entryPoint: process.env[Constants.ENV_APP_ENTRY_POINT],
	tsConfigPath: process.env[Constants.ENV_TS_CONFIG]
};
