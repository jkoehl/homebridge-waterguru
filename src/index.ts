import { API } from 'homebridge';

import { PLUGIN_NAME } from './settings';
import { PLATFORM_NAME } from './settings';
import { WaterguruPlatform } from './platform';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, WaterguruPlatform);
};
