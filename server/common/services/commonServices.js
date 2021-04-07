const bcrypt = require('bcrypt');
const saltRounds = 10;

function salt(pass){
    var response = "test"
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(pass, salt, function(err, hash) {
            // Store hash in your password DB.
            response = hash
            return hash
        });
    });
    return response
}


module.exports.salt = salt


