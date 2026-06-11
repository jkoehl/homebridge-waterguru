import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { WaterguruPlatform } from './platform';

export class WaterguruPlatformAccessory {
  private service!: Service;

  constructor(
    private readonly platform: WaterguruPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    const key = this.accessory.context.measurementKey;

    // Accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'WaterGuru')
      .setCharacteristic(this.platform.Characteristic.Model, 'Sense')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.accessory.UUID);

    if (key === 'temp') {
      this.service = this.accessory.getService(this.platform.Service.TemperatureSensor) ||
        this.accessory.addService(this.platform.Service.TemperatureSensor);
      this.service.setCharacteristic(this.platform.Characteristic.Name, 'Pool Temperature');
      this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
        .onGet(this.getCurrentTemp.bind(this));
    } else if (key === 'ph') {
      this.service = this.accessory.getService(this.platform.Service.LightSensor) ||
        this.accessory.addService(this.platform.Service.LightSensor);
      this.service.setCharacteristic(this.platform.Characteristic.Name, 'Pool pH');
      this.service.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
        .setProps({ minValue: 0, maxValue: 14, minStep: 0.1 })
        .onGet(this.getCurrentPh.bind(this));
    } else if (key === 'chlorine') {
      this.service = this.accessory.getService(this.platform.Service.LightSensor) ||
        this.accessory.addService(this.platform.Service.LightSensor);
      this.service.setCharacteristic(this.platform.Characteristic.Name, 'Pool Chlorine');
      this.service.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
        .setProps({ minValue: 0, maxValue: 10, minStep: 0.1 })
        .onGet(this.getCurrentFreeChlorine.bind(this));
    }
  }

  async getWaterBody() {
    const waterBodyId = this.accessory.context.device.waterBodyId;
    const waterBody = await this.platform.waterguruSvc?.getWaterbodyInfo(waterBodyId);
    if (!waterBody) {
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
    this.accessory.context.device = waterBody;
    return waterBody;
  }

  async getCurrentTemp(): Promise<CharacteristicValue> {
    try {
      const waterBody = await this.getWaterBody();
      return (5 / 9) * (waterBody.waterTemp - 32);
    } catch (error) {
      this.platform.log.error('Failed to get temperature:', error);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  async getCurrentFreeChlorine(): Promise<CharacteristicValue> {
    try {
      const waterBody = await this.getWaterBody();
      const measurement = waterBody.measurements.find((m) => m.type === 'FREE_CL');
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
      const waterBody = await this.getWaterBody();
      const measurement = waterBody.measurements.find((m) => m.type === 'PH');
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
