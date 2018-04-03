const ServiceManager = require('../helpers/serviceManager');
const ServiceManagerTypes = require('../helpers/serviceManagerTypes');

const HomebridgePlatformAccessory = require('./accessory');
const requestPairingCode = require('../helpers/requestPairingCode');

class PairSwitchAccessory extends HomebridgePlatformAccessory {

  constructor (log, appleTV, serviceManagerType) {    
    const config = {};
    config.name = `Pair ${appleTV.name}` || 'Pair Apple TV';
    config.persistState = false;

    super(log, config, serviceManagerType);

    this.appleTV = appleTV;
  }

  async togglePairing (props, on, callback) {
    const { config, log, serviceManager } = this;

    const turnOffCallback = () => {
      serviceManager.setCharacteristic(Characteristic.On, false);
    }

    callback();

    if (on) {
      let connection;
      let connectedAppleTV;

      try {
        connection = await this.appleTV.openConnection();

        const pairCallback = await connection.pair();
        
        const { pairingCode } = await requestPairingCode(log);
        
        connectedAppleTV = await pairCallback(pairingCode);
      
        log('\x1b[32m[SUCCESS]: \x1b[0m Pairing was successful!');
        log('Add the following to the \x1b[33mdevices\x1b[0m array in the config then restart homebridge:');
        console.log('\x1b[33m{\x1b[0m');
        console.log('\x1b[33m  "id": "lounge",\x1b[0m');
        console.log('\x1b[33m  "name": "Lounge Apple TV",\x1b[0m');
        console.log(`\x1b[33m  "credentials": "${connectedAppleTV.credentials.toString()}"\x1b[0m`);
        console.log('\x1b[33m}\x1b[0m');

        connectedAppleTV.closeConnection();
      } catch (err) {
        log(`\x1b[31m[ERROR]: \x1b[0m${err.message}`)
        log(err.stack)

        if (connectedAppleTV) {
          connectedAppleTV.closeConnection();
        } else {
          connection.closeConnection();
        }

        return;
      }
    }
  }

  setupServiceManager () {
    const { data, name, config, serviceManagerType } = this;
    const { on, off } = data || { };

    this.serviceManager = new ServiceManagerTypes[serviceManagerType](name, Service.Switch, this.log);

    this.serviceManager.addToggleCharacteristic({
      name: 'switchState',
      type: Characteristic.On,
      getMethod: this.getCharacteristicValue,
      setMethod: this.togglePairing.bind(this),
      bind: this,
      props: {
      
      },
      bind: this
    })
  }
}

module.exports = PairSwitchAccessory
