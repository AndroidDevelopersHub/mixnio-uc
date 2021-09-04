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
const dailyBonusUtil = require('../common/utils/dailyBonusUtil')


module.exports = function (router) {
   /* router.get('/daily_bonus', list);
    router.post('/daily_bonus', add);
    router.put('/daily_bonus/:id', update);
    router.get('/daily_bonus/:id', details);
    router.delete('/daily_bonus/:id', _delete);*/
    router.post('/daily_quiz', getQuestion);

}


const schema = Joi.object({
    uid: Joi.string().min(6).required(),
    title: Joi.string().email().required(),
    point: Joi.string().min(11).required(),
    //token: Joi.string().required()
});


async function getQuestion(req,res){
    let query = "SELECT * FROM `daily_bonus` WHERE uid ="+req.body.uid+" AND earn_from = 4 AND createdAt > (NOW() - INTERVAL 15 MINUTE)";
    db.query(query ,  (err, result1) =>{
        if (!err){
            if (result1.length < 1){
                //update
                db.query("UPDATE `daily_bonus` SET createdAt = now() WHERE uid ="+req.body.uid+" AND earn_from = "+4+" " , (err, result2) => {
                    if (!err){
                        db.query("SELECT * FROM `quiz_question_list` ORDER BY RAND() LIMIT 1" , (err, result2) => {
                            if (!err){


                                return _response.apiSuccess(res, responsemsg.found, result2)
                            }})
                    }else {
                        return _response.apiFailed(res, "Something went wrong!",err)
                    }
                })
            }else {
                return _response.apiFailed(res, "Please wait few minutes")
            }
        }else {
            return _response.apiFailed(res, err)
        }
    })

}


function add(req, res){
    //
    // const { error } = schema.validate(req.body);
    // if (error) return _response.apiFailed(res ,error.details[0].message)

    db.query("INSERT INTO daily_bonus SET ?", req.body , (err, result) => {
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


    db.query("SELECT COUNT(*) AS total FROM daily_bonus", (err, result) => {
        if (!err) {
            totalDocs = result[0].total
        } else {

        }
    });



    //Search by String
    if (req.query.search_string && req.query.search_string !== ''){

        db.query("SELECT * FROM daily_bonus WHERE CONCAT(title) REGEXP '"+req.query.search_string+"'  LIMIT "+limit+" OFFSET "+offset+" ", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.found , result,{page: parseInt(page) , limit: parseInt(limit),totalDocs: totalDocs })

            } else {
                return _response.apiFailed(res, responsemsg.listIsEmpty)
            }
        });


    }else {
        db.query("SELECT * FROM daily_bonus LIMIT "+limit+" OFFSET "+offset+" ", (err, result) => {
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
        db.query("SELECT * FROM `daily_bonus` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {

                db.query("UPDATE daily_bonus SET ? WHERE id = '"+req.params.id+"'" , req.body ,(err , result) =>{
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
        db.query("SELECT * FROM `daily_bonus` WHERE id='"+req.params.id+"'", (err, result) => {
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
        db.query("SELECT * FROM `daily_bonus` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!result.length){
                return _response.apiWarning(res, responsemsg.listIsEmpty)
            }else {
                db.query("DELETE FROM `daily_bonus` WHERE id='" + req.params.id + "'", (err, result) => {
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
