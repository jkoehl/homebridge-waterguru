import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { WaterguruPlatformAccessory } from './platformAccessory';
import WaterguruService from './services/wg.service';
import { CustomWGCharacteristic } from './CustomWGCharacteristic';

// Each measurement becomes its own HomeKit accessory so they appear as
// separate room tiles instead of being grouped under one accessory.
const MEASUREMENTS = [
  { key: 'temp', label: 'Pool Temperature' },
  { key: 'ph', label: 'Pool pH' },
  { key: 'chlorine', label: 'Pool Chlorine' },
];

export class WaterguruPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];
  public waterguruSvc?: WaterguruService;
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
      this.waterguruSvc?.signInUser(config['wg-username'], config['wg-password']).then(() => {
        this.discoverDevices();
      });
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {
    this.waterguruSvc && this.waterguruSvc.getDashboardInfo()
      .then((dashboardInfo) => {
        this.log.debug(dashboardInfo);

        // Build the set of UUIDs we expect (one per measurement per water body)
        const expectedUUIDs: string[] = [];
        for (const waterBody of dashboardInfo.waterBodies) {
          for (const m of MEASUREMENTS) {
            expectedUUIDs.push(this.api.hap.uuid.generate(waterBody.waterBodyId + '-' + m.key));
          }
        }

        // Remove any cached accessories we no longer expect
        const accsNoLongerPresent = this.accessories.filter((acc) => !expectedUUIDs.includes(acc.UUID));
        if (accsNoLongerPresent.length > 0) {
          this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, accsNoLongerPresent);
        }

        for (const waterBody of dashboardInfo.waterBodies) {
          for (const m of MEASUREMENTS) {
            const uuid = this.api.hap.uuid.generate(waterBody.waterBodyId + '-' + m.key);
            const displayName = m.label;
            const existingAccessory = this.accessories.find(acc => acc.UUID === uuid);

            if (existingAccessory) {
              this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
              existingAccessory.context.device = waterBody;
              existingAccessory.context.measurementKey = m.key;
              this.api.updatePlatformAccessories([existingAccessory]);
              new WaterguruPlatformAccessory(this, existingAccessory);
            } else {
              this.log.info('Adding new accessory:', displayName);
              const accessory = new this.api.platformAccessory(displayName, uuid);
              accessory.context.device = waterBody;
              accessory.context.measurementKey = m.key;
              new WaterguruPlatformAccessory(this, accessory);
              this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }
          }
        }
      });
  }
}
