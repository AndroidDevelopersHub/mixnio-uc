const express = require("express");
const db = require("./db");
const router = express.Router();
let jwt = require("jsonwebtoken");
const config = require("../../middleware/config.json"); // refresh
let tokenChecker = require("../../middleware/tockenchecker");
const tokenList = {};
const responsemsg = require('../common/middleware/response-msg')
const responsecode = require('../common/middleware/response-code')
const response = require('../common/middleware/api-response')


module.exports = function (router) {
    router.get('/users', list);
    router.post('/users', add);
    router.put('/users/:id', update);
    router.get('/users/:id', details);
    router.delete('/users/:id', _delete);
    router.post('/users-add', signup)
}



function add(req, res){
    return res.send('test');
}



function list(req ,res ){

        db.query("SELECT * FROM user_info", (err, rows, fields) => {
        if (!err) {
          console.log(rows)
        } else {
            res.send({
                result: false,
                msg: "Sorry something went wrong",
                error: err,
            });
        }
    });
    return res.status(200).json({
        status: responsecode.statusOk,
        message: responsemsg.userListIsEmpty,
        items: []
    });

}


function update(req ,res ){
    return  res.json('single user update');
}

function details(req ,res ){
    return  res.json('single user details');
}

function _delete(req ,res){
    return  res.json('single user delete');
}



function signup(req ,res ){
    const postData = req.body;
    const user = {
        email: postData.email,
        name: postData.name,
        token: postData.token,
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

    return res.status(200).json(response);
}


//Get New Access Token When Previous AccessToken is not validate any more
router.post('/get_accessToken', (req,res) => {
    // refresh the damn token
    const postData = req.body

    // if refresh token exists
    if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            "email": postData.email,
            "name": postData.name,
            "token": postData.token,
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



//Get All Users
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
