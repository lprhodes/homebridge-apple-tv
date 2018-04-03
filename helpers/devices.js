const { scan, parseCredentials } = require('node-appletv');

const discoverDevices = async (log) => {
  const devices = await scan();
  
  devices.forEach((device) => {
    if (device.service.addresses.length > 0) {
      const addresses = device.service.addresses.filter(address => address.includes('.'));
      device.address = addresses[0];
    }

    discoveredDevices[device.uid] = device;
  })

  return devices;
}

const discoveredDevices = {};
const connectedDevices = {};

const connectToDevices = async (config, log) => {
  let { devices } = config;

  if (!devices) devices = [];
  if (devices && !Array.isArray(devices)) return log('\x1b[31m[CONFIG ERROR]\x1b[0m The \x1b[33mdevices\x1b[0m config option should be wrapped in square brackes: \x1b[33m[{ "configID": "lounge", "name": "ATV Lounge", "uid": "2E7BB26D-2B5C-4FD0-B7EB-3F1F8B1AA1E1", "credentials": "cr3d3nt14l$..." }]\x1b[0m.')

  for (let i = 0; i < devices.length; i++) {
    const configDevice = devices[i];
    const { id, name, credentials } = configDevice;

    const uid = credentials.split(':')[0];
    const pairingData = credentials.split(':')[1];
    // TODO: Add uid verification here.

    const device = discoveredDevices[uid];

    if (!device) continue;

    device.name = name;
    device.deviceID = id;

    log(`\x1b[35m[INFO]\x1b[0m Connecting to "${device.name}"`);
    try {
      const parsedCredentials = parseCredentials(credentials);
      connectedDevices[id] = await device.openConnection(parsedCredentials);
      log(`\x1b[35m[INFO]\x1b[0m Connected to "${device.name}"`);
      
    } catch (err) {
      log(`\x1b[31m[ERROR]\x1b[0m Could not connect to "${device.name}". Try removing the device from the \x1b[33mdevices\x1b[0m config then restarted hombridge and re-pair.`);
    }
  }
}

const getDevice = (deviceID) => {
  return connectedDevices[deviceID]
}

const disconnectDevices = () => {
  Object.keys(connectedDevices).forEach((deviceID) => {
    const device = connectedDevices[deviceID];
    device.closeConnection();
  })

  console.log(`Disconnected Apple TV's`);
}

module.exports = { getDevice, discoverDevices, connectToDevices, disconnectDevices };