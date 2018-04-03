const { expect } = require('chai');

const { log, setup } = require('./helpers/setup')
const FakeServiceManager = require('./helpers/fakeServiceManager')

const delayForDuration = require('../helpers/delayForDuration')

const { Switch } = require('../accessories')

const data = {
  on: 'ON',
  off: 'OFF'
}

// TODO: Check cancellation of timeouts

describe('switchAccessory', () => {

  // Switch Turn On
  it('turns on', async () => {
    const { device } = setup();

    const config = {
      data,
      persistState: false,
      host: device.host.address
    }
    
    
    const switchAccessory = new Switch(null, config, 'FakeServiceManager')
    switchAccessory.serviceManager.setCharacteristic(Characteristic.On, true)
    
    expect(switchAccessory.state.switchState).to.equal(true);

    // Check hex code was sent
    const hasSentCode = device.hasSentCode('ON');
    expect(hasSentCode).to.equal(true);

    // Check that only one code has been sent
    const sentHexCodeCount = device.getSentHexCodeCount();
    expect(sentHexCodeCount).to.equal(1);
  });


  // Switch Turn On then Off
  it('turns off', async () => {
    const { device } = setup();

    const config = {
      data,
      persistState: false,
      host: device.host.address
    }
    
    const switchAccessory = new Switch(null, config, 'FakeServiceManager')

    // Turn On Switch
    switchAccessory.serviceManager.setCharacteristic(Characteristic.On, true)
    expect(switchAccessory.state.switchState).to.equal(true);
    
    // Turn Off Switch
    switchAccessory.serviceManager.setCharacteristic(Characteristic.On, false)
    expect(switchAccessory.state.switchState).to.equal(false);

    // Check hex code was sent
    const hasSentCodes = device.hasSentCodes([ 'ON', 'OFF' ]);
    expect(hasSentCodes).to.equal(true);

    // Check that only one code has been sent
    const sentHexCodeCount = device.getSentHexCodeCount();
    expect(sentHexCodeCount).to.equal(2);
  });


  // Auto Off
  it('"enableAutoOff": true, "onDuration": 1', async () => {
    const { device } = setup();

    const config = {
      data,
      persistState: false,
      host: device.host.address,
      enableAutoOff: true,
      onDuration: 1
    }
    
    const switchAccessory = new Switch(null, config, 'FakeServiceManager')


    // Turn On Switch
    switchAccessory.serviceManager.setCharacteristic(Characteristic.On, true)
    expect(switchAccessory.state.switchState).to.equal(true);

    await delayForDuration(0.4)
    // Expecting on after 0.4s total
    expect(switchAccessory.state.switchState).to.equal(true);
    
    await delayForDuration(0.7)
    // Expecting off after 1.1s total
    expect(switchAccessory.state.switchState).to.equal(false);
  }).timeout(4000);


  // Auto On
  it('"enableAutoOn": true, "offDuration": 1', async () => {
    const { device } = setup();

    const config = {
      data,
      persistState: false,
      host: device.host.address,
      enableAutoOn: true,
      offDuration: 1
    }
    
    const switchAccessory = new Switch(null, config, 'FakeServiceManager')

    // Turn On Switch
    switchAccessory.serviceManager.setCharacteristic(Characteristic.On, true)
    expect(switchAccessory.state.switchState).to.equal(true);

    // Turn Off Switch
    switchAccessory.serviceManager.setCharacteristic(Characteristic.On, false)
    expect(switchAccessory.state.switchState).to.equal(false);

    await delayForDuration(0.4)
    // Expecting off after 0.4s total
    expect(switchAccessory.state.switchState).to.equal(false);
    
    await delayForDuration(0.7)
    // Expecting on after 1.1s total
    expect(switchAccessory.state.switchState).to.equal(true);
  }).timeout(4000);
})