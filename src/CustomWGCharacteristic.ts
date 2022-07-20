import {API, Characteristic, CharacteristicProps, Formats, Perms, WithUUID} from 'homebridge';

export class CustomWGCharacteristic {

  private api: API;
  public characteristic: { [key: string]: WithUUID< { new(): Characteristic }> } = {};

  constructor(api: API) {
    this.api = api;

    this.createCharacteristics('FreeChlorine', 'B863F10D-079E-48FF-8F27-9C2605A29F52', {
      format: Formats.FLOAT,
      perms: [Perms.NOTIFY, Perms.PAIRED_READ],
    }, 'Free Chlorine');

    this.createCharacteristics('pH', 'B863F10C-079E-48FF-8F27-9C2605A29F52', {
      format: Formats.FLOAT,
      perms: [Perms.NOTIFY, Perms.PAIRED_READ],
    }, 'pH');
  }

  private createCharacteristics(key: string, uuid: string, props: CharacteristicProps, displayName: string = key) {
    this.characteristic[key] = class extends this.api.hap.Characteristic {
      static readonly UUID: string = uuid;

      constructor() {
        super(displayName, uuid, props);
        this.value = this.getDefaultValue();
      }
    };
  }

}