var state = {
  field: [],
  last: 'o',
  message: ''
};

var data = localStorage.getItem('game');
if (data) {
  state = JSON.parse(data);
}

window.addEventListener('load', function handler() {
  'use strict';
  // Ваш код будет здесь
  var input = document.querySelector('.count');
  var button = document.querySelector('.generateField');
  var errorMess = document.querySelector('.error-message');
  var field = document.querySelector('.field');
  var fragment = document.createDocumentFragment();
  var mainGame = document.querySelector('.mainGame');
  var startGame = document.querySelector('.startGame');

  /*global getWinner */
  var button2 = document.querySelector('.startNewGame');
  var message = document.querySelector('.winner-message');
  var previous;
  var counter;
  function getCellIndex(target) {
    return [].indexOf.call(target.parentNode.children, target);
  }
  function getRowIndex(target) {
    return [].indexOf.call(target.parentNode.parentNode.children, target.parentNode);
  }
  function fill(e) {
    var target = e.target;
    var resultMessage = '';
    if (target.classList.contains('cell') && !target.classList.contains('o') && !target.classList.contains('x')) {
      if (previous === 'o' || state.last === 'o') {
        target.classList.add('x');
        state.field[getRowIndex(target)][getCellIndex(target)] = ('x');
        previous = state.last = 'x';
      } else {
        target.classList.add('o');
        state.field[getRowIndex(target)][getCellIndex(target)] = ('o');
        previous = state.last = 'o';
      }
      counter++;
      if (counter >= 9) {
        switch (getWinner()) {
          case 'x':
            counter = 0;
            message.innerHTML = resultMessage = 'Крестик победил';
            field.removeEventListener('click', fill, true);
            break;
          case 'o':
            counter = 0;
            message.innerHTML = resultMessage = 'Нолик победил';
            field.removeEventListener('click', fill, true);
            break;
          default :
            break;
        }
      }
      state.message = resultMessage;
      localStorage.setItem('game', JSON.stringify(state));
    }
  }
  function toogleMess() {
    mainGame.style.display = 'none';
    startGame.style.display = 'block';
  }
  function toogleMess2() {
    mainGame.style.display = 'block';
    startGame.style.display = 'none';
  }
  function generateField() {
    var i;
    var j;
    var row;
    var cell;
    var size = input.value || state.field.length;
    message.innerHTML = field.innerHTML = errorMess.innerHTML = '';

    if (size >= 5 && size <= 15 && size % 1 === 0) {
      for (i = 0; i < size; i++) {
        row = document.createElement('div');
        row.className = 'row';
        if (!data) {
          state.field.push([]);
        }
        for (j = 0; j < size; j++) {
          cell = document.createElement('div');
          cell.className = 'cell';
          if (!data) {
            state.field[i][j] = '';
          } else if (state.field[i][j] === 'x' || state.field[i][j] === 'o') {
            cell.classList.add(state.field[i][j]);
          }
          row.appendChild(cell);
        }
        fragment.appendChild(row);
      }
      field.addEventListener('click', fill, true);
      counter = 0;
      field.appendChild(fragment);
      toogleMess2();
      if (state.message !== '') {
        field.removeEventListener('click', fill, true);
        message.innerHTML = state.message;
      }
      localStorage.setItem('game', JSON.stringify(state));
    } else {
      errorMess.innerHTML = 'Вы ввели некорректное число';
    }
  }
  function generateEmptyField() {
    state.field = [];
    data = state.message = '';
  }
  if (data) {
    generateField();
  }
  button.addEventListener('click', generateEmptyField);
  button.addEventListener('click', generateField);
  button2.addEventListener('click', toogleMess);
});
