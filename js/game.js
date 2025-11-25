'use strict'

import { Keyboard, KEYBOARD } from './keys.js'
import { Sound } from './sound.js'

export const GAME_STATE = Object.freeze({
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  TITLE: 'TITLE',
})

export const PROJECTILE_TARGET = Object.freeze({
  PLAYER: 0,
  ENEMY: 1,
})

export const WAVE_TYPE = Object.freeze({
  LINE: 0,
  WEDGE: 1,
})

export const ENEMY_TYPE = Object.freeze({
  BASIC: 0,
  HEAVY: 1,
})

export const ENEMY_BEHAVIOR = Object.freeze({
  LINE: 0,
  ZIGZAG: 1,
})

const MIN_TIME_BETWEEN_SPAWNS = 2

export class Game {
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

    this.keyboard = new Keyboard()
    this.sound = new Sound()

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

  bindUI() {
    const enterButton = document.getElementById('enterbutton')
    const playButton = document.getElementById('playbutton')
    const replayButton = document.getElementById('replaybutton')

    if (enterButton) {
      enterButton.onclick = () => {
        this.gameState = GAME_STATE.MENU
        enterButton.style.display = 'none'
        if (playButton) playButton.style.display = 'block'
      }
    }

    if (playButton) {
      playButton.onclick = () => {
        this.gameState = GAME_STATE.PLAYING
        this.reset()
        this.sound.playBGAudio()
        playButton.style.display = 'none'
      }
    }

    if (replayButton) {
      replayButton.onclick = () => {
        this.gameState = GAME_STATE.PLAYING
        this.reset()
        replayButton.style.display = 'none'
      }
    }
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

    this.update()
  }

  update() {
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
        cancelAnimationFrame(this.animationID)
        break
      case GAME_STATE.TITLE:
        break
      default:
        break
    }

    this.keyboard.syncPrevious()
    this.draw()
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

  drawHUD() {
    switch (this.lives) {
      case 3:
        this.ctx.drawImage(
          this.playerLifeImage,
          this.canvas.width - 33 * 3,
          0,
          33,
          26
        )
      case 2:
        this.ctx.drawImage(
          this.playerLifeImage,
          this.canvas.width - 33 * 2,
          0,
          33,
          26
        )
      case 1:
        this.ctx.drawImage(
          this.playerLifeImage,
          this.canvas.width - 33 * 1,
          0,
          33,
          26
        )
        break
      default:
        break
    }

    this.ctx.save()
    this.ctx.font = '16pt Audiowide'
    this.ctx.fillStyle = 'white'
    this.ctx.fillText(`Score: ${this.points}`, 10, 20)
    this.ctx.restore()
  }

  drawGameOver() {
    this.ctx.save()
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillStyle = 'white'
    this.ctx.font = '16pt Audiowide'
    this.ctx.fillText(
      'Game Over',
      this.canvas.width / 2,
      this.canvas.height / 2 - 20
    )
    this.ctx.fillText(
      `You scored ${this.points} points`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 20
    )
    this.ctx.restore()
  }

  drawTitle() {
    this.ctx.save()
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillStyle = 'white'
    this.ctx.font = '30pt Audiowide'
    this.ctx.fillText(
      'Welcome to Space Blaster!',
      this.canvas.width / 2,
      this.canvas.height / 2
    )
    this.ctx.restore()
  }

  drawMenu() {
    this.ctx.save()
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillStyle = 'white'
    this.ctx.font = '16pt Audiowide'
    this.ctx.fillText(
      'Controls:',
      this.canvas.width / 2,
      this.canvas.height / 2 - 40
    )
    this.ctx.fillText(
      'WASD or Arrow Keys to move',
      this.canvas.width / 2,
      this.canvas.height / 2
    )
    this.ctx.fillText(
      'SPACE to shoot',
      this.canvas.width / 2,
      this.canvas.height / 2 + 40
    )
    this.ctx.restore()
  }

  drawPauseScreen() {
    this.ctx.save()
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.font = '40pt Audiowide'
    this.ctx.fillStyle = 'white'
    this.ctx.fillText('... PAUSED ...', this.WIDTH / 2, this.HEIGHT / 2)
    this.ctx.restore()
  }

