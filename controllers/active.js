'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var requestActive = function(req, res){
        var dfd = q.defer();
        redisModel.getQueues().done(function(queues){
          redisModel.getStatus("active").done(function(active){
            redisModel.getJobsInList(active).done(function(keys){
              redisModel.formatKeys(keys).done(function(formattedKeys){
                redisModel.getProgressForKeys(formattedKeys).done(function(keyList){
                  redisModel.getStatusCounts().done(function(countObject){
                    var model = {queues: queues, keys: keyList, counts: countObject, active: true, type: "Active" };
                    dfd.resolve(model);
                  });
                });
              });
            });
          });
        });
        return dfd.promise;
    }

    app.get('/:queueName/active', function (req, res) {
        requestActive(req, res).done(function(model){
            model['selectedQueue'] = req.params.queueName;
            res.render('jobList', model);
        });
    });

    app.get('/api/:queueName/active', function (req, res) {
        requestActive(req, res).done(function(model){
            model['selectedQueue'] = req.params.queueName;
            res.json(model);
        });
    });
};
