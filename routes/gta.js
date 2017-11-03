var express = require('express');
var router = express.Router();

/* POST from GTA application. */
router.post('/', function(req, res) {
    console.log('GOT POST');
    console.log(req.body);
});

module.exports = router;
