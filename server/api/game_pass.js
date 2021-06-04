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
    router.get('/game_pass', list);
    router.post('/game_pass', add);
    router.put('/game_pass/:id', update);
    router.get('/game_pass/:id', details);
    router.delete('/game_pass/:id', _delete);

    router.post('/game_pass_entry', join);
    router.get('/game_pass_entry', joinList);

}


const schema = Joi.object({
    username: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().min(11).required(),
    salt: Joi.string().required(),
    //token: Joi.string().required()
});


function join(req, res){
    //
    // const { error } = schema.validate(req.body);
    // if (error) return _response.apiFailed(res ,error.details[0].message)

    console.log('User not exist')
    db.query("INSERT INTO game_pass_entry SET ?", req.body , (err, result) => {
        if (!err) {
            return _response.apiSuccess(res, responsemsg.saveSuccess , result)
        } else {
            return _response.apiFailed(res, err , result)
        }
    });
}



async function joinList(req ,res ){

    var limit = 500;
    var page = 1;
    var totalDocs = 0;
    if (req.query.page){
        page = req.query.page
    }
    if (req.query.limit){
        limit = req.query.limit
    }
    var offset = (page - 1) * limit


    db.query("SELECT COUNT(*) AS total FROM game_pass_entry", (err, result) => {
        if (!err) {
            totalDocs = result[0].total
        } else {

        }
    });



    //Search by String
    if (req.query.search_string && req.query.search_string !== ''){

        db.query("SELECT * FROM game_pass_entry WHERE CONCAT(uid,game_pass_id,winner) REGEXP '"+req.query.search_string+"'  LIMIT "+limit+" OFFSET "+offset+" ", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.found , result,{page: parseInt(page) , limit: parseInt(limit),totalDocs: totalDocs })

            } else {
                return _response.apiFailed(res, responsemsg.listIsEmpty)
            }
        });


    } else if (req.query.game_pass_id && req.query.game_pass_id !== '') {
        db.query("SELECT * FROM `game_pass_entry` WHERE game_pass_id = '"+req.query.game_pass_id+"' LIMIT "+limit+" OFFSET "+offset+" ", (err, result) => {
            if (!err) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.found , result , {page: parseInt(page) , limit: parseInt(limit),totalDocs: totalDocs })

            } else {
                return _response.apiFailed(res, responsemsg.listIsEmpty )
            }
        });
    }else {
        db.query("SELECT * FROM `game_pass_entry` LIMIT "+limit+" OFFSET "+offset+" ", (err, result) => {
            if (!err) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.found , result , {page: parseInt(page) , limit: parseInt(limit),totalDocs: totalDocs })

            } else {
                return _response.apiFailed(res, responsemsg.listIsEmpty )
            }
        });
    }


}



function add(req, res){
    //

   // const { error } = schema.validate(req.body);
   // if (error) return _response.apiFailed(res ,error.details[0].message)

    console.log('User not exist')
    db.query("INSERT INTO game_pass SET ?", req.body , (err, result) => {
        if (!err) {
            return _response.apiSuccess(res, responsemsg.saveSuccess , result)
        } else {
            return _response.apiFailed(res, err , result)
        }
    });


}

async function list(req ,res ){

    var limit = 500;
    var page = 1;
    var totalDocs = 0;
    if (req.query.page){
        page = req.query.page
    }
    if (req.query.limit){
        limit = req.query.limit
    }
    var offset = (page - 1) * limit


    db.query("SELECT COUNT(*) AS total FROM game_pass", (err, result) => {
        if (!err) {
            totalDocs = result[0].total
        } else {

        }
    });



    //Search by String
    if (req.query.search_string && req.query.search_string !== ''){

        db.query("SELECT * FROM game_pass WHERE CONCAT(title) REGEXP '"+req.query.search_string+"'  LIMIT "+limit+" OFFSET "+offset+" ", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.found , result,{page: parseInt(page) , limit: parseInt(limit),totalDocs: totalDocs })

            } else {
                return _response.apiFailed(res, responsemsg.listIsEmpty)
            }
        });


    }else {
        db.query("SELECT * FROM game_pass LIMIT "+limit+" OFFSET "+offset+" ", (err, result) => {
            if (!err) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.found , result , {page: parseInt(page) , limit: parseInt(limit),totalDocs: totalDocs })

            } else {
                return _response.apiFailed(res, responsemsg.listIsEmpty )
            }
        });
    }


}

function update(req ,res ){
    var formData = []

    if (req.params.id){
        db.query("SELECT * FROM `game_pass` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {

                db.query("UPDATE game_pass SET ? WHERE id = '"+req.params.id+"'" , req.body ,(err , result) =>{
                    if (!err){
                        return _response.apiSuccess(res, responsemsg.updateSuccess)
                    }else{
                        return _response.apiFailed(res, err)
                    }
                })

            } else {
                return _response.apiFailed(res, err)
            }
        });

    }else {
        return  _response.apiWarning(res, 'Please select id.')

    }
}

function details(req ,res ){
    //const result = bcrypt.compareSync('123', hash);
    if (req.params.id){
        db.query("SELECT * FROM `game_pass` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.found ,result)
            } else {
                return _response.apiWarning(res , responsemsg.listIsEmpty)
            }
        });
    }else {
        return _response.apiWarning(res , 'Please select id')
    }
}

function _delete(req ,res){

    if (req.params.id){
        db.query("SELECT * FROM `game_pass` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!result.length){
                return _response.apiWarning(res, responsemsg.listIsEmpty)
            }else {
                db.query("DELETE FROM `game_pass` WHERE id='" + req.params.id + "'", (err, result) => {
                    if (!err) {
                        return _response.apiSuccess(res, responsemsg.deleteSuccess)
                    } else {
                        return _response.apiFailed(res, err)
                    }
                });
            }

        });
    }else {
        return _response.apiWarning(res , 'Please select id')
    }
}
