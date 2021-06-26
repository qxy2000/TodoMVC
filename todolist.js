var $ = function (sel) {
  return document.querySelector(sel);
};
var $All = function (sel) {
  return document.querySelectorAll(sel);
};

//获取localStorage
function getStorage(name) {
  return JSON.parse(localStorage.getItem(name))
}

//设置localStorage
function setStorage(name, list) {
  localStorage.setItem(name, JSON.stringify(list))
}

// 控制底部filter的显示
var showHidden = 0

var showHiddenBtn = $('#fab')
showHiddenBtn.addEventListener('click', function () {
  console.log(1)
  if (showHidden == 0) {
    $('#nav').style.display = "block"
    // showHiddenBtn.innerHTML = "-"
    showHidden = 1
  } else if (showHidden == 1) {
    $('#nav').style.display = "none"
    showHiddenBtn.innerHTML = "+"
    showHidden = 0
  }
})

//右下角的悬浮按钮控制下边栏的显示（下边栏有过滤tag--active， completed和all）
var fab = $(".fab")
var fabCtr = $(".fab-ctr")
var nav = $(".nav")
var closebtn = $('.close')
//close click
//关闭底部filter栏
closebtn.addEventListener('click', function () {
  nav.style.display = "none";
  fab.style.display = "block";
})

var guid = 0;
var sticknum = 0;  //置顶的todo个数

function update() {
  var items = $All('.todo-list li');
  var filter = $('.filters li a.selected').innerHTML;
  var leftNum = 0;
  var item, i, display;

  for (i = 0; i < items.length; ++i) {
    item = items[i];
    if (!item.classList.contains('completed')) leftNum++;

    // filters
    display = 'none';
    if (filter === 'All'
      || (filter === 'Active' && !item.classList.contains('completed'))
      || (filter === 'Completed' && item.classList.contains('completed'))) {

      display = '';
    }
    item.style.display = display;
  }

  var completedNum = items.length - leftNum;
  var count = $('.todo-count');
  count.innerHTML = (leftNum || 'No') + (leftNum > 1 ? ' items' : ' item') + ' left';

  var clearCompleted = $('.clear-completed');
  clearCompleted.style.visibility = completedNum > 0 ? 'visible' : 'hidden';

  var toggleAll = $('.toggle-all');
  toggleAll.style.visibility = items.length > 0 ? 'visible' : 'hidden';
  toggleAll.checked = items.length === completedNum;

  //把todo保存到localStorage
  let todoList = []
  // console.log(items)
  for (let j = 0; j < items.length; j++) {
    let todo = {}
    todo.id = items[j].id
    todo.msg = items[j].lastElementChild.children[1].innerHTML
    todo.stick = items[j].getAttribute('class')
    todo.startDate = items[j].lastElementChild.lastElementChild.innerHTML
    todoList.push(todo)
  }
  setStorage('todoList', todoList)
}

function addTodo(msg, todoId, date) {
  var todoList = $('.todo-list');

  var item = document.createElement('li');
  if (todoId) {
    var id = todoId
    var startDate = date
  } else {
    var startDate = new Date().getTime()
    var id = 'item' + guid++;
  }
  item.setAttribute('id', id);
  // item.setAttribute('class', 'draggable');
  item.innerHTML = [
    '<div class="view">',
    '    <input class="toggle" type="checkbox">',
    '    <label class="todo-label" contenteditable>' + msg + '</label>',
    //'    <button class="destroy"></button>',
    '    <button class="stick"></button>',
    '    <span class="date"></span>',
    '    <button class="startDate">' + startDate + '</button>',
    '</div>'
  ].join('');


  // 通过左滑/右滑删除单条todo
  let touchStart, touchObj;
  let isDelete = false;
  item.addEventListener('touchstart', function (event) {
    touchStart = event.touches[0];
    touchObj = event.currentTarget;
    isDelete = false;
  }, false);
  item.addEventListener('touchmove', function (event) {
    let freshTouch = event.touches[0];
    var horizontalOffset = freshTouch.clientX - touchStart.clientX;
    //设置过渡效果
    touchObj.style.transition = ".2s linear";
    var deviceWidth = 400;
    //考虑移动距离过短的情况（误触）
    if (Math.abs(horizontalOffset) < deviceWidth / 3) {
      touchObj.style.left = horizontalOffset + 'px';
    } else {
      if (horizontalOffset < 0) {     // 左滑
        touchObj.style.left = -deviceWidth * 2 + 'px';
      } else {                        // 右滑
        touchObj.style.left = deviceWidth * 2 + 'px';
      }
      isDelete = true;
    }
  }, false);
  item.addEventListener('touchend', function (event) {
    if (isDelete && item != null) {
      item.parentNode.removeChild(item);
      update();
    } else {
      touchObj.style.left = 0;
    }
  }, false);

  var stickynotes = item.querySelector('.view');
  stickynotes.addEventListener('singleTap', function () {
    console.log("swipeLeft!")
  })

  var label = item.querySelector('.todo-label');
  label.addEventListener('touchend', function () {
    console.log(label.innerHTML)

    update();
  }, false);

  item.querySelector('.toggle').addEventListener('change', function () {
    updateTodo(id, this.checked);
  }, false);

  //item.querySelector('.destroy').addEventListener('click', function () {
  //  removeTodo(id);
  //}, false);

  //绑定置顶事件
  item.querySelector('.stick').addEventListener('click', function () {
    // console.log(this.parentElement.children[1].innerHTML)
    stickTodo(id, this.parentElement.children[1].innerHTML, this.parentElement.lastElementChild.innerHTML);
  }, false);

  todoList.insertBefore(item, todoList.children[sticknum]);

  //生成计时器,通过setInterval函数实现
  var timer = setInterval(function () {
    var nowDate = new Date();
    var diffTime = (nowDate.getTime() - parseInt(startDate)) / 1000
    var diffD = parseInt(diffTime / 86400)
    var diffH = parseInt(diffTime / 3600) - 24 * diffD
    var diffM = parseInt(diffTime % 3600 / 60)
    var diffS = parseInt(diffTime % 60)
    var dateMsg = '🕙 ' + diffD + '天' + diffH + '时' + diffM + '分'
    if (!$('#' + id + ' .date')) {
      clearInterval(timer)
    } else {
      $('#' + id + ' .date').innerHTML = dateMsg
    }
  }, 1000)
  update();
}

