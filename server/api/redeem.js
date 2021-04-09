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
    router.get('/redeem', list);
    router.post('/redeem', add);
    router.put('/redeem/:id', update);
    router.get('/redeem/:id', details);
    router.delete('/redeem/:id', _delete);
}


const schema = Joi.object({
    uid: Joi.string().required(),
    collect_from: Joi.string().required(),
    amount: Joi.string().required(),
});


function add(req, res){
    //
    var collect_from = req.body.collect_from;
    var amount = req.body.amount;
    var uid = req.body.uid;

    const { error } = schema.validate(req.body);
    if (error) return _response.apiFailed(res ,error.details[0].message)

    db.query("INSERT INTO redeem (uid,collect_from,amount) VALUES ('"+uid+"','"+collect_from+"','"+amount+"')", (err, result) => {
        if (!err) {
            return _response.apiSuccess(res, responsemsg.redeemSaveSuccess , result)
        } else {
            return _response.apiFailed(res, err , result)
        }
    });

}

function list(req ,res ){

    //Search by String
    if (req.query.search_string){
        const schema = Joi.object({
            search_string: Joi.string().required()
        });
        const { error } = schema.validate(req.query);
        if (error) return _response.apiFailed(res ,error.details[0].message)

        db.query("SELECT * FROM redeem WHERE collect_from && amount REGEXP '"+req.query.search_string+"'", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.redeemFound , result)

            } else {
                return _response.apiFailed(res, responsemsg.redeemListIsEmpty)
            }
        });


    }else {
        db.query("SELECT * FROM redeem", (err, result) => {
            if (!err) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.redeemFound , result)

            } else {
                return _response.apiFailed(res, responsemsg.redeemListIsEmpty)
            }
        });
    }



}

function update(req ,res ){
    var formData = []

    if (req.params.id){
        db.query("SELECT * FROM `redeem` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {

                formData = result[0]
                if (req.query.collect_from){
                    formData.collect_from = req.query.collect_from
                }
                if (req.query.amount){
                    formData.amount = req.query.amount
                }
                db.query("UPDATE redeem SET type ='"+formData.collect_from+"',amount ='"+formData.amount+"' WHERE id = '"+req.params.id+"'" , (err , result) =>{
                    if (!err){
                        return _response.apiSuccess(res, responsemsg.redeemUpdateSuccess)
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
        db.query("SELECT * FROM `redeem` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.redeemFound ,result)
            } else {
                return _response.apiWarning(res , responsemsg.redeemListIsEmpty)
            }
        });
    }else {
        return _response.apiWarning(res , 'Please select id')
    }
}

function _delete(req ,res){

    if (req.params.id){
        db.query("SELECT * FROM `redeem` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!result.length){
                return _response.apiWarning(res, responsemsg.redeemListIsEmpty)
            }else {
                db.query("DELETE FROM `redeem` WHERE id='" + req.params.id + "'", (err, result) => {
                    if (!err) {
                        return _response.apiSuccess(res, responsemsg.redeemDeleteSuccess)
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


