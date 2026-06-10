import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { WaterguruPlatform } from './platform';

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

    // Temperature Service (standard HomeKit — works as-is)
    this.temperatureService = this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.temperatureService.setCharacteristic(this.platform.Characteristic.Name, 'Temperature');
    this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemp.bind(this));

    // pH Service — exposed as TemperatureSensor so HomeKit displays decimals (e.g. 7.5°)
    this.phService = this.accessory.getService('pH') ||
      this.accessory.addService(this.platform.Service.TemperatureSensor, 'pH', 'waterguru-ph');
    this.phService.setCharacteristic(this.platform.Characteristic.Name, 'pH');
    this.phService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentPh.bind(this));

    // Chlorine Service — also exposed as TemperatureSensor so HomeKit displays decimals (e.g. 2.3°)
    this.chlorineService = this.accessory.getService('Chlorine') ||
      this.accessory.addService(this.platform.Service.TemperatureSensor, 'Chlorine', 'waterguru-chlorine');
    this.chlorineService.setCharacteristic(this.platform.Characteristic.Name, 'Chlorine');
    this.chlorineService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentFreeChlorine.bind(this));
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
