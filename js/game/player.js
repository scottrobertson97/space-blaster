'use strict'

;(function registerGamePlayer(ns) {
  const { KEYBOARD } = ns
  const { PROJECTILE_TARGET, GAME_STATE } = ns.constants

  Object.assign(ns.Game.prototype, {
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
      player.isMoving = false
      player.thrusterPulse = 0
      return player
    },

    updatePlayer() {
      this.entityUpdate(this.player)
      this.entityKeepInFrame(this.player)
    },

    drawPlayer() {
      if (this.player.isMoving) {
        this.drawPlayerThruster()
      }
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
    },

    drawPlayerThruster() {
      const centerX = this.player.position.X + this.player.width / 2
      const baseY = this.player.position.Y + this.player.height - 4
      const pulse = (Math.sin(this.player.thrusterPulse) + 1) * 0.5
      const outerLength = 14 + pulse * 10
      const innerLength = 8 + pulse * 5

      this.ctx.save()

      this.ctx.fillStyle = 'rgba(255, 130, 40, 0.65)'
      this.ctx.beginPath()
      this.ctx.moveTo(centerX - 8, baseY)
      this.ctx.lineTo(centerX + 8, baseY)
      this.ctx.lineTo(centerX, baseY + outerLength)
      this.ctx.closePath()
      this.ctx.fill()

      this.ctx.fillStyle = 'rgba(255, 235, 150, 0.9)'
      this.ctx.beginPath()
      this.ctx.moveTo(centerX - 4, baseY)
      this.ctx.lineTo(centerX + 4, baseY)
      this.ctx.lineTo(centerX, baseY + innerLength)
      this.ctx.closePath()
      this.ctx.fill()

      this.ctx.restore()
    },

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

      const velocitySq =
        this.player.velocity.X * this.player.velocity.X +
        this.player.velocity.Y * this.player.velocity.Y
      this.player.isMoving = moving || velocitySq > 20
      if (this.player.isMoving) {
        this.player.thrusterPulse += this.dt * 24
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
    },

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
    },

    playerHit() {
      this.player.hp--
      if (this.player.hp < 0) this.die()
    },

    die() {
      this.player.hp = 3
      this.lives--
      if (this.lives < 0) {
        this.gameState = GAME_STATE.GAME_OVER
        const replayButton = document.getElementById('replaybutton')
        if (replayButton) replayButton.style.display = 'block'
        this.sound.stopBGAudio()
      }
    },
  })
})(window.SpaceBlaster)
