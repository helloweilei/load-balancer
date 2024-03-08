const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const { healthyServers } = require('./servers')

const router = express.Router()

// 轮训均衡
let currentIndex = 0
const getNextServer = () => {
  const server = healthyServers[currentIndex]
  currentIndex = (currentIndex + 1) % healthyServers.length
  return server ?? getNextServer()
}

//  基于权重的轮训
const getNextServer2 = () => {
  const totalWeights = healthyServers.reduce((total, server, index) => {
    return [...total, server.weight + (index > 0 ? total[index - 1] : 0)]
  }, [])
  const random = Math.floor(Math.random() * totalWeights[totalWeights.length - 1]) + 1
  for (let i = 0; i < totalWeights.length; i++) {
    if (random <= totalWeights[i]) {
      return healthyServers[i]
    }
  }
}

const COOKIE_NAME = 'lb-affinity'

router.all('*', (req, res) => {
  let server
  // session affinity: 会话绑定
  if (!req.cookies[COOKIE_NAME]) {
    server = getNextServer2()
    res.cookie(COOKIE_NAME, server.id, { httpOnly: true })
  } else {
    server = healthyServers.find(server => server.id === req.cookies[COOKIE_NAME])
  }

  createProxyMiddleware({
    target: `http://${server.host}:${server.port}`,
    changeOrigin: true,
    onProxyReq(proxyReq) {
      proxyReq.setHeader('X-Proxy-Server', 'load balancer')
    },
    onProxyRes(proxyRes) {
      // console.log(proxyRes)
    },
    logLevel: 'debug',
    pathRewrite: {
      'app/': ''
    }
  })(req, res)
})

module.exports = router
