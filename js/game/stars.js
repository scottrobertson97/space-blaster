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
    },

    updateStars() {
      for (let i = 0; i < this.stars.length; i++) {
        this.stars[i].Y += this.stars[i].speed
        if (this.stars[i].Y > this.canvas.height) {
          this.stars[i].Y = 0 - this.stars[i].size
          this.stars[i].X = Math.random() * this.canvas.width
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
    },
  })
})(window.SpaceBlaster)
