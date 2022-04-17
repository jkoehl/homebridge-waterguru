import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { WaterguruPlatformAccessory } from './platformAccessory';

import WaterguruService from './services/wg.service';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class WaterguruPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  private waterguruSvc: WaterguruService | undefined;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.waterguruSvc = new WaterguruService();
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

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
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

            // create a new accessory
            const accessory = new this.api.platformAccessory(waterBody.name, waterBody.waterBodyId);

            // store a copy of the device object in the `accessory.context`
            // the `context` property can be used to store any data about the accessory you may need
            accessory.context.device = waterBody;

            // create the accessory handler for the newly create accessory
            // this is imported from `platformAccessory.ts`
            new WaterguruPlatformAccessory(this, accessory);

            // link the accessory to your platform
            this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
          }
        }
      }));
  }
}
