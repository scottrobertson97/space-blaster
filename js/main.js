'use strict'

import { Game } from './game.js'

function boot() {
  const game = new Game()
  window.addEventListener('blur', game.pauseGame)
  window.addEventListener('focus', game.resumeGame)

  game.start()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