  pauseGame() {
    cancelAnimationFrame(this.animationID)
    this.sound.stopBGAudio()
    this.lastState = this.gameState
    this.gameState = GAME_STATE.PAUSED
    this.update()
  }

  resumeGame() {
    cancelAnimationFrame(this.animationID)
    if (this.lastState === GAME_STATE.PLAYING) {
      this.sound.playBGAudio()
    }
    this.gameState = this.lastState
    this.update()
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

  entityUpdate(entity) {
    entity.velocity.X += entity.acceleration.X
    entity.velocity.Y += entity.acceleration.Y

    entity.position.X += entity.velocity.X * this.dt
    entity.position.Y += entity.velocity.Y * this.dt

    entity.acceleration.X = 0
    entity.acceleration.Y = 0
  }

  entityDraw(entity) {
    console.log({ entity })
    this.ctx.drawImage(
      entity.sprite,
      entity.position.X,
      entity.position.Y,
      entity.width,
      entity.height
    )
  }

  entityApplyForce(entity, force) {
    entity.acceleration.X += force.X
    entity.acceleration.Y += force.Y
  }

  entityIsOutOfFrame(entity) {
    if (
      entity.position.X < 0 + this.canvas.width &&
      entity.position.X + entity.width > 0 &&
      entity.position.Y < 0 + this.canvas.height &&
      entity.position.Y + entity.height > 0
    ) {
      return false
    }
    return true
  }

  entityKeepInFrame(entity) {
    if (entity.position.X < 0) {
      entity.position.X = 0
      entity.velocity.X = 0
    } else if (entity.position.X + entity.width > this.canvas.width) {
      entity.position.X = this.canvas.width - entity.width
      entity.velocity.X = 0
    }
    if (entity.position.Y < 0) {
      entity.position.Y = 0
      entity.velocity.Y = 0
    } else if (entity.position.Y + entity.height > this.canvas.height) {
      entity.position.Y = this.canvas.height - entity.height
      entity.velocity.Y = 0
    }
  }

  entityApplyDrag(entity) {
    const force = {
      X: -0.1 * entity.velocity.X,
      Y: -0.1 * entity.velocity.Y,
    }
    this.entityApplyForce(entity, force)
  }

  createPlayer() {
    const player = this.createEntity(
      this.canvas.width / 2,
      this.canvas.height / 2,
      65,
      50,
      'playerShip1_red',
      3
    )
    player.timeBetweenShots = 0.2
    player.timeUntilNextShot = 0
    player.autoFire = true
    player.dmgSprites = [
      this.images['playerShip1_damage3'],
      this.images['playerShip1_damage2'],
      this.images['playerShip1_damage1'],
    ]
    return player
  }

  updatePlayer() {
    this.entityUpdate(this.player)
    this.entityKeepInFrame(this.player)
  }

  drawPlayer() {
    this.entityDraw(this.player)
    if (this.player.hp < 3) {
      this.ctx.drawImage(
        this.player.dmgSprites[this.player.hp],
        this.player.position.X,
        this.player.position.Y,
        this.player.width,
        this.player.height
      )
    }
  }

  playerControls() {
    let moving = false

    if (
      this.keyboard.keydown[KEYBOARD.KEY_RIGHT] ||
      this.keyboard.keydown[KEYBOARD.KEY_D]
    ) {
      this.entityApplyForce(this.player, { X: 20, Y: 0 })
      moving = true
    }
    if (
      this.keyboard.keydown[KEYBOARD.KEY_LEFT] ||
      this.keyboard.keydown[KEYBOARD.KEY_A]
    ) {
      this.entityApplyForce(this.player, { X: -20, Y: 0 })
      moving = true
    }
    if (
      this.keyboard.keydown[KEYBOARD.KEY_UP] ||
      this.keyboard.keydown[KEYBOARD.KEY_W]
    ) {
      this.entityApplyForce(this.player, { X: 0, Y: -20 })
      moving = true
    }
    if (
      this.keyboard.keydown[KEYBOARD.KEY_DOWN] ||
      this.keyboard.keydown[KEYBOARD.KEY_S]
    ) {
      this.entityApplyForce(this.player, { X: 0, Y: 20 })
      moving = true
    }
    if (!moving) {
      this.entityApplyDrag(this.player)
    }

    this.player.timeUntilNextShot -= this.dt

    if (
      this.keyboard.keydown[KEYBOARD.KEY_SPACE] &&
      (!this.keyboard.previousKeydown[KEYBOARD.KEY_SPACE] ||
        this.player.autoFire) &&
      this.player.timeUntilNextShot <= 0
    ) {
      this.playerShoot()
      this.player.timeUntilNextShot = this.player.timeBetweenShots
    }
  }

  createEntity(x, y, width, height, sprite, hp = 0) {
    const entity = {}
    entity.position = { X: x, Y: y }
    entity.velocity = { X: 0, Y: 0 }
    entity.acceleration = { X: 0, Y: 0 }
    entity.width = width
    entity.height = height
    entity.sprite = this.images[sprite]
    entity.hp = hp
    return entity
  }

  isColliding(entity1, entity2) {
    if (
      entity1.position.X < entity2.position.X + entity2.width &&
      entity1.position.X + entity1.width > entity2.position.X &&
      entity1.position.Y < entity2.position.Y + entity2.height &&
      entity1.position.Y + entity1.height > entity2.position.Y
    ) {
      return true
    }
    return false
  }

  playerShoot() {
    const projectile = this.createEntity(
      this.player.position.X + this.player.width / 2 - 5,
      this.player.position.Y,
      10,
      50,
      'laserBlue01'
    )
    projectile.target = PROJECTILE_TARGET.ENEMY
    this.entityApplyForce(projectile, { X: 0, Y: -500 })
    this.projectiles.push(projectile)
    this.sound.playEffect(3)
  }

  playerHit() {
    this.player.hp--
    if (this.player.hp < 0) this.die()
  }

  die() {
    this.player.hp = 3
    this.lives--
    if (this.lives < 0) {
      this.gameState = GAME_STATE.GAME_OVER
      const replayButton = document.getElementById('replaybutton')
      if (replayButton) replayButton.style.display = 'block'
      this.sound.stopBGAudio()
    }
  }

  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.entityUpdate(this.projectiles[i], this.dt)

      let hitSomething = false

      if (
        this.projectiles[i].target === PROJECTILE_TARGET.PLAYER &&
        this.isColliding(this.projectiles[i], this.player)
      ) {
        this.playerHit()
        hitSomething = true
      }

      if (
        this.projectiles[i].target === PROJECTILE_TARGET.ENEMY &&
        this.checkIfEnemyIsHit(this.projectiles[i])
      ) {
        hitSomething = true
      }

      if (hitSomething || this.entityIsOutOfFrame(this.projectiles[i])) {
        this.projectiles.splice(i, 1)
      }
    }
  }

  checkIfEnemyIsHit(projectile) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.isColliding(this.enemies[i], projectile)) {
        this.enemyHit(this.enemies[i])
        if (this.enemies[i].hp <= 0) this.enemies.splice(i, 1)
        return true
      }
    }
    return false
  }

  drawProjectiles() {
    for (let i = 0; i < this.projectiles.length; i++) {
      this.entityDraw(this.projectiles[i])
    }
  }

  createEnemy(x, y, type, behavior) {
    let enemy
    switch (type) {
      case ENEMY_TYPE.BASIC:
        enemy = this.createEntity(x, y, 65, 50, 'enemyBlack1', 1)
        enemy.timeBetweenShots = 1.5
        enemy.timeUntilNextShot = 0
        break
      case ENEMY_TYPE.HEAVY:
        enemy = this.createEntity(x, y, 65, 50, 'enemyBlack4', 2)
        enemy.timeBetweenShots = 3.0
        enemy.timeUntilNextShot = 0
        break
      default:
        break
    }

    switch (behavior) {
      case ENEMY_BEHAVIOR.LINE:
        this.entityApplyForce(enemy, { X: 0, Y: 100 })
        break
      case ENEMY_BEHAVIOR.ZIGZAG:
        this.entityApplyForce(enemy, { X: -100, Y: 100 })
        enemy.behaviorTimeInterval = 1
        enemy.goingLeft = true
        break
      default:
        break
    }

    enemy.type = type
    enemy.behavior = behavior
    this.enemies.push(enemy)
    return enemy
  }

  spawnWave(type) {
    switch (type) {
      case WAVE_TYPE.LINE: {
        const xPos = Math.random() * (this.canvas.width - 65 * 3)
        this.createEnemy(
          xPos + 65 * 0,
          0 - 50,
          ENEMY_TYPE.BASIC,
          ENEMY_BEHAVIOR.ZIGZAG
        )
        this.createEnemy(
          xPos + 65 * 1,
          0 - 50,
          ENEMY_TYPE.BASIC,
          ENEMY_BEHAVIOR.ZIGZAG
        )
        this.createEnemy(
          xPos + 65 * 2,
          0 - 50,
          ENEMY_TYPE.BASIC,
          ENEMY_BEHAVIOR.ZIGZAG
        )
        break
      }
      case WAVE_TYPE.WEDGE: {
        const xPos = Math.random() * (this.canvas.width - 65 * 3)
        this.createEnemy(
          xPos + 65 * 0,
          0 - 100,
          ENEMY_TYPE.BASIC,
          ENEMY_BEHAVIOR.LINE
        )
        this.createEnemy(
          xPos + 65 * 1,
          0 - 50,
          ENEMY_TYPE.HEAVY,
          ENEMY_BEHAVIOR.LINE
        )
        this.createEnemy(
          xPos + 65 * 2,
          0 - 100,
          ENEMY_TYPE.BASIC,
          ENEMY_BEHAVIOR.LINE
        )
        break
      }
      default:
        break
    }
  }

  updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      switch (this.enemies[i].behavior) {
        case ENEMY_BEHAVIOR.LINE:
          break
        case ENEMY_BEHAVIOR.ZIGZAG:
          this.enemies[i].behaviorTimeInterval -= this.dt
          if (this.enemies[i].behaviorTimeInterval <= 0) {
            this.enemies[i].behaviorTimeInterval = 1
            if (this.enemies[i].goingLeft) {
              this.entityApplyForce(this.enemies[i], { X: 200, Y: 0 })
              this.enemies[i].goingLeft = false
            } else {
              this.entityApplyForce(this.enemies[i], { X: -200, Y: 0 })
              this.enemies[i].goingLeft = true
            }
          }
          break
        default:
          break
      }

      this.entityUpdate(this.enemies[i])
      this.enemies[i].timeUntilNextShot -= this.dt
      if (this.enemies[i].timeUntilNextShot <= 0) {
        this.enemies[i].timeUntilNextShot = this.enemies[i].timeBetweenShots
        this.enemyShoot(this.enemies[i])
      }

      if (this.enemies[i].position.Y > this.canvas.height)
        this.enemies.splice(i, 1)
    }
  }

  drawEnemies() {
    for (let i = 0; i < this.enemies.length; i++) {
      this.entityDraw(this.enemies[i])
    }
  }

  enemyShoot(enemy) {
    const projectile = this.createEntity(
      enemy.position.X + enemy.width / 2 - 5,
      enemy.position.Y,
      10,
      50,
      'laserRed01'
    )
    projectile.target = PROJECTILE_TARGET.PLAYER
    this.entityApplyForce(projectile, { X: 0, Y: 500 })
    this.projectiles.push(projectile)

    if (enemy.type === ENEMY_TYPE.BASIC) this.sound.playEffect(0)
    else if (enemy.type === ENEMY_TYPE.HEAVY) this.sound.playEffect(3)
  }

  enemyHit(enemy) {
    enemy.hp--
    this.points += 10
  }

  createStars() {
    this.stars = []
    for (let i = 0; i < 50; i++) {
      const type = Math.floor(Math.random() * 3) + 1
      const size = type
      const speed = type * 1.5
      const x = Math.random() * this.canvas.width
      const y = Math.random() * this.canvas.height

      this.stars.push({
        X: x,
        Y: y,
        size: size,
        speed: speed,
      })
    }
  }

  updateStars() {
    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i].Y += this.stars[i].speed
      if (this.stars[i].Y > this.canvas.height) {
        this.stars[i].Y = 0 - this.stars[i].size
        this.stars[i].X = Math.random() * this.canvas.width
      }
    }
  }

  drawStars() {
    this.ctx.save()
    this.ctx.fillStyle = 'white'
    for (let i = 0; i < this.stars.length; i++) {
      this.ctx.fillRect(
        this.stars[i].X,
        this.stars[i].Y,
        this.stars[i].size,
        this.stars[i].size
      )
    }
    this.ctx.restore()
  }
}
