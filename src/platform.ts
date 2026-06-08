import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { WaterguruPlatformAccessory } from './platformAccessory';

import WaterguruService from './services/wg.service';
import {CustomWGCharacteristic} from './CustomWGCharacteristic';

export class WaterguruPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  public waterguruSvc: WaterguruService | undefined;
  public customCharacteristic: CustomWGCharacteristic;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);
    this.customCharacteristic = new CustomWGCharacteristic(api);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.waterguruSvc = new WaterguruService(this.log);
      this.waterguruSvc?.signInUser(config['wg-username'], config['wg-password'])
        .then( () => {
          this.discoverDevices();
        });
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {

    this.waterguruSvc && this.waterguruSvc.getDashboardInfo()
      .then( (dashboardInfo => {
        this.log.debug(dashboardInfo);

        // Remove any cached devices that we did not get from the WG service
        const accsNoLongerPresent = this.accessories.filter((o1) => !dashboardInfo.waterBodies.some((o2) => o1.UUID === o2.waterBodyId));
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, accsNoLongerPresent);

        for (const waterBody of dashboardInfo.waterBodies) {

          const existingAccessory = this.accessories.find(accessory => accessory.UUID === waterBody.waterBodyId);
          if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

            existingAccessory.context.device = waterBody;
            this.api.updatePlatformAccessories([existingAccessory]);
            new WaterguruPlatformAccessory(this, existingAccessory);
          } else {
            // the accessory does not yet exist, so we need to create it
            this.log.info('Adding new accessory:', waterBody.name);
            const accessory = new this.api.platformAccessory(waterBody.name, waterBody.waterBodyId);
            accessory.context.device = waterBody;
            new WaterguruPlatformAccessory(this, accessory);

            this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
          }
        }
      }));
  }
}
