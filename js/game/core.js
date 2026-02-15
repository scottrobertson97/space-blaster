'use strict'

;(function registerGameCore(ns) {
  const { GAME_STATE, WAVE_TYPE, MIN_TIME_BETWEEN_SPAWNS } = ns.constants

  class Game {
    constructor({ width = 800, height = 600, canvasId = 'canvas' } = {}) {
      this.WIDTH = width
      this.HEIGHT = height
      this.canvas = document.getElementById(canvasId)
      if (!this.canvas) {
        throw new Error(`Canvas with id "${canvasId}" not found.`)
      }
      this.canvas.width = this.WIDTH
      this.canvas.height = this.HEIGHT
      this.ctx = this.canvas.getContext('2d')

      this.keyboard = new ns.Keyboard()
      this.sound = new ns.Sound()

      this.lastTime = performance.now()
      this.dt = 0
      this.animationID = 0
      this.gameState = GAME_STATE.TITLE
      this.lastState = GAME_STATE.TITLE
      this.points = 0
      this.lives = 3
      // this.playerLifeImage = document.getElementById('playerLife')
      this.projectiles = []
      this.enemies = []
      this.stars = []
      this.enemySpawnTime = 0
      this.timeBetweenEnemySpawns = 10
      this.update = this.update.bind(this)
      this.pauseGame = this.pauseGame.bind(this)
      this.resumeGame = this.resumeGame.bind(this)
      this.isLoopRunning = false
    }

    async loadImage(source) {
      return new Promise(resolve => {
        const img = new Image()
        console.log({ img })
        img.onload = () => {
          const bitmap = window.createImageBitmap(img)
          resolve(bitmap)
        }
        img.src = `images/${source}.png`
      })
    }

    /**
     *
     * @param {string[]} sources
     * @returns {ImageBitmap[]}
     */
    async loadImages(sources) {
      const loadImages = await Promise.all(sources.map(this.loadImage))
      const images = {}
      sources.forEach((src, i) => {
        images[src] = loadImages[i]
      })
      return images
    }

    async start() {
      this.images = await this.loadImages([
        'enemyBlack1',
        'enemyBlack4',
        'laserBlue01',
        'laserRed01',
        'playerLife1_red',
        'playerShip1_red',
        'playerShip1_damage1',
        'playerShip1_damage2',
        'playerShip1_damage3',
      ])

      this.player = this.createPlayer()
      this.createStars()
      this.bindUI()

      this.playerLifeImage = this.images['playerLife1_red']

      this.startLoop()
    }

    update() {
      if (!this.isLoopRunning) return

      this.animationID = requestAnimationFrame(this.update)
      this.dt = this.calculateDeltaTime()

      switch (this.gameState) {
        case GAME_STATE.MENU:
          break
        case GAME_STATE.PLAYING:
          this.enemySpawnTime -= this.dt
          if (this.enemySpawnTime <= 0) {
            this.enemySpawnTime = this.timeBetweenEnemySpawns
            this.timeBetweenEnemySpawns = Math.max(
              MIN_TIME_BETWEEN_SPAWNS,
              this.timeBetweenEnemySpawns * 0.9
            )
            if (Math.random() < 0.5) {
              this.spawnWave(WAVE_TYPE.LINE)
            } else {
              this.spawnWave(WAVE_TYPE.WEDGE)
            }
          }
          this.updateStars()
          this.playerControls()
          this.updatePlayer()
          this.updateEnemies()
          this.updateProjectiles()
          break
        case GAME_STATE.GAME_OVER:
          break
        case GAME_STATE.PAUSED:
          break
        case GAME_STATE.TITLE:
          break
        default:
          break
      }

      this.keyboard.syncPrevious()
      this.draw()
    }

    startLoop() {
      if (this.isLoopRunning) return
      this.isLoopRunning = true
      this.update()
    }

    stopLoop() {
      if (this.animationID) {
        cancelAnimationFrame(this.animationID)
        this.animationID = 0
      }
      this.isLoopRunning = false
    }

    draw() {
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      switch (this.gameState) {
        case GAME_STATE.MENU:
          this.drawMenu()
          break
        case GAME_STATE.PLAYING:
          this.drawStars()
          this.drawProjectiles()
          this.drawEnemies()
          this.drawPlayer()
          this.drawHUD()
          break
        case GAME_STATE.GAME_OVER:
          this.drawGameOver()
          break
        case GAME_STATE.PAUSED:
          this.drawPauseScreen()
          break
        case GAME_STATE.TITLE:
          this.drawTitle()
          break
        default:
          break
      }
    }

    pauseGame() {
      if (this.gameState === GAME_STATE.PAUSED) {
        this.draw()
        return
      }

      this.lastState = this.gameState
      this.gameState = GAME_STATE.PAUSED
      this.stopLoop()
      if (this.lastState === GAME_STATE.PLAYING) {
        this.sound.stopBGAudio()
      }
      this.draw()
    }

    resumeGame() {
      if (this.gameState !== GAME_STATE.PAUSED) return

      this.gameState = this.lastState
      if (this.gameState === GAME_STATE.PLAYING) {
        this.sound.playBGAudio()
      }
      this.lastTime = performance.now()
      this.startLoop()
    }

    calculateDeltaTime() {
      const now = performance.now()
      const elapsedMS = now - this.lastTime
      this.lastTime = now
      this.lastTime = now
      return elapsedMS / 1000
    }

    reset() {
      this.player = this.createPlayer()
      this.lives = 3
      this.projectiles = []
      this.enemies = []
      this.points = 0
      this.enemySpawnTime = 0
      this.timeBetweenEnemySpawns = 10
    }
  }

  ns.Game = Game
  window.Game = Game
})(window.SpaceBlaster)
