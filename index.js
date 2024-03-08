const express = require('express')
const { readFileSync } = require('node:fs')
const https = require('node:https')
const proxyRouter = require('./routes/proxy')
const healthRouter = require('./routes/health')
const cookieParser = require('cookie-parser')

const app = express()
app.use(cookieParser())
app.use('/app', proxyRouter)
app.use('/health', healthRouter)
https.createServer({
  key: readFileSync('./ssl/key.pem'),
  cert: readFileSync('./ssl/cert.pem')
}, app).listen(443, () => {
  console.log('Load balancer is running at port 443...')
})