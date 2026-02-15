'use strict'

;(function registerGameEnemies(ns) {
  const { ENEMY_TYPE, ENEMY_BEHAVIOR, WAVE_TYPE, PROJECTILE_TARGET } =
    ns.constants

  Object.assign(ns.Game.prototype, {
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
    },

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
    },

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
    },

    drawEnemies() {
      for (let i = 0; i < this.enemies.length; i++) {
        this.entityDraw(this.enemies[i])
      }
    },

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
    },

    enemyHit(enemy) {
      enemy.hp--
      this.points += 10
    },
  })
})(window.SpaceBlaster)