function updateTodo(itemId, done) {
  var item = $('#' + itemId);
  if (done) item.classList.add('completed');
  else item.classList.remove('completed');
  update();
}

function removeTodo(itemId) {
  var todoList = $('.todo-list');
  var item = $('#' + itemId);
  todoList.removeChild(item);
  update();
}

// 置顶
function stickTodo(id, msg, startData) {
  //若此条todo已经是置顶状态，则取消置顶
  if ($('#' + id).getAttribute('class') == 'stickLi') {
    $('#' + id).setAttribute('class', '')
    sticknum = sticknum - 1;
  }
  //若此条todo不是是置顶状态，则置顶
  else {
    removeTodo(id)
    addTodo(msg, id, startData)
    $('#' + id).setAttribute('class', 'stickLi')
    sticknum = sticknum + 1;
  }
  update()
}

function clearCompletedTodoList() {
  var todoList = $('.todo-list');
  var items = todoList.querySelectorAll('li');
  for (var i = items.length - 1; i >= 0; --i) {
    var item = items[i];
    if (item.classList.contains('completed')) {
      todoList.removeChild(item);
    }
  }
  update();
}

function toggleAllTodoList() {
  var items = $All('.todo-list li');
  var toggleAll = $('.toggle-all');
  var checked = toggleAll.checked;
  for (var i = 0; i < items.length; ++i) {
    var item = items[i];
    var toggle = item.querySelector('.toggle');
    if (toggle.checked !== checked) {
      toggle.checked = checked;
      if (checked) item.classList.add('completed');
      else item.classList.remove('completed');
    }
  }
  update();
}


function floatActionBtn() {
  var fab = $(".fab")
  var fabCtr = $(".fab-ctr")
  var nav = $(".nav")
  var sel = $(".sel")
  var close = $(".close")

  //fab click
  fab.addEventListener('click', function () {
    fabCtr.classList.add("active")
    setTimeout(function () {
      nav.classList.add("active");
    }, 200)
    setTimeout(function () {
      fab.classList.add("active");
      sel.classList.add("active")
    }, 150)
  });

  //close click
  close.addEventListener('click', function () {
    nav.style.display = "none";
    fab.style.display = "block";
  })
}

//当用户向下滑动20px后才会显示回到顶部按钮
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    topbtn.style.display = "block";
  } else {
    topbtn.style.display = "none";
  }
}

window.onload = function init() {
  //获取getStorage并重新添加
  let todoList = getStorage('todoList')
  if (todoList && todoList.length > 0) {
    guid = todoList.length
    for (let i = todoList.length - 1; i >= 0; i--) {
      let maxGuid = parseInt(todoList[i].id.slice(4))
      //防止删除后刷新页面再添加新标签会出现ID重复的情况
      if (guid <= maxGuid) { guid = maxGuid + 1 } {
        addTodo(todoList[i].msg, todoList[i].id, todoList[i].startDate)
      }
      if (todoList[i].stick == 'stickLi') {
        $('#' + todoList[i].id).setAttribute('class', 'stickLi')
      }
    }
  }

  topbtn = $(".uptotop");
  topbtn.addEventListener('click', function () {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  })

  // floatBallBtn();
  var newTodo = $('.new-todo');
  newTodo.addEventListener('keyup', function (ev) {
    // Enter
    if (ev.keyCode !== 13) return;

    var msg = newTodo.value;
    if (msg === '') {
      console.warn('msg is empty');
      return;
    }

    addTodo(msg);
    newTodo.value = '';
  }, false);

  var clearCompleted = $('.clear-completed');
  clearCompleted.addEventListener('click', function () {
    clearCompletedTodoList();
  }, false);

  var toggleAll = $('.toggle-all');
  toggleAll.addEventListener('change', function () {
    toggleAllTodoList();
  }, false);

  var filters = $All('.filters li a');
  for (var i = 0; i < filters.length; ++i) {
    (function (filter) {
      filter.addEventListener('click', function () {
        for (var j = 0; j < filters.length; ++j) {
          filters[j].classList.remove('selected');
        }
        filter.classList.add('selected');
        update();
      }, false);
    })(filters[i])
  }

  update();


};

