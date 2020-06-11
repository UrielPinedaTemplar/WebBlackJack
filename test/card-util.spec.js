const cardUtil = require('../src/card-util')
const assert = require('assert')

describe('card-util', () => {
  it('should encode cards correctly', (done) => {
    const aceSpades = { suit: 0, value: 1 }
    const fiveHearts = { suit: 1, value: 5 }
    const kingDiamond = { suit: 2, value: 13 }
    const sevenClubs = { suit: 3, value: 7 }

    assert.strictEqual(cardUtil.encodeCard(aceSpades), 13 * 0 + 1)
    assert.strictEqual(cardUtil.encodeCard(fiveHearts), 13 * 1 + 5)
    assert.strictEqual(cardUtil.encodeCard(kingDiamond), 13 * 2 + 13)
    assert.strictEqual(cardUtil.encodeCard(sevenClubs), 13 * 3 + 7)
    done()
  })

  it('should decode cards correctly', (done) => {
    const threeSpades = 3
    const blackJack = 11
    const tenHearts = 13 + 10
    const aceDiamonds = 13 * 2 + 1
    const queenClubs = 13 * 3 + 12

    const decoded3Spades = cardUtil.decodeCard(threeSpades)
    const decoded11Spades = cardUtil.decodeCard(blackJack)
    const decoded10Hearts = cardUtil.decodeCard(tenHearts)
    const decoded1Diamonds = cardUtil.decodeCard(aceDiamonds)
    const decoded12Clubs = cardUtil.decodeCard(queenClubs)

    assert.strictEqual(decoded3Spades.suit, 0)
    assert.strictEqual(decoded3Spades.value, 3)
    assert.strictEqual(decoded11Spades.suit, 0)
    assert.strictEqual(decoded11Spades.value, 11)
    assert.strictEqual(decoded10Hearts.suit, 1)
    assert.strictEqual(decoded10Hearts.value, 10)
    assert.strictEqual(decoded1Diamonds.suit, 2)
    assert.strictEqual(decoded1Diamonds.value, 1)
    assert.strictEqual(decoded12Clubs.suit, 3)
    assert.strictEqual(decoded12Clubs.value, 12)

    done()
  })
})
