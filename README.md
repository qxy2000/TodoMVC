# 手机版TodoMVC
语言：

native HTML，CSS，JS

页面效果图：
页面上方的todo-list添加了动画效果，可通过github pages查看 

<img src="https://github.com/qxy2000/TodoMVC/blob/main/img/total.jpg" width = "300" alt="" align=center />

功能介绍：

#### 1. 基本功能

1. 新增单条todo

2. 删除单条todo

   因为是移动端，将通过鼠标hover后展示的删除按钮来删除改为了通过向左（或向右）活动单条todo来进行删除
   <img src="https://github.com/qxy2000/TodoMVC/blob/main/img/delete.jpg" width = "300" alt="" align=center />

   code：

   ```js
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
   ```

3. 展现todo列表

4. 删除所有已完成todo

5. 通过localStorage保存页面状态，刷新页面后可恢复

   code：

   ```js
   //获取localStorage
   function getStorage(name) {
     return JSON.parse(localStorage.getItem(name))
   }
   
   //设置localStorage
   function setStorage(name, list) {
     localStorage.setItem(name, JSON.stringify(list))
   }
   
   function update(){
     ...
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
   ...
   }
   ```

   

#### 2. 高级功能

1. 按照active， completed和all这三个tag过滤todo

2. 编辑单条todo

3. 为每条todo设置置顶功能，点击置顶之后此条todo将变为红色，且位置移动到所有todo的最上方

   | 设置为置顶                                                   | 取消置顶                                                     |
   | ------------------------------------------------------------ | ------------------------------------------------------------ |
   | <img src="https://github.com/qxy2000/TodoMVC/blob/main/img/top.jpg" width = "300" alt="" align=center /> | <img src="https://github.com/qxy2000/TodoMVC/blob/main/img/canceltop.jpg" width = "300" alt="" align=center /> |

   code:

   ```js
   //绑定置顶事件
     item.querySelector('.stick').addEventListener('click', function () {
       // console.log(this.parentElement.children[1].innerHTML)
       stickTodo(id, this.parentElement.children[1].innerHTML, this.parentElement.lastElementChild.innerHTML);
     }, false);
   
   // 置顶
   function stickTodo(id, msg, startData) {
     //若此条todo已经是置顶状态，则取消置顶
     if ($('#' + id).getAttribute('class') == 'stickLi') {
       $('#' + id).setAttribute('class', '')
     } 
     //若此条todo不是是置顶状态，则置顶
     else {
       removeTodo(id)
       addTodo(msg, id, startData)
       $('#' + id).setAttribute('class', 'stickLi')
     }
     update()
   }
   ```

   

4. 在每条todo旁边显示它从创建开始到现在为止的时间，作为属于本条todo的计时器使用

   code:

   ```js
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
   ```

   

5. 通过右下角的悬浮按钮控制下边栏的显示（下边栏有过滤tag--active， completed和all）

   <img src="https://github.com/qxy2000/TodoMVC/blob/main/img/tag.jpg" width = "300" alt="" align=center />

   code：

   ```js
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
   ```

   

6. 回到顶部按钮，在todo数量较多时，滑到页面下面时会出现一个回到顶部按钮，可以一键回到页面顶部（只有一页时不会显示此按钮）

   Code:

   ```js
     topbtn = $(".uptotop");
     topbtn.addEventListener('click', function () {
       document.body.scrollTop = 0; // For Safari
       document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
     })
   ```

   

开头“todo-list”打字动画效果的css实现：

```css
h1 {
  position: absolute;
  top: -100px;
  width: 50%;
  font-size: 150px;
  font-weight: 100;
  /* text-align: center; */
  margin-left: 15%;
  width: 21ch;
  font: bold 300% Consolas, Monaco, monospace;   /*Monospaced font*/
  overflow: hidden;
  white-space: nowrap;
  border-right: 1px solid transparent;
  animation: typing 10s steps(21), caret .5s steps(1);
}
@keyframes typing{
  from {
      width: 0;
  }
}
@keyframes caret{
  50% { border-right-color: currentColor}
}
```

todo便签效果的css实现：

```css
.todo-list li {
  text-decoration: none;
  position: relative;
  color: #000;
  background: #ffc;
  display: block;
  height: 5em;
  width: 20em;
  padding: 1em;
  margin: 1.5em;
  box-shadow: 5px 5px 7px rgba(33, 33, 33, 0.7);
  transform: rotate(-6deg) perspective(1px) translateZ(0);
  transition: transform 0.15s linear;
}

.todo-list li:nth-child(even) {
  transform: rotate(4deg);
  position: relative;
  top: 5px;
  background: #cfc;
}

.todo-list li:nth-child(odd) {
  transform: rotate(-3deg);
  position: relative;
  top: 5px;
  background: #ccf;
}
```

部署后的作业 html 地址：https://qxy2000.github.io/TodoMVC/

