'use strict'

;(function registerGameUi(ns) {
  const { GAME_STATE } = ns.constants

  Object.assign(ns.Game.prototype, {
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
    },

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
    },

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
    },

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
    },

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
    },

    drawPauseScreen() {
      this.ctx.save()
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.font = '40pt Audiowide'
      this.ctx.fillStyle = 'white'
      this.ctx.fillText('... PAUSED ...', this.WIDTH / 2, this.HEIGHT / 2)
      this.ctx.restore()
    },
  })
})(window.SpaceBlaster)
