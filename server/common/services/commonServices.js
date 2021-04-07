const bcrypt = require('bcrypt');
const saltRounds = 10;

function salt(pass){
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(pass, salt, function(err, hash) {
            // Store hash in your password DB.
            return hash
        });
    });
}


module.exports = { salt }


