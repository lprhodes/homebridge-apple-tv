const { assert } = require('chai')

module.exports = ({ device, command, log, name, debug }) => {
  assert(command, `\x1b[31m[CONFIG ERROR]: \x1b[0m${name} (\x1b[33mcommand\x1b[0m is missing)`);

  log(`${name} sendCommand (\x1b[33m${command}\x1b[0m)`);

  switch (command) {
    case "up":
      return device.sendKeyPressAndRelease(1, 0x8C);
    case "down":
      return device.sendKeyPressAndRelease(1, 0x8D);
    case "left":
      return device.sendKeyPressAndRelease(1, 0x8B);
    case "right":
      return device.sendKeyPressAndRelease(1, 0x8A);
    case "menu":
      return device.sendKeyPressAndRelease(1, 0x86);
    case "play":
      return device.sendKeyPressAndRelease(12, 0xB0);
    case "pause":
      return device.sendKeyPressAndRelease(12, 0xB1);
    case "next":
      return device.sendKeyPressAndRelease(12, 0xB5);
    case "previous":
      return device.sendKeyPressAndRelease(12, 0xB6);
    case "sleep":
    case "suspend":
    case "wake":
      return device.sendKeyPressAndRelease(1, 0x82);
    case "stop":
      return device.sendKeyPressAndRelease(12, 0xB7);
    case "select":
      return device.sendKeyPressAndRelease(1, 0x89);
    case "top_menu":
    case "tv":
      return device.sendKeyPressAndRelease(12, 0x60);
    case "siri":
    case "mic":
      return device.sendKeyPressAndRelease(12, 0x04);
    default: {
      log(`\x1b[31m[ERROR]: \x1b[0m${name} sendCommand (\x1b[33m${command}\x1b[0m is not a valid command)`);
    }
  }
}
