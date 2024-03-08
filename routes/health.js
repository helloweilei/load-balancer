const { Router } = require('express')
const { serverList, getServersStatus } = require('./servers')

const router = Router()

router.get('', (req, res, next) => {
  getServersStatus().then(result => {
    res.json(result)
    next()
  })

})

module.exports = router