const mqttClient = require('./modules/mqttClient');
const webServer = require('./modules/webServer');
const readline = require('readline');
const scheduleAutomator = require('./modules/scheduleAutomator');
const ledController = require('./modules/ledController');

const MQTT_SERVER = 'mqtt://localhost';
const MQTT_PATH = 'ch_lichter1';
const PORT_LED_CONTROLL = 7090;

//MQTT Client init
const client = new mqttClient({
  MQTT_PATH: MQTT_PATH,
  MQTT_SERVER: MQTT_SERVER
});

client.on('ready', () => {
  console.log('MQTT Client: Ready');
});

client.on('message', (topic, message) => {
  console.log(`MQTT Client: Topic: ${topic}: '${message}'`);
});

//ledController
const ledControll = new ledController.constructor(client);

//scheduleAutomator init
const TimeTable = {
  "events": [{
    name: "Start Dimmer",
    time: {
      format: "localTime",
      time: "19:00"
    },
    exec: function() {
      startDimmer()
    },
    repeats: true,
    startAlways: true
  }]
};

const colors = ['#0c07c1', '#3500bd', '#4a00b9','#5a00b4','#6700b0','#7200ab','#7c00a6','#8400a1','#8c009c','#940097','#9a0092','#a0008c','#a60087','#ab0082','#b0007d','#b40077','#b80072','#bc006d','#bf0068','#c20063','#c4005e','#c60059','#c80054','#ca004f','#cb004a','#cc0045','#cd0041','#ce003c','#ce0038','#ce0034','#ce002f','#ce002b','#ce0027','#cd0022','#cc001e','#cb0019','#ca0014','#c9130e','#c82007','#c62900'];
const numColors = colors.length;
const MinuteSteps = 5;
const StartHoure = 18;
const ResetHoure = 0;
const MinBrightness = 8;
const MaxBrightness = 2;
const scheduler = new scheduleAutomator(TimeTable);
var dimmerIntervalHandle;
var ResetTime;

function startDimmer() {
  var now = new Date();
  var ResetTime = new Date();
  ResetTime.setHours(0);
  if (ResetTime.getTime() < now.getTime()) {
    ResetTime.setDate(ResetTime.getDate() + 1);
  }
  console.log('Dimmer: Starting Dimmer');
  console.log('Dimmer: ResetTime is:', ResetTime.toLocaleString());
  dimmer();
  const intervalms = 10 * 60 * 1000;
  dimmerIntervalHandle = setInterval(_ => {
    dimmer();
  }, intervalms);
  setTimeout(_ => {
    clearInterval(dimmerIntervalHandle);
  }, now.getTime() - ResetTime.getTime());
}

function dimmer() {
  const now = new Date();
  const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), StartHoure);
  var msPassed = now.getTime() - startTime.getTime();
  var minutesPassed = ((msPassed / 1000) / 60);
  var colorIndex = Math.max(0, Math.min(numColors -1, Math.floor(minutesPassed / MinuteSteps)));
  var brightness = Math.round((colorIndex / numColors) * (MinBrightness - MaxBrightness)) + MaxBrightness;
  console.log('Dimmer: Set Led to', colorIndex, 'Brightness', brightness);
  ledControll.setCustomColor(colors[colorIndex]);
  ledController.sleep(300).then(_ => {
    ledControll.setLedBrightness(brightness);
  });
}


//Webserver init
const server = new webServer({
  PORT: PORT_LED_CONTROLL
});

server.endPointGet('/test*', (req, res) => {
  res.send('This a test')
});

server.finalise();

server.on('ready', () => {
  console.log(`Web Server: Ready running on Port ${PORT_LED_CONTROLL}`);
});

server.on('changePattern', (obj) => {
  ledControll.setLeds(obj);
});

//Readline init
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
  args = line.split(' ');
  if (args.length > 0 && args[0] === 'test') {
    console.log('Publishing :' + args[1]);
    if (client.isReady) {
      client.publish(MQTT_PATH, args[1])
    } else {
      console.log('Error Client not ready');
    }
  }
});
