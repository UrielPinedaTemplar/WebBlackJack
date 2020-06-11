/*
URIEL PINEDA SERRANO
A01379633
*/

const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const controller = require('./controller')
const { Liquid } = require('liquidjs')

// Server setup
const app = express()
app.disable('x-powered-by')

const server = http.createServer(app)
const sioServer = socketIo(server)
let config

const sioServerGame = sioServer.of('/game')
const sioServerIndex = sioServer.of('/index')

function start (configurations) {
  config = configurations
  server.listen(config.port, () =>
    console.log(`Express server listening on port ${config.port}...`))
  setupTemplateEngine()
  setupRoutes()
  setupSockets()

  return server
}

function setupTemplateEngine () {
  const liquidEngine = new Liquid()
  app.engine('liquid', liquidEngine.express())
  app.set('views', path.join(__dirname, '..', './views'))
  app.set('view engine', 'liquid')
}

function setupRoutes () {
  app.use(express.static(config.publicDir))

  app.get('/', (req, res) => {
    res.render('index')
  })

  app.get('/js/config.js', (req, res) => {
    res.set('Content-Type', 'application/javascript')
    res.send(`const PORT = ${config.port};`)
  })

  app.get('/:gameType/:tableId', (req, res) => {
    const gameType = req.params.gameType
    const tableId = req.params.tableId

    if (controller.isValidGame(gameType)) {
      res.redirect(`/${gameType}?tableId=${tableId}`)
    } else {
      res.status(404).send('Error 404: Not found.')
    }
  })

  app.get('/:gameType', (req, res, next) => {
    const gameType = req.params.gameType
    if (controller.isValidGame(gameType)) { res.render(gameType) } else { next() }
  })

  app.get('*', (req, res) => {
    console.log('Requested URL: ', req.url)
    res.status(404).send('Error 404: Not found.')
  })
}

function setupSockets () {
  sioServerGame.on('connection', (socket) =>
    handleGameConnection(socket))

  sioServerIndex.on('connection', (socket) => {
    console.log('someone joined the main page')
    socket.emit('updateTables', controller.getTables())
  })
}

function handleGameConnection (socket) {
  let player = null
  console.log(`Client ${socket.id} connected.`)

  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} has disconnected.`)
    if (player !== null) {
      controller.handleDisconnect(player)
      player.table.updatePlayers()
      updateTables()
    }
  })
  function setupGameListeners () {
    socket.on('click', (pos) => {
      controller.handleClick(player, pos)
      player.table.updatePlayers()
    }
    )
    socket.on('clear', () => {
      controller.handleClear(player)
      updateTables()
      player.table.updatePlayers()
    })
    socket.on('start', () => {
      controller.handleStart(player)
      updateTables()
      player.table.updatePlayers()
    })
  }
  socket.on('enterTable', (data) => {
    console.log('data', data)
    if (data.playerName.length < 3) {
      socket.emit('enterTableResponse', 'Please choose a player name with at least 3 characters')
    } else if (data.tableId.length < 5) {
      socket.emit('enterTableResponse', 'Please choose a table name with at least 5 characters')
    } else {
      const roomName = `${data.gameType}_${data.tableId}`
      socket.join(roomName)
      const tableSocket = sioServerGame.to(roomName)
      player = controller.createPlayer(socket, data.gameType, data.tableId, data.playerName, data.observer, tableSocket)
      console.log(`Player ${data.playerName} joined ${data.tableId} for a ${data.gameType} game.`)
      updateTables()
      player.table.updatePlayers()
      socket.emit('enterTableResponse', 'success')
      setupGameListeners()
    }
  })
}

function updateTables () {
  sioServerIndex.emit('updateTables', controller.getTables())
}

module.exports.start = start
