// -----------------节点属性方法------------------------

// 节点属性
node.childNodes  // 第一级子节点 NodeList对象(动态改变)
node.parentNode  // 节点的直接父节点
node.previousSibling  // 与该节点相邻的前一个节点
node.nextSibling // 与该节点相邻的后一个节点
node.firstChild // 第一个子节点
node.lastChild // 最后一个子节点
node.ownerDocument // 节点所在的文档



// 节点操作方法
node.appendChild(newNode)  // 往nodeChilds最后添加一个节点， 返回新增的节点
node.insertBefore(newNode, referenceNode) // 如果referenceNode==null, 则执行结果与appendChild相同。若不为null,则插入到referenceNode的前面；
node.replaceChild(newNode); 
node.removeChild(newNode); 

node.cloneNode(isDeep) // 创建node副本 isDeep 参数决定是否为深复制； 注意：该方法不会复制javascript属性，如：绑定在节点上的事件处理函数；
node.normalize()

// -----------------文档的属性方法------------------------

// document属性

document.documentElement  // 取得对html引用
document.body  // 取得对body的引用
document.title // 获取/设置文档标题
document.domain // 页面的域名  只能设置为子域名 常用于跨子域通信
document.referrer // 页面来源  不可更改 
document.URL  // 页面的完整URL 不可更改

// 查找元素方法

document.getElementById()
document.getElementsByTagName()
document.getElementByName()
document.getElementsByClassName()
document.querySelector()
document.querySelectorAll()


// 特殊集合

document.anchors // 所有带name属性的 a标签
document.forms // 文档中的所有form标签
document.images // 文档中所有的img标签
document.links // 文档中所有带 href属性的a标签

// -----------------元素属性方法------------------------

// 元素属性

el.id
el.title
el.className
el.tarName/el.nodeName
el.style
el.attributes
el.innerHTML  // heade, html , table, tbody .. 等没有此属性
el.outerHTML

// 元素属性的操作方法

el.getAttribute(property);  // 获取标准属性或自定义属性, 也可以直接访问： el.id  注意：属性名不去分大小写，所以自定义属性名称时也注意不去分大小写; H5: data-xxx
el.setAttribute(property, value); // 设置属性 标准或自定义
el.removeAttribute(property); // 删除属性

// 创建元素

document.createElement();


// documentFragment

1. 不占用资源 
2. 包含可控制的节点
3. 继承了Node类型的所有方法

// 创建

var fragment = document.createDocumentFragment();


H5:
// 子节点
node.childElementCount
node.firstElementChild
node.lastElementChild
node.previousElementSibling
node.nextElementSibling

// className

classList

el.classList.add(className)
el.classList.reomve(className)
el.classList.contains(className)
el.classList.toggle(className)

readyState

1. loading
2. complete


自定义属性

格式： data-xxx
访问： el.dataset.xxx
设置： el.dataset.xxx = value	


位置计算

一，偏移量
el.offsetHeight: 元素在垂直方向占据的空间大小  内容高度 + padding + boder
el.offsetWidth: 元素在水平方向占据的空间大小
el.offsetTop: 元素距离offsetParent的上内边框的距离
el.offsetLeft: 元素距离offsetParent的左内边框的距离

offsetParent属性返回一个对象的引用，这个对象是距离调用offsetParent的元素最近的（在包含层次中最靠近的），并且是已进行过CSS定位的容器元素。 
如果这个容器元素未进行CSS定位, 则offsetParent属性的取值为根元素(在标准兼容模式下为html元素；在怪异呈现模式下为body元素)的引用

精确计算偏移量： 

// left
function getElementOffsetLeft(el){
	var offsetLeft = el.offsetLeft,
		offsetParent = el.offsetParent;
	if(offsetParent != null){
		offsetLeft += offsetParent.offsetLeft;
		offsetParent = offsetParent.offsetParent;
	}
	return offsetLeft;
}

// top
function getElementOffsetTop(el){
	var offsetTop = el.offsetTop,
		offsetParent = el.offsetParent;
	if(offsetParent != null){
		offsetTop += offsetParent.offsetTop;
		offsetParent = offsetParent.offsetParent;
	}
	return offsetTop;
}

二， 元素大小

el.clientWidth: 元素内容及内边距所占空间大小
el.clientHeight

三， 滚动大小

el.scrollLeft: 被隐藏在内容区域左侧的宽度(有横向滚动条时)
el.scrollTop： 被隐藏在内容上边区域的高度(有竖向滚动条时)
el.scrollHeight： 在没有滚动条时，元素高度
el.scrollWidth： 在没有滚动条时，元素宽度
