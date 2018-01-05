'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var requestComplete = function(req, res){
        var dfd = q.defer();
        redisModel.getQueues().done(function(queues){
          redisModel.getStatus("complete").done(function(completed){
            redisModel.getJobsInList(completed).done(function(keys){
              redisModel.formatKeys(keys).done(function(keyList){
                redisModel.getStatusCounts().done(function(countObject){
                  var model = {queues: queues, keys: keyList, counts: countObject, complete: true, type: "Complete" };
                  dfd.resolve(model);
                });
              });
            });
          });
        });
        return dfd.promise;
    };

    app.get('/:queueName/complete', function (req, res) {
        requestComplete(req, res).done(function(model){
            model['selectedQueue'] = req.params.queueName;
            res.render('jobList', model);
        });
    });

    app.get('/api/:queueName/complete', function (req, res) {
        requestComplete(req, res).done(function(model){
            model['selectedQueue'] = req.params.queueName;
            res.json(model);
        });
    });
};
