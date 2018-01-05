'use strict';

var q = require('q')


var redisModel = require('../models/redis');

module.exports = function (app) {

    var getNewJobModel = function(req, res){
        var dfd = q.defer();
        redisModel.getQueues().done(function(queues){
          redisModel.getStatusCounts().done(function(countObject){
            var model = {queues: queues, counts: countObject, newjob: true, type: "New Job" };
            dfd.resolve(model);
          });
        });
        return dfd.promise;
    };

    app.get('/:queueName/newjob', function (req, res) {
        getNewJobModel(req, res).done(function(model){
            model['selectedQueue'] = req.params.queueName;
            res.render('newJob', model);
        });
    });

    app.get('/api/:queueName/newjob', function (req, res) {
        getNewJobModel(req, res).done(function(model){
            model['selectedQueue'] = req.params.queueName;
            res.json(model);
        });
    });


};
