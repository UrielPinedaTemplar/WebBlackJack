const CONFIG = {}
CONFIG.localport = 8080
CONFIG.port = process.env.PORT || CONFIG.localport
CONFIG.publicDir = 'www'

module.exports = CONFIG
