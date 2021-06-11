var hasInstance = false;
const EventEmitter = require('events');

class Automator {
  constructor(table) {
    hasInstance = true;
    this.TimeTable = table;
    this.emitter = new LocalEmitter();
    this.emitter.on('schedule', (scheduleData) => {
      this.scheduleCallback(scheduleData);
    });

    this.parseTimeTable();
  }

  setTimer(unixTime, obj) {
    this.emitter.newTimer(unixTime, obj);
  }

  scheduleCallback(scheduleData) {
    console.log(`Schedule Automator: ${new Date().toLocaleString()} Executing Schedule: '${scheduleData.name}'`);
    scheduleData.exec();
  }

  parseTimeTable() {
    var now = new Date().getTime();
    for (var i in this.TimeTable['events']) {
      var e = this.TimeTable['events'][i];
      var unixTime = toUnixTime(e.time);
      var eventTimeDate = new Date(unixTime);
      console.log(`Schedule Automator: Found event '${e.name}' at ${eventTimeDate.toLocaleString()}`);
      if (unixTime < now) {
        if (e.startAlways) {
          this.setTimer(unixTime, e);
          return;
        }
        if (e.repeats) {
          var unixDate = new Date(unixTime);
          unixDate.setDate(unixDate.getDate() + 1);
          var tomorrowUnix = unixDate.getTime();
          this.setTimer(tomorrowUnix, e);
        } else {
          console.log(`Schedule Automator: '${e.name}' does not repeat and is in the past, not adding to schedule`);
        }
      } else {
        this.setTimer(unixTime, e);
      }
    }
  }
}

module.exports = Automator;

class LocalEmitter extends EventEmitter {
  constructor() {
    super();
    this.WaitingSchedules = [];
  }

  newTimer(unixTime, obj) {
    var unixNow = new Date().getTime();
    var ms = Math.max(0, unixTime - unixNow);
    var self = this;
    var handle = setTimeout(_ => {
      this.removeTimer();
      this.emit('schedule', obj);
    }, ms);
    this.WaitingSchedules.push({
      name: (obj.name || 'unknown'),
      timerHandle: handle,
      expires: unixTime
    });
  }

  removeTimer() {
    var i = 0;
    var arr = this.WaitingSchedules;
    var now = new Date().getTime();
    while (i < arr.length) {
      if (arr[i].expires < now) {
        console.log(`Schedule Automator: Removed '${arr[i].name}' from WaitingSchedules Array`);
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
  }
}

function nowShort() {
  var date = new Date();
  return {
    y: date.getFullYear(),
    m: date.getMonth(),
    d: date.getDate(),
    h: date.getHours(),
    min: date.getMinutes(),
    sec: date.getSeconds()
  }
}

function toUnixTime(obj) {
  switch (obj.format) {
    case 'localTime':
      n = nowShort();
      parsedTime = obj.time.split(':');
      try {
        return new Date(n.y, n.m, n.d, parsedTime[0], parsedTime[1]).getTime();
      } catch (e) {
        console.log(e);
      }
      break;
    case 'date':
      try {
        return new Date(obj.time).getTime();
      } catch (e) {
        console.log(e);
      }
      break;
    default:
      console.log('Schedule Automator: Cannot parse ', obj.format);
      return null;
  }
}
