const http = require('http')
const path = require('path')
const socketIoClient = require('socket.io-client')
const assert = require('assert')
const CONFIG = require(path.join(__dirname, '../config'))
const server = require(path.join(__dirname, '../src/server'))

const port = CONFIG.port

function connectSocket (path) {
  const socketPath = 'http://localhost:' + CONFIG.port + path
  return socketIoClient.connect(socketPath)
}

describe('server', () => {
  let httpServer

  before((done) => {
    http.get(options, res => {
      console.log('    is already running and...')
      done()
    }).on('error', () => {
      console.log('is not running, we will start it for the tests and it...')

      httpServer = server.start(CONFIG)
      setTimeout((err, result) => {
        if (err) {
          done(err)
        } else {
          done()
        }
      }, 200)
    })
  })

  const options = {
    host: 'localhost', port: port, path: '/', method: 'GET'
  }

  it('should listen at ' + port, (done) => {
    http.get(options, (res) => {
      assert.strictEqual(res.statusCode, 200)
      done()
    })
  })

  it('should accept socket connections', (done) => {
    const socket = connectSocket('/index')
    socket.on('connect', () => {
      socket.disconnect()
      done()
    })
  })

  it('should send an updateTables event to sockets on index', (done) => {
    const socket = connectSocket('/index')
    socket.on('updateTables', () => {
      socket.disconnect()
      done()
    })
  })


  after(() => {
    if (httpServer) httpServer.close()
  })
})
