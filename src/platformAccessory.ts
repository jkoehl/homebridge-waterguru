import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { WaterguruPlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class WaterguruPlatformAccessory {
  private service: Service;

  constructor(
    private readonly platform: WaterguruPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    const svc = this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'WaterGuru')
      .setCharacteristic(this.platform.Characteristic.Model, 'Unknown')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Unknown');

    svc.addOptionalCharacteristic(this.platform.customCharacteristic.characteristic.FreeChlorine);
    svc.addOptionalCharacteristic(this.platform.customCharacteristic.characteristic.pH);

    this.service = this.accessory.getService(this.platform.Service.TemperatureSensor) || this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.service.setCharacteristic(this.platform.Characteristic.Name, 'Water Temp');

    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemp.bind(this));

    this.service.getCharacteristic(this.platform.customCharacteristic.characteristic.FreeChlorine)
      .onGet(this.getCurrentFreeChlorine.bind(this));

    this.service.getCharacteristic(this.platform.customCharacteristic.characteristic.pH)
      .onGet(this.getCurrentPh.bind(this));

    // register handlers for the Brightness Characteristic
    // this.service.getCharacteristic(this.platform.Characteristic.Brightness)
    //   .onSet(this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below

    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    // Example: add two "motion sensor" services to the accessory
    // const motionSensorOneService = this.accessory.getService('Motion Sensor One Name') ||
    //   this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor One Name', 'YourUniqueIdentifier-1');

    // const motionSensorTwoService = this.accessory.getService('Motion Sensor Two Name') ||
    //   this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor Two Name', 'YourUniqueIdentifier-2');

    /**
     * Updating characteristics values asynchronously.
     *
     * Example showing how to update the state of a Characteristic asynchronously instead
     * of using the `on('get')` handlers.
     * Here we change update the motion sensor trigger states on and off every 10 seconds
     * the `updateCharacteristic` method.
     *
     */
    // let motionDetected = false;
    // setInterval(() => {
    //   // EXAMPLE - inverse the trigger
    //   motionDetected = !motionDetected;

    //   // push the new value to HomeKit
    //   motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, motionDetected);
    //   motionSensorTwoService.updateCharacteristic(this.platform.Characteristic.MotionDetected, !motionDetected);

    //   this.platform.log.debug('Triggering motionSensorOneService:', motionDetected);
    //   this.platform.log.debug('Triggering motionSensorTwoService:', !motionDetected);
    // }, 10000);
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
