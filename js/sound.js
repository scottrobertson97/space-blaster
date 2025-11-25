"use strict";

const EFFECT_SOUNDS = [
	"laser1.ogg",
	"laser2.ogg",
	"laser3.ogg",
	"laser4.ogg",
	"laser5.ogg",
	"laser6.ogg",
	"laser7.ogg",
	"laser8.ogg",
	"laser9.ogg"
];

export class Sound {
	constructor(bgAudioSelector = '#bgAudio') {
		this.bgAudio = document.querySelector(bgAudioSelector);
		this.currentEffect = 0;
		this.currentDirection = 1;
		this.effectSounds = EFFECT_SOUNDS;
		if (this.bgAudio) {
			this.bgAudio.volume = 0.25;
		}
	}

	stopBGAudio() {
		if (!this.bgAudio) return;
		this.bgAudio.pause();
		this.bgAudio.currentTime = 0;
	}

	playEffect(index = -1) {
		const effectSound = new Audio();
		effectSound.volume = 0.1;

		if (index < 0 || index >= this.effectSounds.length) {
			index = this.currentEffect;
			this.currentEffect += this.currentDirection;
			if (this.currentEffect === this.effectSounds.length || this.currentEffect === -1) {
				this.currentDirection *= -1;
				this.currentEffect += this.currentDirection;
			}
		}

		effectSound.src = `media/${this.effectSounds[index]}`;
		effectSound.play();
	}

	playBGAudio() {
		if (this.bgAudio) {
			this.bgAudio.play();
		}
	}
}
