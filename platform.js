const { HomebridgePlatform } = require('homebridge-platform-helper');

const npmPackage = require('./package.json');
const Accessory = require('./accessories');
const checkForUpdates = require('./helpers/checkForUpdates');
const { discoverDevices, connectToDevices, disconnectDevices } = require('./helpers/devices');

let homebridgeRef

const AppleTVPlatform = class extends HomebridgePlatform {

  constructor (log, config = {}) {
    super(log, config, homebridgeRef);

    if (!config.devices) config.devices = [];
  }

  async addAccessories (accessories) {
    const { config, log } = this;

    this.showMessage();
    setTimeout(checkForUpdates, 1800);

    if (!config.accessories) config.accessories = []

    // Discover Apple TV's
    log(`\x1b[35m[INFO]\x1b[0m Automatically discovering Apple TV's`)

    const devices = await discoverDevices(log);

    devices.forEach((appleTV) => {
      log(`\x1b[35m[INFO]\x1b[0m Discovered Apple TV (${appleTV.name}) at ${appleTV.address}`)

      // Add a PairSwitch accessory unless hidden
      if (config.showPairSwitches !== false) {
        const pairAccessory = new Accessory.PairSwitch(log, appleTV);
        accessories.push(pairAccessory);

        log(`\x1b[35m[INFO]\x1b[0m Added pair switch for Apple TV (${appleTV.name}) at ${appleTV.address}`)
      }

    });

    await connectToDevices(config, log);

    config.devices.forEach((device) => {
      // Add default switches
      if (config.showDefaultSwitches === true) {
        const defaultSwitches = require('./defaultSwitches.json');

        defaultSwitches.forEach((accessory) => {
          accessory.deviceID = device.id;

          if (config.defaultSwitchesIncludeATVName !== false) {
            accessory.name = `${accessory.name} (${device.name})`;
          }

          const switchAccessory = new Accessory.Switch(log, accessory);
          console.log('switchAccessory', switchAccessory)
          accessories.push(switchAccessory);
        })

        log(`\x1b[35m[INFO]\x1b[0m Added default switches for Apple TV (${device.name}). `)
      }
    });

    // Itterate through the config accessories
    config.accessories.forEach((accessory) => {
      const switchAccessory = new Accessory.Switch(log, accessory);
      if (!switchAccessory.ignoreAccessory) accessories.push(switchAccessory);
    })
  }

  showMessage () {
    const { config, log } = this;

    if (config && (config.hideWelcomeMessage || config.isUnitTest)) {
      log(`\x1b[35m[INFO]\x1b[0m Running Homebridge Apple TV Plugin version \x1b[32m${npmPackage.version}\x1b[0m`)

      return
    }

    setTimeout(() => {
      log('')
      log(`**************************************************************************************************************`)
      log(`** Welcome to version \x1b[32m${npmPackage.version}\x1b[0m of the \x1b[34mHomebridge Apple TV Plugin\x1b[0m!`)
      log('** ')
      log(`** Find out what's in the latest release here: \x1b[4mhttps://github.com/lprhodes/homebridge-apple-tv/releases\x1b[0m`)
      log(`** `)
      log(`** If you like this plugin then please star it on GitHub or better yet`)
      log(`** buy me a drink using Paypal \x1b[4mhttps://paypal.me/lprhodes\x1b[0m or crypto \x1b[4mhttps://goo.gl/bEn1RW\x1b[0m.`)
      log(`** `)
      log(`** Keep up to date with this plugin along with everything HomeKit and homebridge`)
      log(`** by signing up to my newsletter at \x1b[4mhttp://workswith.io\x1b[0m`)
      log(`**`)
      log(`** You can disable this message by adding "hideWelcomeMessage": true to the config (see config-sample.json).`)
      log(`**`)
      log(`**************************************************************************************************************`)
      log('')
    }, 6500)
  }
}

AppleTVPlatform.setHomebridge = (homebridge) => {
  homebridgeRef = homebridge
}

module.exports = AppleTVPlatform

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    disconnectDevices();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));