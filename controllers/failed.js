'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var getFailedData = function(req, res){
        var dfd = q.defer();
        redisModel.getQueues().done(function(queues){
          redisModel.getStatus("failed").done(function(failed){
            redisModel.getJobsInList(failed).done(function(keys){
              redisModel.formatKeys(keys).done(function(keyList){
                redisModel.getStatusCounts().done(function(countObject){
                  var model = {queues: queues, keys: keyList, counts: countObject, failed: true, type: "Failed"};
                  dfd.resolve(model);
                });
              });
            });
          });
        });
        return dfd.promise;
    }

    app.get('/api/failed', function (req, res) {
        getFailedData(req, res).done(function(model){
            res.json(model);
        });
    });

    app.get('/api/:queueName/failed', function (req, res) {
        getFailedData(req, res).done(function(model){
            model['selectedQueue'] = req.params.queueName;
            res.json(model);
        });
    });
};
