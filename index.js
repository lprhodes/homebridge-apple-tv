const AppleTVPlatform = require('./platform')

module.exports = (homebridge) => {
  global.Service = homebridge.hap.Service;
  global.Characteristic = homebridge.hap.Characteristic;

  AppleTVPlatform.setHomebridge(homebridge);

  homebridge.registerPlatform("homebridge-apple-tv", "AppleTV", AppleTVPlatform);
}