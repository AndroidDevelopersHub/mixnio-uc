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
    router.get('/transaction', list);
    router.post('/transaction', add);
    router.put('/transaction/:id', update);
    router.get('/transaction/:id', details);
    router.delete('/transaction/:id', _delete);
}


const schema = Joi.object({
    type: Joi.string().required(),
    amount: Joi.string().required(),
    uid: Joi.string().required(),
});


function add(req, res){
    //
    var type = req.body.type;
    var amount = req.body.amount;
    var uid = req.body.uid;

    const { error } = schema.validate(req.body);
    if (error) return _response.apiFailed(res ,error.details[0].message)

    db.query("INSERT INTO transaction (uid,type,amount) VALUES ('"+uid+"','"+type+"','"+amount+"')", (err, result) => {
        if (!err) {
            return _response.apiSuccess(res, responsemsg.transactionSaveSuccess , result)
        } else {
            return _response.apiFailed(res, err , result)
        }
    });

}

function list(req ,res ){


    var limit = 20;
    var page = 1;
    if (req.query.page){
        page = req.query.page
    }
    if (req.query.limit){
        limit = req.query.limit
    }
    var offset = (page - 1) * limit

    //Search by String
    if (req.query.search_string){
        const schema = Joi.object({
            search_string: Joi.string().required()
        });
        const { error } = schema.validate(req.query);
        if (error) return _response.apiFailed(res ,error.details[0].message)

        db.query("SELECT * FROM transaction WHERE type && amount REGEXP '"+req.query.search_string+"'  LIMIT "+limit+" OFFSET "+offset+"", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.redeemFound , result)

            } else {
                return _response.apiFailed(res, responsemsg.redeemListIsEmpty)
            }
        });


    }else {
        db.query("SELECT * FROM transaction  LIMIT "+limit+" OFFSET "+offset+" ", (err, result) => {
            if (!err) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.transactionFound , result)

            } else {
                return _response.apiFailed(res, responsemsg.transactionListIsEmpty)
            }
        });
    }



}

function update(req ,res ){
    var formData = []

    if (req.params.id){
        db.query("SELECT * FROM `transaction` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {

                formData = result[0]
                if (req.query.type){
                    formData.type = req.query.type
                }
                if (req.query.amount){
                    formData.amount = req.query.amount
                }
                db.query("UPDATE transaction SET type ='"+formData.type+"',status ='"+formData.status+"',  amount ='"+formData.amount+"' WHERE id = '"+req.params.id+"'" , (err , result) =>{
                    if (!err){
                        return _response.apiSuccess(res, responsemsg.transactionUpdateSuccess)
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
        db.query("SELECT * FROM `transaction` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.transactionFound ,result)
            } else {
                return _response.apiWarning(res , responsemsg.transactionListIsEmpty)
            }
        });
    }else {
        return _response.apiWarning(res , 'Please select id')
    }
}

function _delete(req ,res){

    if (req.params.id){
        db.query("SELECT * FROM `transaction` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!result.length){
                return _response.apiWarning(res, responsemsg.transactionListIsEmpty)
            }else {
                db.query("DELETE FROM `transaction` WHERE id='" + req.params.id + "'", (err, result) => {
                    if (!err) {
                        return _response.apiSuccess(res, responsemsg.transactionDeleteSuccess)
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


