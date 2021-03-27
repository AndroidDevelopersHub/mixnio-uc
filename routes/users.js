const express = require("express");
//const db = require("../database/db");
const router = express.Router();


let jwt = require("jsonwebtoken");
const config = require("../middleware/config.json"); // refresh
let tokenChecker = require("../middleware/tockenchecker");


// Store all refresh token against user details
const tokenList = {};


router.get('/users', function(req ,res){
    res.send('this is from user Route');
});




//First Step To generate AccessToken & RefreshToken
router.post('/signup', (req,res) => {
    const postData = req.body;
    const user = {
        email: postData.email,
        name: postData.name,
    };

    // do the database authentication here, with user name and password combination.
    const accessToken = jwt.sign(user, config.secret, {
        expiresIn: config.tokenLife,
    });
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, {
        expiresIn: config.refreshTokenLife,
    });
    const response = {
        status: "Logged in",
        accessToken: accessToken,
        refreshToken: refreshToken,
    };
    tokenList[refreshToken] = response;
    res.status(200).json(response);
});


//Get New Access Token When Previous AccessToken is not validate any more
router.post('/get_accessToken', (req,res) => {
    // refresh the damn token
    const postData = req.body

    // if refresh token exists
    if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            "email": postData.email,
            "name": postData.name
        }
        const accessToken = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
        const response = {
            "accessToken": accessToken,
        }
        // update the token in the list
        tokenList[postData.refreshToken].accessToken = accessToken
        res.status(200).json(response);

    } else {
        res.status(404).send('refresh token is not valid anymore')
    }
});



// Get All Users
// router.get("/users", (req, res) => {
//     db.query("SELECT * FROM user_info", (err, rows, fields) => {
//         if (!err) {
//             res.send({
//                 result: true,
//                 msg: "User Details Found",
//                 data: rows,
//             });
//         } else {
//             res.send({
//                 result: false,
//                 msg: "Sorry something went wrong",
//                 error: err,
//             });
//         }
//     });
// });



module.exports = router;
