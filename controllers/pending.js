'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var getPendingModel = function(req, res){
        var dfd = q.defer();
        redisModel.getQueues().done(function(queues){
          redisModel.getStatus("wait").done(function(active){
            redisModel.getJobsInList(active).done(function(keys){
              redisModel.formatKeys(keys).done(function(keyList){
                redisModel.getStatusCounts().done(function(countObject){
                  var model = {queues: queues, keys: keyList, counts: countObject, pending: true, type: "Pending" };
                  dfd.resolve(model);
                });
              });
            });
          });
        });
        return dfd.promise;
    };

    app.get('/:queueName/pending', function (req, res) {
        getPendingModel(req, res).done(function(model){
            model['selectedQueue'] = req.params.queueName;
            res.render('jobList', model);
        });
    });

    app.get('/api/:queueName/pending', function (req, res) {
        getPendingModel(req, res).done(function(model){
            model['selectedQueue'] = req.params.queueName;
            res.json(model);
        });
    });
};
