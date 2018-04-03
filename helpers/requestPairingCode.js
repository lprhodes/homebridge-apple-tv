const prompt = require('prompt');
prompt.message = '\x1b[35m[INFO]\x1b[0m';
prompt.delimiter = ' ';
prompt.colors = false;
prompt.logger = console;

const requestPairingCode = (log) => {
  return new Promise((resolve, reject) => {
    console.log('');
    console.log('');

    prompt.start();

    prompt.get({
      properties: {
        pairingCode: {
          description: 'Type the Apple TV pairing code then press enter/return.',
          message:'Invalid pairing code',
          required: true
        }
      }
    }, (err, result) => {
      log(`\x1b[35m[INFO]\x1b[0m Attempting to pair to the Apple TV with the code ${result.pairingCode}.`)
      resolve(result);
      prompt.stop();
    });

    console.log('');
    console.log('');
  });
  
}

module.exports = requestPairingCode;