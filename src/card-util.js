/*
URIEL PINEDA SERRANO
A01379633
*/



function createDeck () {
  const cards = []
  for (let i = 1; i <= 52; i++) cards.push(i)
  return cards
}

// Cards will be just numbers from 1 to 52 (better for sockets). This
// takes a number and returns a more friendly card object.
function decodeCard (cardNumber) {
  const suit = Math.floor((cardNumber - 1) / 13.0)
  const value = cardNumber - (suit * 13)
  return { suit: suit, value: value }
}

// Takes a card and obtains its numeric code.
function encodeCard (card) {
  return card.suit * 13 + card.value
}

module.exports.encodeCard = encodeCard
module.exports.decodeCard = decodeCard
module.exports.createDeck = createDeck
