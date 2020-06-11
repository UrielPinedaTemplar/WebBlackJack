
/*
URIEL PINEDA SERRANO
A01379633
*/
class Player {
 
  constructor (name, socket, observer) {
    this.isObserver = observer
    this.name = name
    this.socket = socket
    this.id = Math.floor(Math.random() * 1000000)
  }

  message (message) {
    this.socket.emit('message', message)
  }

  logMove (message) {
    this.socket.emit('move', message)
  }

  updateGameState (state) {
    this.socket.emit('state', state)
  }

  setTable (table) {
    this.table = table
    this.message(`Hello ${this.name}, welcome.`)
  }

  leaveTable () {
    this.table.removePlayer(this)
  }

  turnIntoObserver () {
    this.message('You are now an observer.')
    this.isObserver = true
  }
}

module.exports = Player
