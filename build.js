require('shelljs/global');

var files = [

  "license.txt",
  
  "src/SoundOnDemand.js",
  "src/Events.js",
  "src/Channel.js",
  "src/Sound.js"

];

var builds = {

  "SoundOnDemand.js": [
  ]

};

for (var key in builds) {

  var extra = builds[key];

  var output = cat(files.concat(extra));
  
  output.to("build/" + key);

}

