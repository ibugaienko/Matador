var DataModel = function(){
    var _self = this;

    //Page information
    _self.complete = ko.observable(null);
    _self.failed = ko.observable(null);
    _self.active = ko.observable(null);
    _self.pending = ko.observable(null);
    _self.delayed = ko.observable(null);
    _self.stuck = ko.observable(null);
    _self.queues = ko.observableArray([]);
    _self.selectedQueue = ko.observable("");
    _self.queueNames = ko.observableArray([]);
    _self.keys = ko.observableArray([]);
    _self.memory = ko.observable({});
    _self.peakMemory = ko.observable("");

    _self.autoRefreshId = null;
    _self.fn = {
        refreshViewModel: function(force){
            var pathname = window.location.pathname.replace(window.basepath, '');
            var refreshUrl = window.basepath + '/api' + (pathname !== '/' ? pathname : '');

            var refresh = function(){
                $.getJSON(refreshUrl).done(function(data){
                    _self.keys(data.keys);
                    if (data.queues) {
                      _self.queues(data.queues);
                      _self.queueNames(data.queues.map(function(q) { return q.name; }));
                      if (_self.selectedQueue()) {
                        var queue = data.queues.filter(
                          function (q){ return _self.selectedQueue() === q.name }
                        )[0];
                        _self.complete(" ("+queue.completed+")");
                        _self.failed(" ("+queue.failed+")");
                        _self.active(" ("+queue.active+")");
                        _self.pending(" ("+queue.pending+")");
                        _self.delayed(" ("+queue.delayed+")");
                      }
                    }
                    _self.stuck(" ("+data.counts.stuck+")");
                    if(data.memory){
                        _self.memory(data.memory.usage);
                        _self.peakMemory(data.memory.peak.human);
                    }
                });
            };
            if(force){
                clearInterval(_self.autoRefreshId);
                refresh();
            }
            _self.autoRefreshId = setInterval(refresh, 2500);
        }
    }

    return _self;
}

var dataModel = new DataModel();
