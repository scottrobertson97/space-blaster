"use strict";

(function registerKeyboard(ns) {
	const KEYBOARD = Object.freeze({
		KEY_LEFT: 37,
		KEY_UP: 38,
		KEY_RIGHT: 39,
		KEY_DOWN: 40,
		KEY_SPACE: 32,
		KEY_SHIFT: 16,
		KEY_W: 87,
		KEY_S: 83,
		KEY_A: 65,
		KEY_D: 68
	});

	class Keyboard {
		constructor() {
			this.keydown = [];
			this.previousKeydown = [];

			window.addEventListener('keydown', e => {
				this.keydown[e.keyCode] = true;
			});

			window.addEventListener('keyup', e => {
				this.keydown[e.keyCode] = false;
			});
		}

		syncPrevious() {
			this.previousKeydown = this.keydown.slice();
		}
	}

	ns.KEYBOARD = KEYBOARD;
	ns.Keyboard = Keyboard;
})(window.SpaceBlaster);
