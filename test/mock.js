const path = require('path')
const Player = require(path.join(__dirname, '../src/player'))
const Table = require(path.join(__dirname, '../src/table'))

class MockPlayer extends Player {
  constructor (name) {
    super(name, null)
  }

  message (message) {
    // console.log(message)
  }

  logMove (message) {
    // console.log(message)
  }

  updateGameState (state) {
    // console.log('updateGameState ', state)
  }
}

class MockTable extends Table {
  messagePlayers (message) {
    // console.log(message)
  }

  logMovePlayers (message) {
    // console.log(message)
  }
}

module.exports.Player = MockPlayer
module.exports.Table = MockTable
