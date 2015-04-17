# SoundOnDemand

Game oriented sound library using WebAudioAPI. Probably won't get along with mobiles or Internet Explorer - but get things done if you are targeting desktop games, Chrome or Firefox.

Comes in vanilla and playground.js flavor.

Killer features: 

* Sounds don't have to be preloaded hence the Sound On Demand.
* Engine can be divided to separate channels (for music, gui, environment...)
* Each channel can be armed with convolver (for reverb or environmental effects)


## Example

Initialization:

```javascript
var audio = new SoundOnDemand();

var sound = audio.channel("sound");
var music = audio.channel("music");
var enviro = audio.channel("enviro");

enviro.convolver(0.4, "forest");
```

Play music in a loop:

```javascript
music.play("themes/intro").loop().fadeIn();
```

Play a sound and change its pitch (playback rate)

```javascript
sound.play("gunshot").rate(0.8).volume(0.4);
```

Play a loop and manipulate it later:

```javascript
var laserLoop = sound.play("laser").loop();

/* ... */

laserLoop.rate(0.4).volume(1.0);
laserLoop.fadeOut();
```

Or create a new sound from existing one:

```javascript
audio.alias("explosion2", "explosion", rate, volume);

/* ... */

sound.play("explosion2");
```