var responsecode = require('../middleware/response-code')
var responsemsg = require('../middleware/response-msg')

module.exports = {
   apiSuccess: function apiSuccess(res, msg, data){
       return res.status(200).json({
           status: responsecode.statusOk,
           message: msg,
           items: data
       });
   },

    apiFailed: function apiFailed(res, msg, data){
        return res.status(200).json({
            status: responsecode.statusNo,
            message: msg,
            items: data
        });
    }

}