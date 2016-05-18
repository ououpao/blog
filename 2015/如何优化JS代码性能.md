> 本来在那片编写可维护性代码文章后就要总结这篇代码性能文章的，耽搁了几天，本来也是决定每天都要更新一篇文章的，因为以前欠下太多东西没总结，学过的东西没去总结真的很快就忘记了，记录一下在你脑力留下更深的印象，特别是这些可维护性代码，性能什么的，当在你脑子里形成一种习惯了，那你就牛了！这里也要给初学者一个建议：多总结你学过的东西，因为这其实也是在学习新知识！  好，进入我们的主题：如何提高JS代码的性能。

在今天的`web`应用中，应用了大量的`Javascript`，因此代码的执行效率变得尤为重要，也就是性能！为了提高`JS`的性能，我们应该掌握一些基本的性能优化方式，并让它成为我们书写代码的习惯。下面介绍几种优化性能的方式，很多初学者甚至有经验的开发者也会忽略，希望对你有帮助！

1.优化DOM交互
----------

`DOM`与我们的页面紧密相关，浏览器渲染页面也就是在渲染解析后的`DOM`元素，`DOM`操作与交互要消耗大量的时间，因为它们往往需要重新渲染整个页面或者一部分。进一步说，看似细微的一些操作也可能需要花很多时间来执行，因为`DOM`要处理的信息非常多，因此我们应该尽可能地优化与`DOM`相关的操作，加快浏览器对页面的渲染！为什么有些`DOM`操作会影响页面性能，可以查看我写的一些关于浏览器原理的文章：

ok，优化`DOM`操作，我们主要有一些几种方式：

### 1.1 最小化现场更新

什么是`DOM`的现场更新：需要对`DOM`部分已经显示的页面的一部分的显示立即更新。但是，每一个更改，不管是插入单个字符，还是一处整个片段，都有一定的性能惩罚，因为浏览器需要重新计算无数尺寸以进行更新（相关知识请阅读：）。所以，现场更新进行的越多，代码执行所花的时间就越长，反之代码执行越快，如下：
```javascript
var list = document.getElementById('mylist'),
   item,
   i;
for(i = 0; i < 10; i++){
    item = document.creatElement('li');
    list.appendChild(item);
    item.appendChild(document.creatTextNode('item' + i));
}
```
这段代码为列表`mylist`添加了`10`个项目，没添加一个项目都要进行2次的现场更新：添加元素和添加文本节点，所以这个操作一个需要完成`20`个现场更新，每个更新都会损失性能，可见这样的代码运行起来是相对缓慢的。

解决的方法是使用文档碎片间接地更改`DOM`元素：
```javascript
var list = document.getElementById('mylist'),
   fragment = document.creatDocumentFragment(),
   item,
   i;
for(i = 0; i < 10; i++){
    item = document.creatElement('li');
    fragment .appendChild(item);
    item.appendChild(document.creatTextNode('item' + i));
}
list.appendChild(fragment);
```

像这样的代码只需进行一次的现场更新。记住，当给`appendChild()`传入文档碎片是，只有文档碎片中的子节点才会被添加到目标元素，碎片本身不会被添加。

现在，你应该明白你用循环直接进行`DOM`节点的增删查改是多么对不起浏览器的事了吧  `(*∩_∩*)′ 。

### 1.2 使用 `innerHTML`

除了上面代码中使用的`creatElement()` 和 `appendChild()`结合的方法创建`DOM`元素之外，还有通过给`innerHTML`赋值来创建。对于小的`DOM`更改而言，两种方法的效率其实差不多，但对于大量的`DOM`节点的更改，后者要比前者快得多！为啥捏？

因为当我们给`innerHTML`赋值时，后台会创建一个`HTML`解析器，然后使用内部的`DOM`调用来创建`DOM`结构，而非基于`Javascript`的`DOM`调用，由于内部方法是编译好的而非解释执行的，所以执行代码的速度要快很多！

用`innerHTML`改写上面的例子：

```javascript
var list = document.getElementById('mylist'),
  html = '', //声明一个空字符串
   i;
