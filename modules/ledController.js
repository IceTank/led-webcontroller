class LedController {
  constructor(mqttClient) {
    if (!mqttClient) throw new Error('Need a mqtt client');
    this.mqttClient = mqttClient;
  }

  setCustomColor(arg1, g, b) {
    var color = "";
    if (g) {
      color = `${arg1},${g},${b}`;
    } else {
      var rgb = hexToRgb(arg1);
      color = `${rgb.r},${rgb.g},${rgb.b}`;
    }
    var message = `led,customSolidColor,${color}`;
    console.log('Led Controller: Led Controller Sending Message:' + message);
    this.mqttClient.publish(this.mqttClient.MQTT_PATH, message);
  }

  setLeds(mode) {
    if (mode && mode.pattern) {
      let message
      if (mode.numActive) {
        message = `set,numActive,${mode.numActive}`;
        console.log('Led Controller: Changing numActive to: ' + mode.numActive);
        this.mqttClient.publish(this.mqttClient.MQTT_PATH, message);
      }
      message = `led,${mode.pattern}${mode.args ? ',' + mode.args.join(',') : ''}`;
      console.log(`Led Controller: Changing Led Pattern to: ${mode.pattern}`);
      console.log(message);
      this.mqttClient.publish(this.mqttClient.MQTT_PATH, message);
    }
  }

  setLedBrightness(brightness) {
    var message = `set,numActive,${Math.round(brightness)}`;
    console.log('Led Controller: Changing numActive to: ' + brightness);
    this.mqttClient.publish(this.mqttClient.MQTT_PATH, message);
  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r, g, b) {
  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(_ => {
      resolve();
    }, ms);
  });
}

exports.constructor = LedController;
exports.rgbToHex = rgbToHex;
exports.hexToRgb = hexToRgb;
exports.sleep = sleep;
