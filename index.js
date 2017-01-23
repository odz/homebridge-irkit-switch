var Service, Characteristic, homebridge;
var http = require('http');
var irkit = require('irkit-local');

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory(
    'homebridge-irkit-switch',
    'IRKitSwitch',
    IRKitSwitch
  );
}

function IRKitSwitch(log, config) {
  this.log = log;
  this.config = config;
}

IRKitSwitch.prototype.getServices = function() {
  var informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, "IRKitSwitch")
    .setCharacteristic(Characteristic.Model, this.config.name)
    .setCharacteristic(Characteristic.SerialNumber, this.config.name);

  var switchService = new Service[this.config.service](this.config.name);

  if (switchService.testCharacteristic(Characteristic.On)) {
    this.powerOn = 0;
    switchService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getPowerOn.bind(this))
      .on('set', this.setPowerOn.bind(this));
  }

  return [informationService, switchService];
}

IRKitSwitch.prototype.getPowerOn = function(callback) {
  callback(this.powerOn);
}

IRKitSwitch.prototype.setPowerOn = function(powerOn, callback) {
  var data;

  if (powerOn) {
    data = this.config.data.on;
  } else {
    data = this.config.data.off;
  }

  var self = this;
  var log = this.log;
  log.info('trying to set ', powerOn);

  irkit.send(this.config.irkit_host, data, 5, 500)
    .then(function() {
      log.info('passed');
      self.powerOn = powerOn;
      callback(null);
    })
    .catch(function(e) {
      log.error('failed');
      callback(e);
    });
}
