'use strict'

;(function registerGameEntity(ns) {
  Object.assign(ns.Game.prototype, {
    entityUpdate(entity) {
      entity.velocity.X += entity.acceleration.X
      entity.velocity.Y += entity.acceleration.Y

      entity.position.X += entity.velocity.X * this.dt
      entity.position.Y += entity.velocity.Y * this.dt

      entity.acceleration.X = 0
      entity.acceleration.Y = 0
    },

    entityDraw(entity) {
      console.log({ entity })
      this.ctx.drawImage(
        entity.sprite,
        entity.position.X,
        entity.position.Y,
        entity.width,
        entity.height
      )
    },

    entityApplyForce(entity, force) {
      entity.acceleration.X += force.X
      entity.acceleration.Y += force.Y
    },

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
    },

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
    },

    entityApplyDrag(entity) {
      const force = {
        X: -0.1 * entity.velocity.X,
        Y: -0.1 * entity.velocity.Y,
      }
      this.entityApplyForce(entity, force)
    },

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
    },

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
    },
  })
})(window.SpaceBlaster)
