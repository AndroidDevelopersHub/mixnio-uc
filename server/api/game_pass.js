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
const moment = require("moment")


module.exports = function (router) {
    router.get('/game_pass', list);
    router.post('/game_pass', add);
    router.put('/game_pass/:id', update);
    router.get('/game_pass/:id', details);
    router.delete('/game_pass/:id', _delete);

    router.post('/game_pass_entry', join);
    router.put('/game_pass_entry', setWinner);
    router.get('/game_pass_entry', joinList);

}


const schema = Joi.object({
    username: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().min(11).required(),
    salt: Joi.string().required(),
    //token: Joi.string().required()
});


async function join(req, res){
    //
    // const { error } = schema.validate(req.body);
    // if (error) return _response.apiFailed(res ,error.details[0].message)

    console.log('User not exist')


    let isExist = await db.awaitQuery("SELECT 1 FROM  `game_pass_entry` WHERE uid ='" + req.body.uid + "' AND game_pass_id ='" + req.body.game_pass_id + "' AND type ="+req.body.type+" ");

    if (isExist.length < 1) {
        db.query("INSERT INTO game_pass_entry SET ?", req.body , (err, result) => {
            if (!err) {
                return _response.apiSuccess(res, responsemsg.saveSuccess , result)
            } else {
                return _response.apiFailed(res, err , result)
            }
        });
    }else {
        return _response.apiWarning(res, "User already join")
    }


}


function setWinner(req, res){
    //
    // const { error } = schema.validate(req.body);
    // if (error) return _response.apiFailed(res ,error.details[0].message)

    //game_pass_id
    //uid
    db.query("UPDATE  game_pass_entry WHERE game_pass_id = '"+req.body.game_pass_id+"' AND  uid = '"+req.body.uid+"' SET ?", req.body , (err, result) => {
        if (!err) {
            return _response.apiSuccess(res, responsemsg.saveSuccess , result)
        } else {
            return _response.apiFailed(res, err , result)
        }
    });
}



async function joinList(req ,res ){

    // uid

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

    } else {
        let queryy = "SELECT  u.id AS uid ,u.name , u.email,g.winner,g.game_pass_id ,g.id,g.createdAt FROM `game_pass_entry` AS g INNER JOIN `users` AS u ";
        let x = ""
        let a = false;
        let b = 0;



        if (req.query.type){
            b++
            a = true
            if (x.includes("AND")){
                x += " AND type="+req.query.type+" "
            }else if (b > 1) {
                x += " AND type="+req.query.type+" "
            }else {
                x += "  type="+req.query.type+" "
            }


        }
        if (req.query.winner){
            b++
            a = true
            if (x.includes("AND")){
                x += " AND winner="+req.query.winner+" "
            }else if (b > 1) {
                x += " AND winner="+req.query.winner+" "
            }else {
                x += "  winner="+req.query.winner+" "
            }


        }
        if (req.query.game_pass_id){
            b++
            a = true
            console.log(x.includes("AND"))
            if (x.includes("AND")) {
                x += " AND game_pass_id=" + req.query.game_pass_id + " "
            }else if (b > 1) {
                x += " AND game_pass_id=" + req.query.game_pass_id + " "
            }else {
                x += " game_pass_id=" + req.query.game_pass_id + " "
            }
        }
        if (req.query.uid){
            b++
            a = true
            if (x.includes("AND")) {
                x += " AND uid=" + req.query.uid + " "
            }else if (b > 1) {
                x += " AND uid=" + req.query.uid + " "
            }else {
                x += " uid=" + req.query.uid + " "
            }
        }

        /*if (req.query.winner && req.query.game_pass_id){
            queryy = "SELECT  u.id AS uid ,u.name , u.email,g.winner,g.game_pass_id ,g.id,g.createdAt FROM `game_pass_entry` AS g INNER JOIN `users` AS u WHERE game_pass_id = '"+req.query.game_pass_id+"' AND winner="+1+" "
        }else if (req.query.winner){
            queryy = "SELECT  u.id AS uid ,u.name , u.email,g.winner,g.game_pass_id ,g.id,g.createdAt FROM `game_pass_entry` AS g INNER JOIN `users` AS u WHERE winner="+1+" LIMIT "+limit+" OFFSET "+offset+" "
        }
        else if (req.query.uid && req.query.game_pass_id){
            queryy = "SELECT  u.id AS uid ,u.name , u.email,g.winner,g.game_pass_id ,g.id,g.createdAt FROM `game_pass_entry` AS g INNER JOIN `users` AS u WHERE game_pass_id = '"+req.query.game_pass_id+"' AND uid='"+req.query.uid+"' "
        }
        else if (req.query.uid){
            queryy = "SELECT  u.id AS uid ,u.name , u.email,g.winner,g.game_pass_id ,g.id,g.createdAt FROM `game_pass_entry` AS g INNER JOIN `users` AS u  WHERE uid="+req.query.uid+"  "
        }else if (req.query.winner && req.query.game_pass_id && req.query.uid){
            queryy = "SELECT u.id AS uid ,u.name , u.email,g.winner,g.game_pass_id ,g.id,g.createdAt FROM `game_pass_entry` AS g INNER JOIN `users` AS u  WHERE uid="+req.query.uid+" AND game_pass_id = '"+req.query.game_pass_id+"' AND winner="+1+" "
        }*/
        if (a === true){
            queryy += "WHERE "+x
        }

        queryy = queryy+" LIMIT "+limit+" OFFSET "+offset+" "
        console.log(queryy)

        db.query(queryy, (err, result) => {
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

    var limit = 10;
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

        db.query("SELECT * FROM game_pass WHERE CONCAT(title) REGEXP '"+req.query.search_string+"'  LIMIT "+limit+" OFFSET "+offset+"", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.found , result,{page: parseInt(page) , limit: parseInt(limit),totalDocs: totalDocs })

            } else {
                return _response.apiFailed(res, responsemsg.listIsEmpty)
            }
        });


    }else {
        db.query("SELECT * FROM game_pass WHERE status ="+1+" AND  end_time <='" + moment().format("YYYY-MM-DD")+"23:59:59' ORDER BY createdAt LIMIT "+limit+" OFFSET "+offset+"", (err, result) => {
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
