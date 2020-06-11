const HOST = window.location.hostname
const connectTo = (HOST === 'localhost') ? `${HOST}:${PORT}` : HOST
const socket = io(connectTo + '/index')

const Liquid = window.liquidjs.Liquid
const engine = new Liquid()

const ulTables = document.getElementById('tables')
const tableTemplate = document.getElementById('open-table-template').innerHTML

// Event Handling (sockets)
socket.on('updateTables', (tables) => {
  updateTables(tables)
})

function updateTables (tables) {
  let result = ''
  if (tables.length > 0) {
    result += '<h1> Open Tables </h1>\n'
    result += '<div class="row" >\n'
    for (const table of tables) {
      result += makeTableDiv(table)
    }
    result += '</div>\n'
  }
  ulTables.innerHTML = result
}

function makeTableDiv (table) {
  return engine.parseAndRenderSync(tableTemplate, table)
}
