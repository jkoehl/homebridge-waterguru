import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { v4 as uuidv4 } from 'uuid';

import { WaterguruPlatform } from './platform';

// Custom UUIDs for services and characteristics
const CustomServiceUUID = {
  PhService: uuidv4(),
  ChlorineService: uuidv4(),
};

const CustomCharacteristicUUID = {
  CurrentPh: uuidv4(),
  CurrentChlorine: uuidv4(),
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
      perms: [this.platform.Characteristic.Perms.READ, this.platform.Characteristic.Perms.NOTIFY],
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
      perms: [this.platform.Characteristic.Perms.READ, this.platform.Characteristic.Perms.NOTIFY],
    });
    this.chlorineService.addCharacteristic(CurrentChlorine);
    CurrentChlorine.onGet(this.getCurrentFreeChlorine.bind(this));
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  // async setOn(value: CharacteristicValue) {
  //   // implement your own code to turn your device on/off
  //   this.exampleStates.On = value as boolean;

  //   this.platform.log.debug('Set Characteristic On ->', value);
  // }



  async getCurrentTemp(): Promise<CharacteristicValue> {
    const waterBody = await this.platform.waterguruSvc?.getWaterbodyInfo(this.accessory.UUID);
    this.accessory.context.device = waterBody;
    return (5/9) * (this.accessory.context.device.waterTemp - 32);
  }

  async getCurrentFreeChlorine(): Promise<CharacteristicValue> {
    const waterBody = await this.platform.waterguruSvc?.getWaterbodyInfo(this.accessory.UUID);
    this.accessory.context.device = waterBody;
    const measurement = this.accessory.context.device.measurements.find((measurement) => (measurement.type === 'FREE_CL'));
    return parseFloat(measurement.value);
  }

  async getCurrentPh(): Promise<CharacteristicValue> {
    const waterBody = await this.platform.waterguruSvc?.getWaterbodyInfo(this.accessory.UUID);
    this.accessory.context.device = waterBody;
    const measurement = this.accessory.context.device.measurements.find((measurement) => (measurement.type === 'PH'));
    return parseFloat(measurement.value);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  // async setBrightness(value: CharacteristicValue) {
  //   // implement your own code to set the brightness
  //   this.exampleStates.Brightness = value as number;

  //   this.platform.log.debug('Set Characteristic Brightness -> ', value);
  // }

}
