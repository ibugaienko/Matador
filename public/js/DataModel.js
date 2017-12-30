
var DataModel = function(){
    var _self = this;

    //Page information
    _self.complete = ko.observable(null);
    _self.failed = ko.observable(null);
    _self.active = ko.observable(null);
    _self.pending = ko.observable(null);
    _self.delayed = ko.observable(null);
    _self.stuck = ko.observable(null);
    _self.queues = ko.observable(null);
    _self.keys = ko.observableArray([]);
    _self.memory = ko.observable({});
    _self.peakMemory = ko.observable("");

    //Pagination and filtering
    _self.currentPageIndex = ko.observable(0);
    _self.paginationOptions = [25,50,100,250,500];
    var __pageSize = ko.observable(_self.paginationOptions[0]);
    _self.typeFilter = ko.observable("");
    _self.filteredKeys = ko.computed(function (){
      if (!_self.keys()) {
        return [];
      }
      var isTypeFilterable = _self.keys().reduce(function (acc, cur){
        return acc + (cur['type']) ? 1 : 0;
      }, 0);
      if (!isTypeFilterable) {
        return _self.keys();
      }
      var filter = _self.typeFilter().toLowerCase();
      return ko.utils.arrayFilter(_self.keys(), function (key){
        return ko.unwrap(key['id']) && ko.unwrap(key['type']).indexOf(filter) !== -1;
      });
    });

    _self.pageSize = ko.pureComputed({
      read: function (){
        return __pageSize();
      },
      write: function (value){
        __pageSize(value);
        if (_self.currentPageIndex() > _self.maxPageIndex()) {
          _self.currentPageIndex(0);
        }
      }
    });
    _self.itemsOnCurrentPage = ko.computed(function () {
        var startIndex = _self.pageSize() * _self.currentPageIndex();
        return _self.filteredKeys().slice(startIndex, startIndex + _self.pageSize());
    });
    _self.maxPageIndex = ko.computed(function () {
        return Math.ceil(ko.unwrap(_self.filteredKeys).length / _self.pageSize()) - 1;
    });

    _self.autoRefreshId = null;
    _self.fn = {
        refreshViewModel: function(force){
            var pathname = window.location.pathname.replace(window.basepath, '');
            var refreshUrl = window.basepath + '/api' + (pathname !== '/' ? pathname : '');

            var refresh = function(){
                $.getJSON(refreshUrl).done(function(data){
                    _self.complete(" ("+data.counts.complete+")");
                    _self.failed(" ("+data.counts.failed+")");
                    _self.active(" ("+data.counts.active+")");
                    _self.pending(" ("+data.counts.pending+")");
                    _self.delayed(" ("+data.counts.delayed+")");
                    _self.stuck(" ("+data.counts.stuck+")");
                    _self.keys(data.keys);
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
