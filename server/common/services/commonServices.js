const bcrypt = require('bcrypt');
const saltRounds = 10;

async function salt(pass){
    var response = "test"
   var result = await bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(pass, salt, function(err, hash) {
            // Store hash in your password DB.
            response = hash
        });
    });
    return result
}


module.exports.salt = salt


