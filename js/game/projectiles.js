'use strict'

;(function registerGameProjectiles(ns) {
  const { PROJECTILE_TARGET } = ns.constants

  Object.assign(ns.Game.prototype, {
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
    },

    checkIfEnemyIsHit(projectile) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        if (this.isColliding(this.enemies[i], projectile)) {
          this.enemyHit(this.enemies[i])
          if (this.enemies[i].hp <= 0) this.enemies.splice(i, 1)
          return true
        }
      }
      return false
    },

    drawProjectiles() {
      for (let i = 0; i < this.projectiles.length; i++) {
        this.entityDraw(this.projectiles[i])
      }
    },
  })
})(window.SpaceBlaster)
