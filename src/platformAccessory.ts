import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { WaterguruPlatform } from './platform';

// Fixed UUIDs — must never change or HomeKit will create orphaned services on every restart
const CustomServiceUUID = {
  PhService: 'A0000001-079E-48FF-8F27-9C2605A29F52',
  ChlorineService: 'A0000002-079E-48FF-8F27-9C2605A29F52',
};

const CustomCharacteristicUUID = {
  CurrentPh: 'B863F10C-079E-48FF-8F27-9C2605A29F52',
  CurrentChlorine: 'B863F10D-079E-48FF-8F27-9C2605A29F52',
};

export class WaterguruPlatformAccessory {
  private temperatureService: Service;
  private phService: Service;
  private chlorineService: Service;

  constructor(
    private readonly platform: WaterguruPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // Set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'WaterGuru')
      .setCharacteristic(this.platform.Characteristic.Model, 'Unknown')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Unknown');

    // Create Temperature Service
    this.temperatureService = this.accessory.getService(this.platform.Service.TemperatureSensor) ||
     this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.temperatureService.setCharacteristic(this.platform.Characteristic.Name, 'Temperature');
    this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemp.bind(this));

    // Create Ph Service
    this.phService = this.accessory.services.find(service => service.UUID === CustomServiceUUID.PhService) ||
      this.accessory.addService(new this.platform.Service('Ph', CustomServiceUUID.PhService));
    this.phService.setCharacteristic(this.platform.Characteristic.Name, 'Ph');
    const CurrentPh = new this.platform.api.hap.Characteristic('Current Ph', CustomCharacteristicUUID.CurrentPh, {
      format: this.platform.Characteristic.Formats.FLOAT,
      unit: 'ph',
      minValue: 0,
      maxValue: 14,
      minStep: 0.1,
      perms: [this.platform.Characteristic.Perms.PAIRED_READ, this.platform.Characteristic.Perms.NOTIFY],
    });
    this.phService.addCharacteristic(CurrentPh);
    CurrentPh.onGet(this.getCurrentPh.bind(this));

    // Create Chlorine Service
    this.chlorineService = this.accessory.services.find(service => service.UUID === CustomServiceUUID.ChlorineService) ||
      this.accessory.addService(new this.platform.Service('Chlorine', CustomServiceUUID.ChlorineService));
    this.chlorineService.setCharacteristic(this.platform.Characteristic.Name, 'Chlorine');
    const CurrentChlorine = new this.platform.api.hap.Characteristic('Current Chlorine', CustomCharacteristicUUID.CurrentChlorine, {
      format: this.platform.Characteristic.Formats.FLOAT,
      unit: 'ppm',
      minValue: 0,
      maxValue: 10,
      minStep: 0.1,
      perms: [this.platform.Characteristic.Perms.PAIRED_READ, this.platform.Characteristic.Perms.NOTIFY],
    });
    this.chlorineService.addCharacteristic(CurrentChlorine);
    CurrentChlorine.onGet(this.getCurrentFreeChlorine.bind(this));
  }

  async getCurrentTemp(): Promise<CharacteristicValue> {
    try {
      const waterBody = await this.platform.waterguruSvc?.getWaterbodyInfo(this.accessory.UUID);
      if (!waterBody) {
        throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
      }
      this.accessory.context.device = waterBody;
      return (5 / 9) * (this.accessory.context.device.waterTemp - 32);
    } catch (error) {
      this.platform.log.error('Failed to get temperature:', error);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  async getCurrentFreeChlorine(): Promise<CharacteristicValue> {
    try {
      const waterBody = await this.platform.waterguruSvc?.getWaterbodyInfo(this.accessory.UUID);
      if (!waterBody) {
        throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
      }
      this.accessory.context.device = waterBody;
      const measurement = this.accessory.context.device.measurements.find((m) => m.type === 'FREE_CL');
      if (!measurement) {
        throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
      }
      return parseFloat(measurement.value);
    } catch (error) {
      this.platform.log.error('Failed to get free chlorine:', error);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  async getCurrentPh(): Promise<CharacteristicValue> {
    try {
      const waterBody = await this.platform.waterguruSvc?.getWaterbodyInfo(this.accessory.UUID);
      if (!waterBody) {
        throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
      }
      this.accessory.context.device = waterBody;
      const measurement = this.accessory.context.device.measurements.find((m) => m.type === 'PH');
      if (!measurement) {
        throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
      }
      return parseFloat(measurement.value);
    } catch (error) {
      this.platform.log.error('Failed to get pH:', error);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

}
