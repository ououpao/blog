## 背景
Facebook的开发者当时在开发一个广告系统，因为对当前所有的MVC框架不满意，所以就自己写了一个UI框架，于是就有了React。后来因为觉得实在是好用，所以在2013年月份开源的此框架。经过这几年的沉淀，React越来越强大，也受到了越来越多的开发者喜爱。

## 特性 
**声明式的：** `React `可以让你更轻松地创建用户界面。为你的应用的每个状态设计一个简单的Ui, 当你的应用数据改变时，`React`会非常高效地完成界面的更新。声明式的用户界面让你的代码可以预测，易于理解和容易调试。
**基于组件的：** 构建一个独立的组件，它们管理这各自的状态，然后将他们组合在一起构成复杂的用户界面。因为组件逻辑不是使用模板而是使用JavaScript来控制，所以你可以很容易你的应用数据并且保持状态与DOM分离。
**Learn Once, Write Anywhere:** 我们没有限定你的技术栈，所以你可以使用`React`来开发新功能，而不用重写已有的代码。`React`也可以使用`Node`实现服务端渲，还可以使用`React Native` 构建强大的手机应用。

## 价值
在年初的React开发者大会上，React的项目经理Tom Occhino讲述了React的最大的价值，React最大的价值不是`高性能的虚拟DOM`、`封装的事件机制`、`服务器端渲染`，而是`声明式的直观的编码方式`。React号称能让新人第一天开始使用就能开发新功能。简单的编码方式会让新手能很快地上手，同时也`降低了代码维护的成本`。这一特性决定了React能快速引起开发者的兴趣并广泛传播的基础。

## Virtual DOM
传统应用，直接操作DOM：  
![](https://docs.google.com/drawings/d/1sLx_t031l82kP3Gq7547C1sGcQWgIxViPYfxCo-ZJto/pub?w=340&h=205)
[图片来源](http://blog.reverberate.org/2014/02/react-demystified.html)

React应用，操作虚拟DOM：
![](https://docs.google.com/drawings/d/11ugBTwDkqn6p2n5Fkps1p3Elp8ZToIRzXzvM4LJMYaU/pub?w=543&h=229)
[图片来源](http://blog.reverberate.org/2014/02/react-demystified.html)

## Components
React 是基于组件的，组件可以看做是Virtual DOM的节点。声明式的组件简洁优美：  

```java
class Text extends React.Component {
  render() {
    return <p>{this.props.children}</p>;
  }
}
React.render(<Text>Hello World</Text>, document.body);
```

## 组件的生命周期
React组件提供了10个生命周期的API，提供的API越多，组件的可空性，灵活性越强。 
![](http://7rf9ir.com1.z0.glb.clouddn.com/3-3-component-lifecycle.jpg)
[图片来源](http://www.jianshu.com/p/f462b78689f6)

## states & update
页面如何更新？或者组件如何更新？  
React通过调用`setState`方法改变`states`，调用组件的render方法，进行组件的diff，最后最小化更新组件UI。从而实现组件的高效更新。
![](https://docs.google.com/drawings/d/18PZGhVyiHRCX8KX2Jn5XBYIh4hBputrOazI3VRcGsSA/pub?w=616&h=397)
[图片来源](http://blog.reverberate.org/2014/02/react-demystified.html)