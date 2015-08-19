/**
 * Created by nakan on 08.07.15.
 */
var data2 = [
  {
    id: 1,
    name: 'Vasya',
    status: 'active',
    phone: '911'
  },
  {
    id: 2,
    name: 'Kolya',
    status: 'redcard',
    phone: '937 992'
  },
  {
    id: 3,
    name: 'Petya',
    status: 'removed',
    phone: '430 7992'
  },
  {
    id: 4,
    name: 'Vasya2',
    status: 'active',
    phone: '911'
  },
  {
    id: 5,
    name: 'Kolya2',
    status: 'redcard',
    phone: '937 992'
  },
  {
    id: 6,
    name: 'Petya2',
    status: 'removed',
    phone: '430 7992'
  }
];
/* Controllers */
var userlistApp = angular.module('jsbursa', []);

userlistApp.controller('UserListCtrl', function($scope, $http) {

  // $scope.url = 'http://jb5.smartjs.academy/api/users';

  // $http.get($scope.url).success(function(data) {
  $scope.data = data2;
    // $scope.render();
  // });

  $scope.active = [];
  $scope.redcard = [];
  $scope.removed = [];

  $scope.defaultSortOrder = {
    active: [],
    redcard: [],
    removed: []
  };

  $scope.sortOrder = $scope.defaultSortOrder;

  $scope.render = function() {
    //$('ul').html('');
    var oldItems = [].concat($scope.sortOrder.active, $scope.sortOrder.redcard, $scope.sortOrder.removed);
    var newItems = _.difference(
      _.map($scope.data, 'id'),
      oldItems
    );

    oldItems.forEach(function (id) {
      console.log(id);
      var item = _.find($scope.data, {id: id});
      if (!item) {
        return;
      }
      $scope[item.status].push(item);
    });

    newItems.forEach(function (id) {
      var item = _.find($scope.data, {id: id});
      $scope[item.status].push(item);
    });
  };
  $scope.render();
});

userlistApp.directive('draggableList', function ($timeout) {
  return {
    scope: {
      items: '=',
      id: '@'
    },
    template: '<ul data-role="drag-list"><li ng-repeat="item in items" data-id="{{item.id}}" data-status="{{item.status}}"><h3>{{item.name}}</h3><h4>{{item.phone}}</h4></li></ul>',

    link: function($scope, $element) {
      var $list = $element.find('ul');
      $scope.items = $scope.items || [];

      function saveOrder() {
        if (!$scope.id) {
          return;
        }
        localStorage.setItem('draggable-' + $scope.id, JSON.stringify(_.map($scope.items, 'id')));
      }

      function refresh() {
        console.log('called on ' + $scope.id);
        $list.sortable('refresh');
        if ($scope.id) {
          var inStorage = JSON.parse(localStorage.getItem('draggable-' + $scope.id)) || [];
          if (inStorage.length === 0 || $scope.items.length === 0) { return; }
          console.log('restoring sort order');
        }
      }
      var oldIndex = null;

      $list.sortable({
        connectWith: 'ul[data-role="drag-list"]',
        placeholder: 'placeholder',

        remove: function (event, ui) {
          ui.item.data('object', $scope.items[oldIndex]);
          $scope.items.splice(oldIndex, 1);
          saveOrder();
          $scope.$applyAsync();
        },
        receive: function (event, ui) {
          console.log('receive here');
          var obj = ui.item.data('object');
          var index = ui.item.index();
          $scope.items.splice(index, 0, obj);
          saveOrder();
          // huck for fix sync bug
          $scope.tempItems = angular.copy($scope.items);
          $scope.items = [];
          $timeout(function () {
            $scope.items = $scope.tempItems;
          });
        },
        start: function (event, ui) {
          oldIndex = ui.item.index();
        },
        stop: function (event, ui) {
          console.log('stop');
          var newIndex = ui.item.index();
          if (ui.item.parents('ul')[0] !== $list[0] || oldIndex === newIndex) {
            return;
          }
          var obj = $scope.items[oldIndex];
          $scope.items.splice(oldIndex, 1);
          $scope.items.splice(newIndex, 0, obj);
          saveOrder();
          $scope.$applyAsync();
        }
      });
      $scope.$watch('items', refresh, true);
    }
  };
});
