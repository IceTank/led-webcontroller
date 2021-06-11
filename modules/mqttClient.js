//mqttJsClient v1

const mqtt = require('mqtt');
const EventEmitter = require('events');

class Client extends EventEmitter {
  constructor(options) {
    if (!options || !options.MQTT_PATH || !options.MQTT_SERVER)
      throw new Error('Need MQTT_PATH and MQTT_SERVER')
    super();

    this.MQTT_PATH = options.MQTT_PATH;
    this.MQTT_SERVER = options.MQTT_SERVER;

    this.client = mqtt.connect(this.MQTT_SERVER);
    this.client.on('connect', () => {
      this.client.subscribe(this.MQTT_PATH, (err) => {
        if (!err) {
          this.MQTT_CLIENT_READY = true;
          this.emit('ready');
        }
      });
    })
    this.client.on('message', (topic, message) => {
      this.emit('message', topic, message)
    });
    this.MQTT_CLIENT_READY = false;
  }

  get isReady() {
    return this.MQTT_CLIENT_READY;
  }

  publish(path, message) {
    this.client.publish(path, message);
  }

  changeLeds(mode) {
    if (mode && mode.pattern) {
      if (mode.numActive) {
        var message = `set,numActive,${mode.numActive}`;
        console.log('Changing numActive to: ' + mode.numActive);
        this.publish(this.MQTT_PATH, message);
      }
      var message = `led,${mode.pattern}${mode.args ? ',' + mode.args.join(',') : ''}`;
      console.log(`Changing Led Pattern to: ${mode.pattern}`);
      console.log(message);
      this.publish(this.MQTT_PATH, message);
    }
  }
}

module.exports = Client;
