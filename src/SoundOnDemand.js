/* options */

/* output: output node, default */
/* audioContext: audioContext */

if (!window.AudioContext) {

  window.AudioContext = window.webkitAudioContext;

  if (!window.AudioContext.prototype.createStereoPanner) {

    window.AudioContext.prototype.createStereoPanner = function() {

      var node = this.createGain();

      node.pan = {
        value: 0
      };

      return node;

    }

  }

}

window.SoundOnDemand = function(options) {

  options = options || {};

  var canPlayMp3 = (new Audio).canPlayType("audio/mp3");
  var canPlayOgg = (new Audio).canPlayType('audio/ogg; codecs="vorbis"');

  if (this.preferedAudioFormat === "mp3") {

    if (canPlayMp3) this.audioFormat = "mp3";
    else this.audioFormat = "ogg";

  } else {

    if (canPlayOgg) this.audioFormat = "ogg";
    else this.audioFormat = "mp3";

  }

  this.audioContext = options.audioContext || new AudioContext;

  this.compressor = this.audioContext.createDynamicsCompressor();
  this.compressor.connect(this.audioContext.destination);

  this.gainNode = this.audioContext.createGain()
  this.gainNode.connect(this.compressor);

  this.input = this.gainNode;

  this.gainNode.gain.value = 1.0;

  this.buffers = {};

  this.channels = {};
  this.aliases = {};

  var lastTick = Date.now();
  var engine = this;

  setInterval(function() {

    var delta = (Date.now() - lastTick) / 1000;

    lastTick = Date.now();

    engine.step(delta);

  }, 1000 / 30);

};

SoundOnDemand.moveTo = function(value, target, step) {

  if (value < target) {
    value += step;
    if (value > target) value = target;
  }

  if (value > target) {
    value -= step;
    if (value < target) value = target;
  }

  return value;

};

SoundOnDemand.prototype = {

  constructor: SoundOnDemand,

  path: "sounds/",

  channel: function(name) {

    if (!this.channels[name]) this.channels[name] = new SoundOnDemand.Channel(this);

    return this.channels[name];

  },

  getAssetEntry: function(path, defaultExtension) {

    /* translate folder according to user provided paths 
       or leave as is */

    var fileinfo = path.match(/(.*)\..*/);
    var key = fileinfo ? fileinfo[1] : path;

    var temp = path.split(".");
    var basename = path;

    if (temp.length > 1) {
      var ext = temp.pop();
      path = temp.join(".");
    } else {
      var ext = defaultExtension;
      basename += "." + defaultExtension;
    }

    var url;

    if (app && app.rewriteURL) {

      url = app.rewriteURL(this.path + basename);

    } else {

      url = this.path + basename;

    }

    return {
      key: key,
      url: url,
      path: this.path + path,
      ext: ext
    };

  },

  loaders: {},

  load: function(key) {

    var engine = this;
    var entry = engine.getAssetEntry(key, engine.audioFormat);

    if (!this.loaders[key]) {

      this.loaders[key] = new Promise(function(resolve, reject) {

        if (engine.buffers[entry.key]) return resolve(engine.buffers[entry.key]);

        var request = new XMLHttpRequest();

        request.open("GET", entry.url, true);
        request.responseType = "arraybuffer";

        request.onload = function() {

          engine.audioContext.decodeAudioData(this.response, function(decodedBuffer) {

            engine.buffers[entry.key] = decodedBuffer;
            resolve(decodedBuffer);

          });

        }

        request.send();

      });

    }

    return this.loaders[key];

  },

  step: function(delta) {

    for (var key in this.channels) {

      this.channels[key].step(delta);

    }

  },

  duplicate: function(source, as, volume, rate) {

    var engine = this;

    this.load(source).then(function() {

      engine.buffers[source];

      engine.buffers[as] = engine.buffers[source];

    });

  },

  alias: function(name, source, rate, volume) {

    this.aliases[name] = {
      source: source,
      rate: rate,
      volume: volume
    };

  }

};