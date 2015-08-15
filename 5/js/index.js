var state = {
  items: [],
  active: [],
  redcard: [],
  removed: []
};
var data = [
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

var localData = localStorage.getItem('users');
if (localData) {
  state = JSON.parse(localData);
}

$(function() {
  'use strict';
  var students = [];
  var student;
  var storage;
  var dragOldPOsition;
  var dragNewPOsition;
  var waitForResponse;
  var hasChanged;
  var uls = $('.row ul');
  var lis = uls.children('li');
  var activeCol = $('.active ul');
  var redcardCol = $('.redcard ul');
  var removedCol = $('.removed ul');

  function UserStorage() {
    this.items = [];
    this.state = {
      active: [],
      redcard: [],
      removed: []
    };
  }
  storage = new UserStorage();

  UserStorage.prototype.getById = function getById(id) {
    var me = storage;
    var i;
    for (i = 0; i < me.items.length; i++) {
      if (me.items[i].id == id) {
        return me.items[i];
      }
    }
  };
  UserStorage.prototype.load = function() {
    var me = storage;
    Student.load(function(err, list) {
      if (err) {
        alert('Ошибка загрузки списка пользователей');
        return;
      }
      list.forEach(function (record) {
        if (!(record instanceof Student)) {
          throw new Error('User storage can store only Users');
        }
        if (!localData) {
          if (record.status === 'active') {
            state.active.push(record);
          } else if (record.status === 'redcard') {
            state.redcard.push(record);
          } else if (record.status === 'removed') {
            state.removed.push(record);
          }
        }
        me.items.push(record);
      });
    });
  };
  UserStorage.prototype.updateUserOrder = function updateUser(user, newStatus) {
    var me = storage;
    var status = user.status;

    if (!hasChanged) {
      // remove item from old pos.
      state[status].splice(dragOldPOsition, 1);
      // add item to new pos.
      if (newStatus) {
        state[newStatus].splice(dragNewPOsition, 0, user);
        user.status = newStatus;
      } else {
        state[status].splice(dragNewPOsition, 0, user);
      }

      state.items = state.active.concat(state.redcard).concat(state.removed);
      localStorage.setItem('users', JSON.stringify(state));

      hasChanged = true;
    }

  };

  function loadToDom(item) {
    var li = '<li data-id="' + item.id + '"><h3>' + item.name + '</h3><h4>' + item.phone + '</h4></li>';
    switch (item.status) {
      case 'active' :
        activeCol.append(li);
        break;
      case 'redcard' :
        redcardCol.append(li);
        break;
      case 'removed' :
        removedCol.append(li);
        break;
      default :
        console.log('error with this item: ' + li);
    }
  }
  function Student(data) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.status = data.status;
  }
  Student.prototype.addBehavior = function() {
    uls.sortable({
      connectWith: uls
    });
  };
  Student.load = function(callback) {
    if (!localData) {
      // comented becouse study server doesn't work anymore

      // $.get(window.url, function (data) {
        $(data).each(function handler(index, item) {
          student = new Student(item);
          students.push(student);
          loadToDom(student);
        });
        callback(false, students);
      // }).fail(function () {
      //   callback(true);
      // });
    } else {
      $(state.items).each(function handler(index, item) {
        student = new Student(item);
        students.push(student);
        loadToDom(student);
      });
      callback(false, students);
    }
    Student.prototype.addBehavior();
  };
  Student.prototype.changeStatus = function handler(target, dragItem, student, newStatus) {
    var me = student;
    var id = student.id;
    var sendData;
    sendData = {status: newStatus};
    if (me.status !== 'removed') {
      // $.post(window.url + '/' + id, sendData, function callback(response) {
      //   if (response) console.log(JSON.parse(response.responseText));
      //   waitForResponse = false;
         UserStorage.prototype.updateUserOrder(student, newStatus);
      // }, 'json').fail(function handler(response) {
      //   uls.sortable("cancel");
      //   if (response) console.log(JSON.parse(response.responseText));
      // });
    } else {
      uls.sortable("cancel");
      console.log('Forbiden, I am removed student ' + me.name);
    }
  };
  Student.prototype.save = function() {

  };
  uls.sortable({
      start: function handler( event, ui ) {
        var dragItem = $(ui.item);
        dragOldPOsition = dragItem.index();
        hasChanged = false;
      },
      stop: function handler( event, ui ) {
        var dragItem = $(ui.item);
        dragNewPOsition = dragItem.index();
        student = UserStorage.prototype.getById(dragItem.data('id'));
        UserStorage.prototype.updateUserOrder(student);
      },
      receive: function handler( event, ui ) {
        var target = event.target;
        var dragItem = $(ui.item);
        var newStatus = $(target).parent().attr('class').toString().split(' ')[1];
        student = UserStorage.prototype.getById(dragItem.data('id'));
        dragNewPOsition = dragItem.index();
        if (newStatus !== student.status) {
          //waitForResponse = true;
          Student.prototype.changeStatus(target, dragItem, student, newStatus);
        }
      }
  });
  UserStorage.prototype.load();
});
