const uuid = require('uuid');

const { HomebridgeAccessory } = require('homebridge-platform-helper');

const sendCommand = require('../helpers/sendCommand');
const delayForDuration = require('../helpers/delayForDuration');
const catchDelayCancelError = require('../helpers/catchDelayCancelError');

class AppleTVAccessory extends HomebridgeAccessory {

  constructor (log, config = {}, serviceManagerType) {
    if (!config.name) config.name = "Unknown Accessory"

    super(log, config, serviceManagerType);
    if (config.debug) this.debug = true

    this.manufacturer = 'Apple';
    this.model = 'Apple TV';
    this.serialNumber = uuid.v4();
  }

  reset () {
    // Clear Multi-command timeouts
    if (this.intervalTimeoutPromise) {
      this.intervalTimeoutPromise.cancel();
      this.intervalTimeoutPromise = null;
    }

    if (this.pauseTimeoutPromise) {
      this.pauseTimeoutPromise.cancel();
      this.pauseTimeoutPromise = null;
    }
  }

  async performSend (command) {
    const { debug, device, config, log, name } = this;

    if (typeof command === 'string') {
      sendCommand({ device, command, log, name, debug });

      return;
    }

    await catchDelayCancelError(async () => {
      // Itterate through each command config in the array
      for (let index = 0; index < command.length; index++) {
        let pause;
        const currentCommand = command[index];

        if (typeof currentCommand === 'string') {
          sendCommand({ device, command: currentCommand, log, name, debug });
        } else {
          await this.performRepeatSend(currentCommand);

          pause = currentCommand.pause;
        }

        if (!pause) pause = 0.5;
        this.pauseTimeoutPromise = delayForDuration(pause);
        await this.pauseTimeoutPromise;
      }
    });
  }

  async performRepeatSend (parentData) {
    const { host, log, name, debug } = this;
    let { command, interval, repeat } = parentData;

    repeat = repeat || 1
    if (repeat > 1) interval = interval || 0.5;

    // Itterate through each command config in the array
    for (let index = 0; index < repeat; index++) {
      await this.performSend(command);

      if (interval && index < repeat - 1) {
        this.intervalTimeoutPromise = delayForDuration(interval);
        await this.intervalTimeoutPromise;
      }
    }
  }
}

module.exports = AppleTVAccessory;
