'use strict'

;(function registerConstants(ns) {
  const GAME_STATE = Object.freeze({
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    TITLE: 'TITLE',
  })

  const PROJECTILE_TARGET = Object.freeze({
    PLAYER: 0,
    ENEMY: 1,
  })

  const WAVE_TYPE = Object.freeze({
    LINE: 0,
    WEDGE: 1,
  })

  const ENEMY_TYPE = Object.freeze({
    BASIC: 0,
    HEAVY: 1,
  })

  const ENEMY_BEHAVIOR = Object.freeze({
    LINE: 0,
    ZIGZAG: 1,
  })

  const MIN_TIME_BETWEEN_SPAWNS = 2

  ns.constants = Object.freeze({
    GAME_STATE,
    PROJECTILE_TARGET,
    WAVE_TYPE,
    ENEMY_TYPE,
    ENEMY_BEHAVIOR,
    MIN_TIME_BETWEEN_SPAWNS,
  })

  // Backwards compatibility for any existing global consumers.
  window.GAME_STATE = GAME_STATE
  window.PROJECTILE_TARGET = PROJECTILE_TARGET
  window.WAVE_TYPE = WAVE_TYPE
  window.ENEMY_TYPE = ENEMY_TYPE
  window.ENEMY_BEHAVIOR = ENEMY_BEHAVIOR
})(window.SpaceBlaster)
