var router = require('express').Router();
const today = new Date().toISOString();


router.get('/', (req,res)=>{
    res.send(' '+ today);
})

require('./users')(router)
require('./transaction')(router)
require('./redeem')(router)
require('./package')(router)
require('./game_pass')(router)

module.exports = router;


