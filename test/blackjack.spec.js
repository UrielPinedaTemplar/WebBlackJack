const path = require('path')
const assert = require('assert')

const Blackjack = require(path.join(__dirname, '../src/blackjack'))
const mock = require(path.join(__dirname, '../test/mock'))
const Player = mock.Player
const Table = mock.Table

function createPlayerHands () {
  this.hands = this.getPlayers().reduce((hand, player) => {
    hand[player.id] = [3, 3]
    return hand
  }, {})
  for (const player of this.getPlayers()) { this.updatePlayerState(player) }
  this.hands[this.dealer.id] = [2, 2]
}

describe('Blackjack', () => {
  let table = null
  let game = null
  let player1 = null
  let player2 = null
  let observer = null

  beforeEach(() => {
    table = new Table('blackjack', 42)
    game = table.game
    game.createPlayerHands = createPlayerHands
    player1 = new Player('player1')
    player2 = new Player('player2')
    observer = new Player('observer')
    observer.isObserver = true
  })

  afterEach(() => {
    table = null
    game = null
    player1 = null
    player2 = null
    observer = null
  })

  describe('status', () => {
    it('should be ONGOING after game starts', () => {
      table.addPlayer(player1)
      table.addPlayer(player2)
      game.start()
      assert.strictEqual(game.status, Blackjack.ONGOING)
    })

    it('should be WAITING before game starts', () => {
      table.addPlayer(player1)
      assert.strictEqual(game.status, Blackjack.WAITING)
    })
  })

  describe('getNumPlayers()', () => {
    it('should return 0 if there are no players', () => {
      assert.strictEqual(game.getNumPlayers(), 0)
    })
    it('should return 1 if there is one player', () => {
      table.addPlayer(player1)
      assert.strictEqual(game.getNumPlayers(), 1)
    })
    it('should return 0 if there are only observers', () => {
      table.addPlayer(observer)
      assert.strictEqual(game.getNumPlayers(), 0)
    })
  })

  describe('moveIsValid()', () => {
    it('only player 1 can move', () => {
      table.addPlayer(player1)
      table.addPlayer(player2)
      table.addPlayer(observer)
      game.start()
      assert.strictEqual(game.moveIsValid(player1, Blackjack.STAND), true)
      assert.strictEqual(game.moveIsValid(player1, Blackjack.HIT), true)
      assert.strictEqual(game.moveIsValid(player2, Blackjack.STAND), false)
      assert.strictEqual(game.moveIsValid(player2, Blackjack.HIT), false)
      assert.strictEqual(game.moveIsValid(observer, Blackjack.STAND), false)
      assert.strictEqual(game.moveIsValid(observer, Blackjack.HIT), false)
    })

    it('only player 1 can move independent of the order the observer entered the game', () => {
      table.addPlayer(player1)
      table.addPlayer(observer)
      table.addPlayer(player2)
      game.start()
      assert.strictEqual(game.moveIsValid(player1, Blackjack.STAND), true)
      assert.strictEqual(game.moveIsValid(player1, Blackjack.HIT), true)
      assert.strictEqual(game.moveIsValid(player2, Blackjack.STAND), false)
      assert.strictEqual(game.moveIsValid(player2, Blackjack.HIT), false)
      assert.strictEqual(game.moveIsValid(observer, Blackjack.STAND), false)
      assert.strictEqual(game.moveIsValid(observer, Blackjack.HIT), false)
    })

    it('should return false if game did not start', () => {
      assert.strictEqual(game.moveIsValid(player1, null), false)
    })

    it('should return false for any moves from the observer', () => {
      table.addPlayer(player1); table.addPlayer(player2); table.addPlayer(observer)
      assert.strictEqual(game.moveIsValid(observer, { x: 0, y: 0 }), false)
    })
  })

  describe('handSum', () => {
    it('should start with more than 1 and at most 21', () => {
      table.addPlayer(player1)
      table.addPlayer(player2)
      game.start()
      assert.strictEqual(game.handSum(player1) < 22, true)
      assert.strictEqual(game.handSum(player1) > 1, true)
      assert.strictEqual(game.handSum(player2) < 22, true)
      assert.strictEqual(game.handSum(player2) > 1, true)
    })
    it('cards from 2 to 10 have a regular value', () => {
      table.addPlayer(player1)
      game.start()
      game.hands[player1.id] = [3, 4]
      assert.strictEqual(game.handSum(player1), 7)
    })
    it('cards from 11 to 13 are worth 10', () => {
      table.addPlayer(player1)
      game.start()
      game.hands[player1.id] = [1, 11]
      assert.strictEqual(game.handSum(player1), 21)
      game.hands[player1.id] = [1, 12]
      assert.strictEqual(game.handSum(player1), 21)
      game.hands[player1.id] = [1, 13]
      assert.strictEqual(game.handSum(player1), 21)
    })
    it('aces might be worth 1 if total is above 21', () => {
      table.addPlayer(player1)
      game.start()
      game.hands[player1.id] = [1, 1]
      assert.strictEqual(game.handSum(player1), 12)
      game.hands[player1.id] = [1, 1, 10]
      assert.strictEqual(game.handSum(player1), 12)
      game.hands[player1.id] = [1, 1, 1, 10]
      assert.strictEqual(game.handSum(player1), 13)
      game.hands[player1.id] = [1, 1, 1, 1, 10]
      assert.strictEqual(game.handSum(player1), 14)
      game.hands[player1.id] = [1, 1, 1, 1, 10, 10]
      assert.strictEqual(game.handSum(player1), 24)
    })
  })

  describe('getWinner', () => {
    it('should return -1 if no player has 21', () => {
      table.addPlayer(player1)
      game.start()
      game.hands[player1.id] = [3, 4]
      assert.deepStrictEqual(game.getWinners(), [])
    })
    it('should return 0 if first player has 21', () => {
      table.addPlayer(player1)
      game.start()
      game.hands[player1.id] = [1, 11]
      assert.deepStrictEqual(game.getWinners(), [0])
    })
    it('should return 1 if first player has 21', () => {
      table.addPlayer(player1)
      table.addPlayer(player2)
      game.start()
      game.hands[player1.id] = [1, 1]
      game.hands[player2.id] = [1, 11]
      assert.deepStrictEqual(game.getWinners(), [1])
    })
    it('should not let observer change winner', () => {
      table.addPlayer(player1)
      table.addPlayer(observer)
      table.addPlayer(player2)
      game.start()
      game.hands[player2.id] = [1, 11]
      assert.deepStrictEqual(game.getWinners(), [1])
    })
    it('it might return more than one winner', () => {
      table.addPlayer(player1)
      table.addPlayer(observer)
      table.addPlayer(player2)
      game.start()
      game.hands[player1.id] = [1, 11]
      game.hands[player2.id] = [1, 11]
      assert.deepStrictEqual(game.getWinners(), [0, 1])
    })
  })

  describe('checkEnd', () => {
    it('should return false if no player has 21', () => {
      table.addPlayer(player1)
      game.start()
      game.hands[player1.id] = [3, 4]
      assert.strictEqual(game.checkEnd(), false)
    })
    it('should return true if a player has 21', () => {
      table.addPlayer(player1)
      game.start()
      game.hands[player1.id] = [1, 11]
      game.updatePlayerState(player1)
      assert.strictEqual(game.checkEnd(), true)
    })
    it('should return true if all players are busted', () => {
      table.addPlayer(player1)
      table.addPlayer(player2)
      game.start()
      game.playerStates[player1.id] = Blackjack.BUSTED
      game.playerStates[player2.id] = Blackjack.BUSTED
      assert.strictEqual(game.checkEnd(), true)
    })
    it('should return true if all players stopped', () => {
      table.addPlayer(player1)
      table.addPlayer(player2)
      game.start()
      game.playerStates[player1.id] = Blackjack.STOPPED
      game.playerStates[player2.id] = Blackjack.STOPPED
      assert.strictEqual(game.checkEnd(), true)
    })
  })

  describe('greedyPlayer', () => {
    it('should end in 11 plays or less', () => {
      table.addPlayer(player1)
      game.start()
      let numberOfPlays = 0
      for (let i = 0; i <= 11; i++) {
        game.update(player1, 0)
        numberOfPlays += 1
        if (game.checkEnd()) { break }
      }
      assert.strictEqual(numberOfPlays > 11, false, 'it should not have more than 11 plays')
    })
  })

  describe('turn', () => {
    beforeEach(() => {
      table.addPlayer(player1)
      table.addPlayer(player2)
      game.start()
    })

    afterEach(() => {
      game.players = []
      game.finish()
    })

    it('should increase after stand', () => {
      assert.strictEqual(game.turn, 0)
      game.update(player1, Blackjack.STAND)
      assert.strictEqual(game.turn, 1)
    })
    it('should not increase after buy without busting', () => {
      assert.strictEqual(game.turn, 0)
      game.hands[player1.id] = [2, 2]
      game.update(player1, Blackjack.HIT)
      assert.strictEqual(game.turn, 0)
    })
    it('should increase after hit with a hand of 20, since it either bust or win', () => {
      assert.strictEqual(game.turn, 0)
      game.hands[player1.id] = [10, 9, 1]
      game.update(player1, Blackjack.HIT)
      assert.strictEqual(game.turn, 1)
    })
    it('should not increase after invalid move', () => {
      assert.strictEqual(game.turn, 0)
      game.update(player2, Blackjack.STAND)
      assert.strictEqual(game.turn, 0)
    })
  })
})
