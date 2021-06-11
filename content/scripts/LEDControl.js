var starting_data = JSON.parse(document.getElementById('starting_data').innerText);

var brightness = starting_data.currentActive;
var cooldownTimer;
var isOnCooldown = false;

function addBrightness() {
  if (brightness > 1) {
    document.getElementById('brightness').innerText = --brightness;
  }
}

var colorPickerData = {
  place : 'picker',
  input : 'color_value',
  size: 300,
  userEvents: {
    // updateinput : function(handler, input, manualEnter) {},
    change : function(handler) {
      colorPickerUpdate();
    }
    // mousemoveh : function(event, handler, dot) {},
    // mouseuph : function(event, handler, dot) {},
    // mousemovesv : function(event, handler, dot) {},
    // mouseupsv : function(event, handler, dot) {},
    // mousemoverest : function(event, handler, dot) {},
    // mouseupalpha : function(event, handler, dot) {},
    // mousemovealpha : function(event, handler, dot) {},
    // setmethod : function (handler, newMethod) {},
    // selectcolorsaver : function (handler, colorSaverObj) {},
  }
}

if (starting_data.currentColor) {
  colorPickerData['color'] = `rgb(${starting_data.currentColor.r},${starting_data.currentColor.g},${starting_data.currentColor.b})`;
}

new KellyColorPicker(colorPickerData);

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function colorPickerUpdate() {
  if (!isOnCooldown) {
    if (document.getElementById('rgb_auto_update').checked) {
      postCustomColor();
      cooldownTimer = setTimeout(() => {
        isOnCooldown = false;
      }, 100);
    }
  }
}

function lowerBrightness() {
  if (brightness < 10) {
    document.getElementById('brightness').innerText = ++brightness;
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

function postCustomColor() {
  var value = document.getElementById('color_value').value;
  rgb = hexToRgb(value);
  postSignal('customSolidColor', rgb.r, rgb.g, rgb.b);
  isOnCooldown = true;
}

function postSignal(data, ...args) {
  const url = `/signal?setmode=${data}&num=${brightness}${args ? '&args=' + args.join(',') : ''}`;
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
}
