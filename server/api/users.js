const express = require("express");
const db = require("./db");
const router = express.Router();
let jwt = require("jsonwebtoken");
const config = require("../../middleware/config.json"); // refresh
let tokenChecker = require("../../middleware/tockenchecker");
const tokenList = {};
const _response = require('../common/middleware/api-response')
const responsemsg = require('../common/middleware/response-msg')
const responsecode = require('../common/middleware/response-code')
const response = require('../common/middleware/api-response')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt');
const commonServe = require('../common/services/commonServices')


module.exports = function (router) {
    router.get('/users', list);
    router.post('/users', add);
    router.put('/users/:id', update);
    router.get('/users/:id', details);
    router.delete('/users/:id', _delete);
    router.post('/users-add', signup)
}


const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(11).required(),
    salt: Joi.string().required(),
    token: Joi.string().required()
});


function add(req, res){
    //
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var salt =  bcrypt.hashSync(req.body.salt.toString(),  bcrypt.genSaltSync(10));


    const { error } = schema.validate(req.body);
    if (error) return res.send(error.details[0].message);

    db.query("SELECT * FROM `users` WHERE email = '"+email+"' OR phone = '"+phone+"'", (err, result) =>{
        if (!result.length){
            console.log('User not exist')
            db.query("INSERT INTO users (name,email,phone,salt) VALUES ('"+name+"','"+email+"','"+phone+"','"+salt+"')", (err, result) => {
                if (!err) {
                    return _response.apiSuccess(res, responsemsg.userSaveSuccess , result)
                } else {
                    return _response.apiFailed(res, err , result)
                }
            });

        }else {
            return _response.apiWarning(res, responsemsg.userAlreadyExist)
        }
    })



}


function list(req ,res ){

        db.query("SELECT * FROM users", (err, result) => {
        if (!err) {
            return _response.apiSuccess(res, result.length+" "+responsemsg.userFound , result)

        } else {
            return _response.apiFailed(res, responsemsg.userListIsEmpty)
        }
    });

}


function update(req ,res ){
    var formData = []

    if (req.params.id){
        db.query("SELECT * FROM `users` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {

                formData = result[0]
                if (req.query.phone){
                    formData.phone = req.query.phone
                }
                if (req.query.name){
                    formData.name = req.query.name
                }
                if (req.query.email){
                    formData.email = req.query.email                }
                if (req.query.salt){
                    formData.salt = req.query.salt
                }
                if (req.query.wallet){
                    formData.wallet = req.query.wallet
                }
                db.query("UPDATE users SET name ='"+formData.name+"',email ='"+formData.email+"',phone ='"+formData.phone+"',salt ='"+formData.salt+"',wallet ='"+formData.wallet+"' WHERE id = '"+req.params.id+"'" , (err , result) =>{
                    if (!err){
                        return _response.apiSuccess(res, responsemsg.userUpdateSuccess)
                    }else{
                        return _response.apiFailed(res, err)
                    }
                })

            } else {
                return res.send('')
            }
        });

    }else {
        return  _response.apiWarning(res, 'Please select id.')

    }
}

function details(req ,res ){
    //const result = bcrypt.compareSync('123', hash);
    if (req.params.id){
        db.query("SELECT * FROM `users` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.userFound ,result)
            } else {
                return _response.apiWarning(res , responsemsg.userListIsEmpty)
            }
        });
    }else {
        return _response.apiWarning(res , 'Please select id')
    }
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
