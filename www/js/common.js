const $ = window.$
// Socket setup
const HOST = window.location.hostname
const connectTo = (HOST === 'localhost') ? `${HOST}:${PORT}` : HOST
const socket = io(connectTo + '/game')

// entering table
const enterTableForm = document.getElementById('enter-table-form')
const enterTableId = document.getElementById('enter-table-id')
const enterPlayerName = document.getElementById('enter-player-name')
const enterObserver = document.getElementById('enter-table-observer')
const enterGameType = document.getElementById('enter-game-type')
const enterTableErrorMessage = document.getElementById('enter-table-error-message')
$('#staticBackdrop').modal({ keyboard: false })

const tableId = (new URL(window.location.href)).searchParams.get('tableId')
if (tableId) enterTableId.value = tableId

const observer = (new URL(window.location.href)).searchParams.get('observer')
if (observer) enterObserver.checked = true

enterTableForm.addEventListener('submit', (event) => {
  socket.emit('enterTable', {
    playerName: enterPlayerName.value,
    tableId: enterTableId.value,
    observer: enterObserver.checked,
    gameType: enterGameType.innerText
  })
  event.preventDefault()
})

socket.on('enterTableResponse', (response) => {
  if (response === 'success') {
    $('#staticBackdrop').modal('hide')
  } else {
    enterTableErrorMessage.innerText = response
  }
})

// Screen elements
const divMsg = document.getElementById('messages')
const divNotification = document.getElementById('notificationText')
const ulPlayers = document.getElementById('players')
const btnClear = document.getElementById('clear')
const btnStart = document.getElementById('start')

// Event Handling (sockets)
const WAITING = 2
const ONGOING = 0
const FINISHED = 1

socket.on('state', (state) => {
  console.log(`State ${JSON.stringify(state)} received`)
  if ((state.gameStatus === WAITING) || (state.gameStatus === FINISHED)) {
    btnClear.hidden = true
    btnStart.hidden = false
  } else if (state.gameStatus === ONGOING) {
    btnClear.hidden = false
    btnStart.hidden = true
  }
  updateGameState(state)
})

socket.on('connect', () => {
  clearMessages()
  logMessage('Socket connected!')
})

socket.on('message', (msg) => {
  logMessage(msg)
})

socket.on('move', (msg) => {
  logMove(msg)
})

socket.on('updatePlayers', (players) => {
  let result = ''
  console.log(players)
  if (players.length > 0) {
    result += '<p>Players:</p><ul>'
    for (const player of players) {
      result += `<li>${player.name} (${player.role})`
      if (player.currentPlayer) { result += ' <span class="badge badge-pill badge-primary">Playing</span>' }
      result += '</li>'
    }
    result += '</ul>'
  }
  ulPlayers.innerHTML = result
})

function updateGameState (state) {
  // update the game state on the screen
  // should be overwritten on the specific game
  console.log(state)
}

function logMessage (msg) {
  divNotification.innerHTML = msg
  $('#notification').toast('show')
}

function logMove (msg) {
  const date = new Date()
  const time = date.toLocaleTimeString()
  divMsg.innerHTML = time + ': ' + msg + '</br>' + divMsg.innerHTML
}

function clearMessages () {
  divMsg.innerHTML = ''
}

btnStart.onclick = (event) => {
  socket.emit('start')
}

btnClear.onclick = (event) => {
  socket.emit('clear')
}