for(i = 0; i < 10; i++){
    html += '<li>item' + i + '</li>';
}
list.innerHTML = html; // 这里记得innerHTML后面的HTML四个字母都要大写！
```

这种方式同样也只进行了一次的现场更新，并且性能要比上一种方式要好！虽然在字符串的链接上有点性能损失。

### 1.3 使用事件代理/事件委托

事件处理程序为`web`应用提供交互能力，因此许多开发人员会不分青红皂白地向页面中添加大量的处理程序，有个问题就是一个页面上的事件处理程序数量将直接关系到页面的整体运行性能。为什么捏？

首先，事件处理程序对应至少一个函数，`JS`中每个函数都是对象，都会占用内存，内存中的对象越多，性能就越差。

其次，我们必须事先指定所有事件处理程序，这就导致了`DOM`访问次数增多，会延迟整个页面的交互就绪时间，页面响应用户操作变得相对缓慢。

所以减少事件处理程序同样也可以让我们的页面更牛畅！使用事件委托势在必得啊！

事件委托的原理其实就是事件冒泡，只指定一个事件处理程序就可以管理某一类型操作的所有事件。例如：click事件会一直冒泡到document层次，也就是说我们不必为每个元素添加事件，只需在较高的层次的元素上添加事件处理程序即可，然后利用事件对象（event）的属性或方法去判断当前点击的元素，然后做出相应的响应。这个我就不展开讲了，初学者可以自行查阅[事件冒泡知识][1]。


2.作用域很重要
----------

说到作用域啊就很容易想到作用域链(scope chain)，我们知道要搜索一个变量，所在的执行环境都要沿着这条作用域向上搜索这个变量，作用域链上有很多的变量，那么我们就得遍历，遍历就需要时间啊，而且你越往上查找所需时间越多，如果我们能减少这个时间，我们代码执行效率不是可以提高了吗？

好聪明啊，ok，我看看有哪些方式可以减少这个时间：

### 2.1 避免全局查找

这是性能优化的一重点，上面也说了，越往上查找时间越多，也就是说查找`全局变量`和函数比`局部`要多！看代码：
```javascript
function updateUI(){
    var imgs = document.getElementByTagName('img');
    for(var i = 0 ,lng = imgs.length;i < lng;i ++){
        imgss[i].title = document.title + 'image' + i;
    }
    var msg = docuement.getElementById('msg');
    msg.innerHTML = 'update complete.';
}
```

这代码很正常呀！我之前也经常这么做滴。但是我们细心可以发现，这段代码有三处引用了`全局变量document`,如果我们的页面很多图片，那么在`for`循环中的`document`就会被执行上百次，而每次都要需要在作用域链中查找，时间都去哪了，我还没......停！。

我们可以通过在函数中创建一个`局部变量`保存对`document`的引用，这样，我们在函数里任何地方引用`document`都不用跑到`全局变量`去找了。这样就改进了代码的性能，看代码：
```javascript
function updateUI(){
    var doc = document; // 将document保存在局部变量doc中
    var imgs = doc.getElementByTagName('img');
    for(var i = 0 ,lng = imgs.length;i < lng;i ++){
        imgss[i].title = doc.title + 'image' + i;
    }
    var msg = doc.getElementById('msg');
    msg.innerHTML = 'update complete.';
}
```

所以啊，我们在开发中，如果在函数中会经常用到`全局变量`，把它保存在`局部变量`中！

### 2.2 避免使用with语句

用with语句延长了作用域，查找变量同样费时间，这个我们一般不会用到，所以不展开了。解决方法还是和上面的例子一样，将`全局变量`保存在`局部变量`中！

3.优化循环
----------

`循环`在编程中可谓家常便饭，在js中也随处可见，循环体会反复地执行同一段代码，执行时间一直累加，所以能够对循环体的代码进行优化也可以大大减少执行时间！如何优化？四种方式。

### 3.1 减值迭代
我们写迭代器(循环条件)的时候一般都这样`(var i = 0;i < 10;i ++)`,从0开始，增加到某个特定值。然而在很多情况下，如果在循环中使用减值迭代器效率更高。我测试了下，如果循环体不复杂的话，两者差不多！
```javascript
//增值迭代 --效率较低
for(var i = 0;i < items.length;i++){
   doSomething(items[i]); 
}
//减值迭代 --效率较高
for(var i = items.length - 1;i >= 0;i--){
   doSomething(items[i]); 
}
```

### 3.2 简化终止条件

由于每次循环都会计算终止条件，所以必须保证它的执行尽可能地块。这里主要是避免其他DOM元素及其属性的的查找。
   
```javascript
 //看终止条件，每次循环都需要查询items及其length属性
