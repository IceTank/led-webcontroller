const express = require('express');
const app = express();
const EventEmitter = require('events');

const ContentPath = __dirname + '/../content/';

function initExpressEndpoints(instance, app) {
  app.use(express.static(ContentPath));
  app.set('view engine', 'pug');

  app.get('/LEDControl', (req, res) => {
    res.render('LEDControl', {
      LEDscurrentActive: instance.LEDs.currentActive,
      LEDscurrentColor: instance.LEDs.currentColor
     })
  });

  app.get('/signal*', (req, res) => {
    if (req.query) {
      if (req.query.setmode) {
        var setmode = req.query.setmode;
        var num = 2;
        var args = [];
        var emitData = {};
        if (req.query.args) {
          args = req.query.args.split(',');
          emitData['args'] = args;
          if (req.query.setmode === 'customSolidColor') {
            instance.LEDs.currentColor = {
              r: args[0],
              g: args[1],
              b: args[2]
            };
          } else {
            instance.LEDs.currentColor = null;
          }
        }
        if (req.query.num && !Number.isNaN(Number(req.query.num))) {
          num = Number(req.query.num);
          if (instance.LEDs.currentActive !== num){
            instance.LEDs.currentActive = num;
          } else {
            num = null;
          }
        }
        if (num) {
          emitData['numActive'] = num;
        }
        emitData['pattern'] = setmode;
        instance.emit('changePattern', emitData);
        res.send('OK');
      } else {
        res.send('Wrong query');
      }
    } else {
      res.send('No query');
    }
  });
}

class webServer extends EventEmitter{
  constructor(options) {
    super();
    if (!options || !options.PORT) {
      throw new Error('no port');
    }
    this.PORT = options.PORT;
    this.app = express();

    this.LEDs = {}
    this.LEDs.currentActive = 2;
    this.LEDs.currentColor = null;

    initExpressEndpoints(this, this.app);
  }

  endPointGet(path, callback) {
    this.app.get(path, callback);
  }

  finalise() {
    this.app.listen(this.PORT, () => {
      this.emit('ready');
    });
  }
}

module.exports = webServer;
