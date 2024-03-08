const express = require('express')

const { serverList } = require('./routes/servers')

serverList.forEach(server => {
  const app = express()
  app.get('/hello', (_, res) => {
    res.send('response from port ' + server.port)
  })
  app.get('/health-check', (_, res) => {
    res.status = 200
    res.send('OK')
  })
  app.listen(server.port, () => {
    console.log('server starts at port: ' + server.port)
  })
})

