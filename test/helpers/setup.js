const hap = require('hap-nodejs');

const AppleTVPlatform = require('../../platform');
const FakeDevice = require('./fakeDevice')

global.Service = hap.Service;
global.Characteristic = hap.Characteristic;

const log = (message, more) => {
  if (more) {
    // console.log(message, more)
  } else {
    // console.log(message)
  }
};

const setup = (config) => {
  const platform = new AppleTVPlatform(log, config);

  const device = new FakeDevice()
  addDevice(device)

  return { platform, device }
}

const getAccessories = (config, replacementLog) => {
  const { platform, device } = setup(config)

  const accessoriesPromise = new Promise((resolve, reject) => {
    platform.accessories(resolve);
  })

  return accessoriesPromise
}

module.exports = { log, setup, getAccessories }