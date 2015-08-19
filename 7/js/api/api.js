(function() {
  'use strict';
  var users = [];

  function User(data) {
    this.me = this;
    this.items = [];
    this.id = data.id || '';
    this.name = data.name || '';
    this.phone = data.phone || '';
    this.role = data.role || '';
    this.strikes = data.strikes || 0;
    this.location = data.location || '';
  }
  function Student(data) {
    User.apply(this, arguments);
  }
  function Support(data) {
    User.apply(this, arguments);
  }
  function Admin(data) {
    User.apply(this, arguments);
  }
  // задаём наследование
  Student.prototype = Object.create(User.prototype);
  Support.prototype = Object.create(User.prototype);
  Admin.prototype = Object.create(User.prototype);

  function createUsersFromData(data) {
    var user;
    data.forEach(function handler(item, index) {
      if (item.role === 'Administrator') item.role = 'Admin';
      user = new window[item.role](data[index]);
      users.push(user);
    });
  }

  function sendRequest(method, url, callback, postData, condition, context) {
    var data;
    var me = context;
    var p = new XMLHttpRequest();
    p.open(method, url, true);
    p.setRequestHeader('Content-Type', 'application/json');
    p.addEventListener('readystatechange', function handler2() {
      if (p.status === 200) {
        if (p.readyState === p.DONE) {
          data = JSON.parse(p.responseText);
          if (condition === 1) {
            createUsersFromData(data);
            callback(false, users);
          } else if (condition === 2) {
            me.id = data.id;
            callback(false);
          } else {
            callback(false);
          }
        }
      } else {
        if (p.readyState === p.DONE) {
          callback(true);
        }
      }
    });
    p.send(postData);
  }
  User.load = function handler(callback) {
    sendRequest('GET', window.crudURL, callback, null, 1);
  };
  User.prototype.save = function handler(callback) {
    var me = this;
    var id = this.id;
    if (id) {
      if (this.role !== 'Admin') sendRequest('PUT', window.crudURL + '/' + id, callback);
    } else {
      sendRequest('POST', window.crudURL, callback, null, 2, me);
    }
  };
  Admin.prototype.save = function handler(callback) {
    // вызвать метод родителя, передав ему текущие аргументы
    User.prototype.save.apply(this, arguments);
    if (this.id) {
      sendRequest('GET', window.crudURL + '/refreshAdmins', callback);
    }
  };
  User.prototype.remove = function handler(callback) {
    var id = this.id;
    sendRequest('DELETE', window.crudURL + '/' + id, callback);
  };
  Student.prototype.getStrikesCount = function handler() {
    return this.strikes;
  };

  window.User = User;
  window.Student = Student;
  window.Support = Support;
  window.Admin = Admin;
})();
