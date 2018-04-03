const ServiceManagerTypes = require('../helpers/serviceManagerTypes');
const delayForDuration = require('../helpers/delayForDuration');
const catchDelayCancelError = require('../helpers/catchDelayCancelError');
const { getDevice } = require('../helpers/devices');
const AppleTVAccessory = require('./accessory');

class SwitchAccessory extends AppleTVAccessory {

  constructor (log, config, serviceManagerType) { 
    const { deviceID, name } = config;

    let ignoreAccessory = false;

    if (!deviceID) {
      log(`\x1b[31m[CONFIG ERROR]\x1b[0m Each accessory should include a \x1b[33mdeviceID\x1b[0m.`);
      
      ignoreAccessory = true;
    }

    const device = getDevice(deviceID);
    
    if (device) {
      if (!name ) config.name = device.name;
    } else {
      log(`\x1b[31m[CONFIG ERROR]\x1b[0m ${name + '; ' || ''}No connected device could be found with a \x1b[33mdeviceID\x1b[0m of "${deviceID}".`);
      
      ignoreAccessory = true;
    }

    config.persistState = false;

    super(log, config, serviceManagerType);

    this.device = device;
    this.ignoreAccessory = ignoreAccessory;
  }

  setDefaults () {
    const { config } = this;

    config.offDuration = config.offDuration || 0.1;
    config.onDuration = config.onDuration || 0.1;
    config.enableAutoOn = config.enableAutoOn || false;
    if (config.enableAutoOff === undefined) config.enableAutoOff = true;

    this.state.switchState = false;
  }

  reset () {
    super.reset();

    // Clear Timeouts
    if (this.delayTimeoutPromise) {
      this.delayTimeoutPromise.cancel();
      this.delayTimeoutPromise = null;
    }

    if (this.autoOffTimeoutPromise) {
      this.autoOffTimeoutPromise.cancel();
      this.autoOffTimeoutPromise = null;
    }

    if (this.autoOnTimeoutPromise) {
      this.autoOnTimeoutPromise.cancel();
      this.autoOnTimeoutPromise = null
    }
  }

  checkAutoOnOff () {
    this.reset();
    this.checkAutoOn();
    this.checkAutoOff();
  }

  async setSwitchState (command) {
    this.reset();

    if (command) await this.performSend(command);

    this.checkAutoOnOff();
  }

  async checkAutoOff () {
    await catchDelayCancelError(async () => {
      const { config, log, name, state, serviceManager } = this;
      let { disableAutomaticOff, enableAutoOff, onDuration } = config;

      if (state.switchState && enableAutoOff) {
        log(`${name} setSwitchState: (automatically turn off in ${onDuration} seconds)`);

        this.autoOffTimeoutPromise = delayForDuration(onDuration);
        await this.autoOffTimeoutPromise;

        serviceManager.setCharacteristic(Characteristic.On, false);
      }
    });
  }

  async checkAutoOn () {
    await catchDelayCancelError(async () => {
      const { config, log, name, state, serviceManager } = this;
      let { disableAutomaticOn, enableAutoOn, offDuration } = config;

      if (!state.switchState && enableAutoOn) {
        log(`${name} setSwitchState: (automatically turn on in ${offDuration} seconds)`);

        this.autoOnTimeoutPromise = delayForDuration(offDuration);
        await this.autoOnTimeoutPromise;

        serviceManager.setCharacteristic(Characteristic.On, true);
      }
    });
  }

  setupServiceManager () {
    const { name, config, serviceManagerType } = this;
    const { command } = config;
    const { on, off } = command || { };
    
    this.serviceManager = new ServiceManagerTypes[serviceManagerType](name, Service.Switch, this.log);

    this.serviceManager.addToggleCharacteristic({
      name: 'switchState',
      type: Characteristic.On,
      getMethod: this.getCharacteristicValue,
      setMethod: this.setCharacteristicValue,
      bind: this,
      props: {
        defaultValue: false,
        onData: on || command,
        offData: off || undefined,
        setValuePromise: this.setSwitchState.bind(this)
      }
    });
  }
}

module.exports = SwitchAccessory;