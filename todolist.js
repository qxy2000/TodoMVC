var $ = function (sel) {
  return document.querySelector(sel);
};
var $All = function (sel) {
  return document.querySelectorAll(sel);
};
/**
* 获取localStorage
*/
function getStorage(name) {
  return JSON.parse(localStorage.getItem(name))
}
/**
 * 设置localStorage
 */
function setStorage(name, list) {
  localStorage.setItem(name, JSON.stringify(list))
}

var remove = $('.draggable');

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

var fab = $(".fab")
var fabCtr = $(".fab-ctr")
var nav = $(".nav")
var closebtn = $('.close')
//close click
closebtn.addEventListener('click', function () {
  nav.style.display = "none";
  fab.style.display = "block";
})

var guid = 0;
var CL_COMPLETED = 'completed';
var CL_SELECTED = 'selected';
var CL_EDITING = 'editing';

function update() {
  var items = $All('.todo-list li');
  var filter = $('.filters li a.selected').innerHTML;
  var leftNum = 0;
  var item, i, display;

  for (i = 0; i < items.length; ++i) {
    item = items[i];
    if (!item.classList.contains(CL_COMPLETED)) leftNum++;

    // filters
    display = 'none';
    if (filter === 'All'
      || (filter === 'Active' && !item.classList.contains(CL_COMPLETED))
      || (filter === 'Completed' && item.classList.contains(CL_COMPLETED))) {

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

  /**
   * 把todo保存到localStorage
   */
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

  /**
* 模拟手机端滑动事件
* swipe left/right => 删除单条todo
*/
  let oldTouch, touchObj;
  let isDelete = false;
  item.addEventListener('touchstart', function (event) {
    oldTouch = event.touches[0];
    touchObj = event.currentTarget;
    isDelete = false;
  }, false);
  item.addEventListener('touchmove', function (event) {
    let freshTouch = event.touches[0];
    let verticalOffset = freshTouch.clientY - oldTouch.clientY;

    var horizontalOffset = freshTouch.clientX - oldTouch.clientX;
    touchObj.style.transition = ".2s linear";
    var deviceWidth = 400;

    if (Math.abs(horizontalOffset) < deviceWidth / 3) {     //移动距离过短 不判定为删除
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
    /* 在DOM中和Model中删除该todo */
    if (isDelete && item != null) {
      item.parentNode.removeChild(item);
      // model.data.todos.splice(index, 1);
      // model.flush();
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
  label.addEventListener('click', function () {
    item.classList.add(CL_EDITING);
    console.log("dbclick!")
    var edit = document.createElement('input');
    var finished = false;
    edit.setAttribute('type', 'text');
    edit.setAttribute('class', 'edit');
    edit.setAttribute('value', label.innerHTML);

    function finish() {
      if (finished) return;
      finished = true;
      item.removeChild(edit);
      item.classList.remove(CL_EDITING);
    }

    edit.addEventListener('blur', function () {
      finish();
    }, false);

    edit.addEventListener('keyup', function (ev) {
      if (ev.keyCode === 27) { // Esc
        finish();
      } else if (ev.keyCode === 13) {
        label.innerHTML = this.value;
        finish();
      }
    }, false);

    item.appendChild(edit);
    edit.focus();
    // update();
  }, false);

  item.querySelector('.toggle').addEventListener('change', function () {
    updateTodo(id, this.checked);
  }, false);

  //item.querySelector('.destroy').addEventListener('click', function () {
  //  removeTodo(id);
  //}, false);
  /**
   * 绑定置顶事件
   */
  item.querySelector('.stick').addEventListener('click', function () {
    // console.log(this.parentElement.children[1].innerHTML)
    stickTodo(id, this.parentElement.children[1].innerHTML, this.parentElement.lastElementChild.innerHTML);
  }, false);

  todoList.insertBefore(item, todoList.firstChild);
  /**
   *生成计时器
   */
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
  if (done) item.classList.add(CL_COMPLETED);
  else item.classList.remove(CL_COMPLETED);
  update();
}

function removeTodo(itemId) {
  var todoList = $('.todo-list');
  var item = $('#' + itemId);
  todoList.removeChild(item);
  update();
}

/**
 * 置顶
 */
function stickTodo(id, msg, startData) {
  if ($('#' + id).getAttribute('class') == 'stickLi') {
    $('#' + id).setAttribute('class', '')
  } else {
    removeTodo(id)
    addTodo(msg, id, startData)
    $('#' + id).setAttribute('class', 'stickLi')
  }
  update()
}

function clearCompletedTodoList() {
  var todoList = $('.todo-list');
  var items = todoList.querySelectorAll('li');
  for (var i = items.length - 1; i >= 0; --i) {
    var item = items[i];
    if (item.classList.contains(CL_COMPLETED)) {
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
      if (checked) item.classList.add(CL_COMPLETED);
      else item.classList.remove(CL_COMPLETED);
    }
  }
  update();
}

//   function dragStart(e) {
//     this.style.opacity = '0.4';
//     dragSrcEl = this;
//     e.dataTransfer.effectAllowed = 'move';
//     e.dataTransfer.setData('text/html', this.innerHTML);
//   };

//   function dragEnter(e) {
//     this.classList.add('over');
//   }

//   function dragLeave(e) {
//     e.stopPropagation();
//     this.classList.remove('over');
//   }

//   function dragOver(e) {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = 'move';
//     return false;
//   }

//   function dragDrop(e) {
//     if (dragSrcEl != this) {
//       dragSrcEl.innerHTML = this.innerHTML;
//       this.innerHTML = e.dataTransfer.getData('text/html');
//     }
//     return false;
//   }

//   function dragEnd(e) {
//     var listItens = document.querySelectorAll('.draggable');
//     [].forEach.call(listItens, function(item) {
//       item.classList.remove('over');
//     });
//     this.style.opacity = '1';
//   }

//   function addEventsDragAndDrop(el) {
//     el.addEventListener('dragstart', dragStart, false);
//     el.addEventListener('dragenter', dragEnter, false);
//     el.addEventListener('dragover', dragOver, false);
//     el.addEventListener('dragleave', dragLeave, false);
//     el.addEventListener('drop', dragDrop, false);
//     el.addEventListener('dragend', dragEnd, false);
//   }

// function floatBallBtn() {
//   var floatBtn = $(".floatBtn");
//   //计算小球的宽高floatBtnWidth、floatBtnHeight
//   //计算屏幕的宽高iClientWidth、iClientHeight
//   var floatBtnWidth = floatBtn.offsetWidth;
//   var floatBtnHeight = floatBtn.offsetHeight;
//   var iClientWidth = document.documentElement.clientWidth;
//   var iClientHeight = document.documentElement.clientHeight
//   //oToucheWidth，oToucheHeight分别表示触摸点到小球左边缘和上边缘的距离。
//   var oToucheWidth, oToucheHeight;
//   /* 监听touchstart事件*/
//   floatBtn.addEventListener("touchstart", function (e) {
//     var touches = e.touches[0];
//     /*计算触摸点到小球左边缘距离oToucheWidth和上边缘的距离oToucheHeight*/
//     oToucheWidth = touches.clientX - floatBtn.offsetLeft;
//     oToucheHeight = touches.clientY - floatBtn.offsetTop;
//     document.addEventListener("touchmove", fnDefaultEvent, {
//       passive: false
//     });
//   }, {
//     passive: false
//   })
//   /* 监听touchmove事件*/
//   floatBtn.addEventListener("touchmove", function (e) {
//     var touches = e.touches[0];
//     /*计算小球（左上角为基准）到屏幕左边缘的距离oLeft和上边缘的距离oTop*/
//     var oLeft = touches.clientX - oToucheWidth;
//     var oTop = touches.clientY - oToucheHeight;
//     /* 约束oLeft和oTop的值，使小球始终在屏幕里*/
//     if (oLeft < 0) {
//       oLeft = 0;
//     } else if (oLeft > iClientWidth - floatBtnWidth) {
//       oLeft = (iClientWidth - floatBtnWidth);
//     }
//     if (oTop < 0) {
//       oTop = 0;
//     } else if (oTop > iClientHeight - floatBtnHeight) {
//       oTop = (iClientHeight - floatBtnHeight);
//     }
//     /* 动态设置小球的left，top值*/
//     floatBtn.style.left = oLeft + "px";
//     floatBtn.style.top = oTop + "px";
//   }, {
//     passive: false
//   });
//   /* 监听touchend事件*/
//   floatBtn.addEventListener("touchend", function (e) {
//     document.removeEventListener("touchmove", fnDefaultEvent, {
//       passive: false
//     });
//     var touches = e.touches[0];
//     var oLeft = floatBtn.offsetLeft;
//     /*设置小球吸附边缘效果，小球拖动结束后停在靠近的屏幕边缘*/
//     if (oLeft < iClientWidth / 2 - floatBtnWidth / 2)
//       floatBtn.style.left = 0 + "px";
//     else
//       floatBtn.style.left = iClientWidth - floatBtnWidth + 'px';
//   }, {
//     passive: false
//   });
//   /*阻止默认事件函数*/
//   function fnDefaultEvent(e) {
//     e.preventDefault();
//   }
// }

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

// When the user scrolls down 20px from the top of the document, show the button
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
          filters[j].classList.remove(CL_SELECTED);
        }
        filter.classList.add(CL_SELECTED);
        update();
      }, false);
    })(filters[i])
  }

  update();


};

