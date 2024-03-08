const {default: axios} = require("axios")
const { response } = require("express")


const serverList = [
  {
    host: 'localhost',
    port: '3000',
    weight: 1,
    id: '10001'
  },
  {
    host: 'localhost',
    port: '3001',
    weight: 2,
    id: '10002'
  },
  {
    host: 'localhost',
    port: '3002',
    weight: 3,
    id: '10003'
  }
]

let healthyServers = [...serverList]

module.exports.serverList = serverList
module.exports.healthyServers = healthyServers

setInterval(() => {
  getServersStatus().then(result => {
    healthyServers.length = 0
    result.forEach(result => {
      if (result.status === 'PASS') {
        healthyServers.push(result.server)
      }
    })
  })

}, 10000)

const getServersStatus = async () => {
  const result = []
  for (let i = 0; i < serverList.length; i++) {
    const server = serverList[i]

    try {
      const response = await axios.get(`http://${server.host}:${server.port}/health-check`)
      if (response.status === 200) {
        result.push({
          server,
          status: 'PASS'
        })
      } else {
        result.push({
          server,
          status: 'FAIL'
        })
      }
    } catch(err) {
      console.log(err)
      result.push({
        server,
        status: 'FAIL'
      })
    }
  }
  return result
}

module.exports.getServersStatus = getServersStatus