for(var i = 0;i < items.length;i++){
   doSomething(items[i]); 
}

//将items.length的值保存在局部变量lng中。
for(var i = 0,lng = items.length;i < lng;i++){
   doSomething(items[i]); 
}
```

### 3.3 简化循环体

原因和上面以上的，所以在循环体内避免大量的密集的操作。

这其实和上面讲的：1.1 最小化现场更新 。是一样的优化方式。可以倒回去看看。

4.基本的算法优化
----------

在计算机中，算法的复杂度用O表示。下面是javascript中几种常见的算法类型：

1. O(1)    ：常数，不管有多少值，执行的时间都是恒定的，比如简单值和存储在变量中的值。
2. O(log n)：对数，总的执行时间和数量有关，但不一定要获取每一个值，如：二分法查找
3. O(n)    ：线性，总执行时间和数量直接相关，如：遍历
4. O(n*n)  ：平方，总执行时间和数量有关，每个值至少获取N次，如：插入排序

ok，有了上面的知识，我们就可以对javascript进行一些算法上的优化了。看代码：
```javascript
var value = 5;
var sum = value + 10;
alert(sum);
```

这段代码进行了4次常量值的查找：数字5，变量value，数字10，变量sum，这段代码的算法复杂度就是O(1)。又如：
```javascript
var value = [10,5];
var sum = value[0] + value[1];
alert(sum);
```

在javascript中访问数组元素也是一个O(1)操作，和简单的变量查找效率一样。再看：
```javascript
var value = {one:10,two:10};
var sum = value.one + value.two;
alert(sum);
```

要表达的是访问对象上的属性要比访问数组和变量的效率低。因为这是一个O(n)操作。你需要在对象的原型链中查找该属性，所花时间较多。

好了，看完这个是不是感觉眼前一片光明啊。其实我们前面所讲的要把经常用到的全局属性保存在一个局部变量中就是根据这个原理了，访问全局属性是一个O(n)的操作，而访问变量是一个O(1)的操作，大声告诉我，挖掘机哪家强啊！

5.最小化语句数
----------
前面讲的优化差不多都是和精简优化语句有关的，是的，我觉得代码的质量和数量就是性能的评判标准。前面讲了一些代码质量相关的优化，这里就讲讲代码数量的优化。

### 5.1 精简变量声明
```javascript
//用了5条语句声明5个变量
var count = 5;
var color = 'red';
var values = [1,2,3];
var now = new Date();

//用了1条语句声明5个变量,注意每个变量用逗号隔开
var count = 5,
    color = 'red',
    values = [1,2,3],
    now = new Date();
 
```

### 5.2 使用数组和对象字面量
```javascript
// 创建两个对象-不好的方式
//one 四条语句
var values = new Array();
values[0] = 123;
values[1] = 456;
values[2] = 789;
//two 四条语句
var person = new Object();
person.name = 'jozo';
person.age = 21;
person.sayName = function(){
    alert(this.name);
};
// 创建两个对象 ----推荐的方式
//one 1条语句
var values = [123,456,789]
//two 1条语句
var person = {
    name : 'jozo',
    age : 21,
    sayName : function(){
    alert(this.name);
};
```

 

6.其他
----------
写累了，如有不正确的地方请指正哦，还有一些其他的优化，下次文章继续！

  [1]: http://www.360doc.com/content/14/0724/15/13883922_396743210.shtml