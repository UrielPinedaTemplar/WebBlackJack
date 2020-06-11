/*
URIEL PINEDA SERRANO
A01379633
*/





const Game = require('./game')
const Player = require('./player')
const util = require('./util')
const cardUtil = require('./card-util')

class Blackjack extends Game {
 
  constructor (table) {
    super(table)
    this.type = 'blackjack'
    this.name = 'Blackjack'
    this.deck = []
    this.dealer = new Player('dealer', null)
    this.hands = {}
  }

  start (shuffle) {
    this.deck = cardUtil.createDeck()
    util.shuffle(this.deck)
    this.createPlayerStates()
    this.createPlayerHands()
    this.lastCard = null
    return super.start(shuffle)
  }

  createPlayerStates () {
    this.playerStates = this.getPlayers().reduce((states, player) => {
      if (!player.isObserver) states[player.id] = Blackjack.PLAYING
      return states
    }, {})
  }

  createPlayerHands () {
    this.hands = this.getPlayers().reduce((hand, player) => {
      hand[player.id] = [this.deck.pop(), this.deck.pop()]
      return hand
    }, {})
    for (const player of this.getPlayers()) {
      this.updatePlayerState(player)
    }
    this.hands[this.dealer.id] = [this.deck.pop(), this.deck.pop()]
  }

  moveIsValid (player, move) {
    if (!super.moveIsValid(player, move)) {
      return false
    }
    if ((move === Blackjack.HIT) && (this.playerStates[player.id] !== Blackjack.PLAYING)) {
      player.message('You are not playing anymore.')
      return false
    }
    return true
  }

  executeMove (player, move) {
    switch (move) {
      case Blackjack.HIT: {
        this.buyCard(player)
        this.updatePlayerState(player)
        break
      }
      case Blackjack.STAND: {
        this.playerStates[player.id] = Blackjack.STOPPED
        this.table.logMovePlayers(`${player.name} stopped.`)
        break
      }
    }
    this.state = this.getGameState()
  }

  updatePlayerState (player) {
    const handTotal = this.handSum(player)
    if (handTotal > 21) {
      this.playerStates[player.id] = Blackjack.BUSTED
      this.table.logMovePlayers(`${player.name} got busted!`)
    }
    if (handTotal === 21) {
      this.playerStates[player.id] = Blackjack.VICTORIOUS
      this.table.logMovePlayers(`${player.name} scored 21!`)
    }
    if (handTotal < 21) {
      player.message('You may keep playing!')
    }
  }

  buyCard (player) {
    this.hands[player.id].push(this.deck.pop())
  }

  cardPoint (card) {
    const v = cardUtil.decodeCard(card).value
    if (v === 1) { return 11 } else if (v < 11) { return v } else if (v <= 13) { return 10 }
  }

  handSum (player) {
    let total = this.hands[player.id].reduce((sum, card) => sum + this.cardPoint(card), 0)
    let usableAces = this.numberOfAces(this.hands[player.id])
    while ((total > 21) && (usableAces > 0)) {
      total -= 10
      usableAces -= 1
    }
    return total
  }

  numberOfAces (hand) {
    let total = 0
    for (const card of hand) {
      if (cardUtil.decodeCard(card).value === 1) { total += 1 }
    }
    return total
  }

  playerRoundComplete (player) {
    return this.playerStates[player.id] !== Blackjack.PLAYING
  }

  checkEnd () {
    return this.noPlayerPlaying()
  }

  getGameState () {
    return {
      numPlayers: this.getNumPlayers(),
      playerNames: this.getPlayerNames(),
      playerStates: this.playerStates,
      currentPlayer: this.currentPlayer,
      hands: this.status === Game.WAITING ? [] : this.getListOfHands(),
      lastCard: this.lastCard,
      gameStatus: this.status
    }
  }

  getPlayerNames () {
    const res = this.getPlayers().map((player) => player.name)
    res.push('Dealer')
    return res
  }

  getListOfHands () {
    const listOfHands = []
    for (const player of this.getPlayers()) { listOfHands.push(this.getPlayerCards(player)) }

    const dealerCards = this.getPlayerCards(this.dealer)
    if (this.status !== Game.FINISHED) {
      dealerCards.pop()
      dealerCards.push(-1) // only show 1 card of dealer
    }
    listOfHands.push(dealerCards)
    return listOfHands
  }

  getPlayerCards (player) {
    const hand = this.hands[player.id]
    if (hand === undefined) { return [] }
    return hand.reduce((cards, cardNumber) => {
      const card = cardUtil.decodeCard(cardNumber)
      cards.push(card)
      return cards
    }, [])
  }

  noPlayerPlaying () {
    for (const player of this.getPlayers()) {
      if (this.playerStates[player.id] === Blackjack.PLAYING) { return false }
    }
    return true
  }

  getWinners () {
    const result = []
    for (const player of this.getPlayers()) {
      if (this.handSum(player) === 21) { result.push(this.players.indexOf(player)) }
    }
    return result
  }

  sendResults () {
    this.state = this.getGameState()
    this.sendState()
    const dealersScore = this.computeDealerScore()
    for (const player of this.getPlayers()) {
      const playerScore = this.handSum(player)
      if (playerScore > 21) {
        player.message('You lost because you got busted.')
      }
      if (playerScore === 21) {
        player.message('You won with 21 points.')
      }
      if (playerScore === 21) {
        if (dealersScore > 21) {
          player.message('You won, dealer got busted.')
        } else {
          if (playerScore > dealersScore) {
            player.message('You won with a score larger than the dealer.')
          } else {
            player.message('You lost, you didn\'t get more points than the dealer.')
          }

        }

      }
      if(playerScore <21 && dealersScore > 21){
        player.message('You won, house got busted.')
      }
    }
  }

  computeDealerScore () {
    while (this.handSum(this.dealer) < 17) {
      this.buyCard(this.dealer)
      this.state = this.getGameState()
      this.sendState()
    }
    return this.handSum(this.dealer)
  }

  logMove (player, move) {
    if (move === Blackjack.HIT) {
      this.table.logMovePlayers(`Player ${player.name} hit`)
    }
    if (move === Blackjack.STAND) {
      this.table.logMovePlayers(`Player ${player.name} stand`)
    }
  }
}



Blackjack.PLAYING = 0
Blackjack.BUSTED = 1
Blackjack.STOPPED = 2
Blackjack.VICTORIOUS= 3
Blackjack.HIT = 0
Blackjack.STAND = 1

module.exports = Blackjack
