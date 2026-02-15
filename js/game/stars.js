'use strict'

;(function registerGameStars(ns) {
  Object.assign(ns.Game.prototype, {
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

      this.foregroundParticles = []
      for (let i = 0; i < 18; i++) {
        const size = Math.random() * 1.5 + 1.5
        const speed = Math.random() * 3 + 4.5
        const x = Math.random() * this.canvas.width
        const y = Math.random() * this.canvas.height
        const alpha = Math.random() * 0.45 + 0.3

        this.foregroundParticles.push({
          X: x,
          Y: y,
          size: size,
          speed: speed,
          alpha: alpha,
        })
      }
    },

    updateStars() {
      for (let i = 0; i < this.stars.length; i++) {
        this.stars[i].Y += this.stars[i].speed
        if (this.stars[i].Y > this.canvas.height) {
          this.stars[i].Y = 0 - this.stars[i].size
          this.stars[i].X = Math.random() * this.canvas.width
        }
      }

      const difficultyFactor = Math.max(
        0,
        Math.min(1, (10 - this.timeBetweenEnemySpawns) / 8)
      )
      const speedScale = 1 + difficultyFactor * 0.45

      for (let i = 0; i < this.foregroundParticles.length; i++) {
        this.foregroundParticles[i].Y +=
          this.foregroundParticles[i].speed * speedScale
        if (this.foregroundParticles[i].Y > this.canvas.height) {
          this.foregroundParticles[i].Y = 0 - this.foregroundParticles[i].size
          this.foregroundParticles[i].X = Math.random() * this.canvas.width
        }
      }
    },

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

      this.ctx.save()
      for (let i = 0; i < this.foregroundParticles.length; i++) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.foregroundParticles[i].alpha})`
        this.ctx.fillRect(
          this.foregroundParticles[i].X,
          this.foregroundParticles[i].Y,
          this.foregroundParticles[i].size,
          this.foregroundParticles[i].size * 2.5
        )
      }
      this.ctx.restore()
    },
  })
})(window.SpaceBlaster)
