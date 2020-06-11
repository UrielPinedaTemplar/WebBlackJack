/*
URIEL PINEDA SERRANO
A01379633
*/



class Game {

  constructor (table) {
    this.name = 'Game'
    this.type = 'game'
    this.table = table
    this.players = table.players
    this.status = Game.WAITING
    this.currentPlayer = -1
    this.turn = -1
  }

  canStart () {
    return true
  }

  start (shuffle = false) {
    if (!this.canStart()) {
      return false
    }
    if (shuffle) {
      this.table.shufflePlayers()
    }
    this.putPlayersAtFront()
    this.status = Game.ONGOING
    this.table.logMovePlayers('Game start.')
    this.table.messagePlayers('The game is starting!')
    this.newTurn()
    this.sendState()
    return true
  }

  putPlayersAtFront () {
    for (let i = 0; i < this.getNumPlayers(); i++) {
      if (this.players[i].isObserver) {
        for (let j = i + 1; j <= this.players.length; j++) {
          if (!this.players[j].isObserver) {
            const x = this.players[i]
            this.players[i] = this.players[j]
            this.players[j] = x
            break
          }
        }
      }
    }
  }

  update (player, move) {
    if (!this.moveIsValid(player, move)) {
      return
    }
    this.logMove(player, move)
    this.executeMove(player, move)
    if (this.checkEnd()) {
      this.finish()
    } else {
      this.tryStartNewTurn(player)
    }
    this.sendState()
  }

  tryStartNewTurn (player) {
    if (this.playerRoundComplete(player)) { this.newTurn() }
  }

  newTurn () {
    this.turn++
    this.updateCurrentPlayer()
    this.players[this.currentPlayer].message('It is your turn!')
  }

  moveIsValid (player, move) {
    if (player.isObserver) {
      player.message('You are not playing!')
      return false
    }

    if (this.status === Game.FINISHED) {
      player.message('Game finished. Click on start to go again.')
      return false
    }
    if (this.status === Game.WAITING) {
      player.message('Waiting for players. Click on start if you are ready.')
      return false
    }
    if (!this.isPlayerTurn(player)) {
      player.message('It is not your turn.')
      return false
    }
    return true
  }

  isPlayerTurn (player) {
    return (this.players.indexOf(player) === this.currentPlayer)
  }

  updateCurrentPlayer () {
    this.currentPlayer = this.turn % this.getPlayers().length
  }

  playerRoundComplete (player) {
    return true
  }

  sendState () {
    for (let i = this.players.length - 1; i >= 0; i--) {
      this.players[i].updateGameState(this.getGameState())
    }
  }

  getGameState () {
    return null
  }

  finish () {
    this.table.logMovePlayers('End of the game')
    this.status = Game.FINISHED
    this.currentPlayer = -1
    this.sendResults()
  }

  sendResults () {
  }

  // Just the non-observers
  getPlayers () {
    return this.players.filter(pl => !pl.isObserver)
  }

  getNumPlayers () {
    return this.getPlayers().length
  }

  checkEnd () {
    return false
  }

  getWinners () {
    return []
  }

  logMove (player, move) {}

  executeMove (player, move) {}
}

Game.WAITING = 2
Game.ONGOING = 0
Game.FINISHED = 1

module.exports = Game
