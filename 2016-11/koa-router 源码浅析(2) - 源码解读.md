> 上一篇主要将koa-router的整体代码结构和大概的执行流程画了出来，画的不够具体。那这篇主要讲koa-router中的几处的关键代码解读一下。

读代码首先要找到入口文件，那几乎所有的`node`模块的入口文件都会在`package.json`文件中的`main`属性指明了。`koa-router`的入口文件就是`lib/router.js`。

### 第三方模块
首先先讲几个第三方的node模块了解一下，因为后面的代码讲解中会用到，不去看具体实现，只要知道其功能就行：  
**koa-compose:**提供给它一个中间件数组， 返回一个顺序执行所有中间件的执行函数。 
**methods：**node中支持的http动词，就是http.METHODS，可以在终端输出看看。  
**path-to-regexp：**将路径字符串转换成强大的正则表达式，还可以输出路径参数。

## Router & Layer
![](https://github.com/callmeJozo/blog/raw/master/assets/imgs/position/koa-router3.png)
`Router` 和 `Layer` 分别是两个构造函数，分别在`router.js` 和 `layer.js`中，`koa-router`的所有代码也就在这两个文件中，可以知道它的代码量并不是很多。  

**Router: 创建管理整个路由模块的实例**
```javascript
function Router(opts) {
  if (!(this instanceof Router)) {
    return new Router(opts);
  }

  this.opts = opts || {};
  this.methods = this.opts.methods || [
    'HEAD',
    'OPTIONS',
    'GET',
    'PUT',
    'PATCH',
    'POST',
    'DELETE'
  ];

  this.params = {};
  this.stack = [];
};
```
首先是
```javascript
if (!(this instanceof Router)) {
  return new Router(opts);
}
```
这是常用的`去new`的方式，所以我们可以在引入koa-router时： 
```javascript
const router = require('koa-router')()
```
而不用：
```javascript
const router = new require('koa-router')() // 这样也是没问题的
```

**this.methods:**  
在后面要讲的`allowedMethods`方法中要用到的，目的是响应`options`请求和请求出错的处理。

**this.params:**   
全局的路由参数处理的中间件组成的对象。

**this.stack:**  
其实就是各个路由(Layer)实例组成的数组。每次处理请求时都需要循环这个数组找到匹配的路由。

**Layer: 创建各个路由实例**

```javascript
function Layer(path, methods, middleware, opts) {
  ...

  this.stack = Array.isArray(middleware) ? middleware : [middleware];

  // 为给后面的allowedMthods处理
  methods.forEach(function(method) {
    var l = this.methods.push(method.toUpperCase());
    if (this.methods[l-1] === 'GET') {
      // 如果是get请求，则支持head请求
      this.methods.unshift('HEAD');
    }
  }, this);

  // 确保路由的每个中间件都是函数
  this.stack.forEach(function(fn) {
    var type = (typeof fn);
    if (type !== 'function') {
      throw new Error(
        methods.toString() + " `" + (this.opts.name || path) +"`: `middleware` "
        + "must be a function, not `" + type + "`"
      );
    }
  }, this);
  this.path = path;
  // 利用path-to-rege模块生产的路径的正则表达式
  this.regexp = pathToRegExp(path, this.paramNames, this.opts);

  ...
};

```
这里的`this.stack`和`Router`中的不同，这里的是路由所有的中间件的数组。（一个路由可以有多个中间件）
## router.register()
**作用：注册路由**

从上一篇的代码结构图中可以看出，`Router`的几个实例方法都直接或简介地调用了`register`方法，可见，它应该是比较核心的函数, 代码不长，我们一行行看一下：  
```javascript
Router.prototype.register = function (path, methods, middleware, opts) {
  opts = opts || {};
  var router = this;

  // 全部路由
  var stack = this.stack;

  // 说明路由的path是支持数组的
  // 如果是数组的话，需要递归调用register来注册路由
  // 因为一个path对应一个路由
  if (Array.isArray(path)) {
    path.forEach(function (p) {
      router.register.call(router, p, methods, middleware, opts);
    });

    return this;
  }

  // 创建路由，路由就是Layer的实例
  // mthods 是路由处理的http方法
  // 最后一个参数对象最终是传给Layer模块中的path-to-regexp模块接口调用的
  var route = new Layer(path, methods, middleware, {
    end: opts.end === false ? opts.end : true,
    name: opts.name,
    sensitive: opts.sensitive || this.opts.sensitive || false,
    strict: opts.strict || this.opts.strict || false,
    prefix: opts.prefix || this.opts.prefix || "",
    ignoreCaptures: opts.ignoreCaptures
  });

  // 处理路径前缀
  if (this.opts.prefix) {
    route.setPrefix(this.opts.prefix);
  }

  // 将全局的路由参数添加到每个路由中
  Object.keys(this.params).forEach(function (param) {
    route.param(param, this.params[param]);
  }, this);

  // 往路由数组中添加新创建的路由
  stack.push(route);

  return route;
};
```
## router.verb()
**verb => get|put|post|patch|delete**   
**作用：注册路由**  

这是`koa-router`提供的直接注册相应http方法的路由，但最终还是会调用`register`方法如：  
```javascript
router.get('/user', function(ctx, next){...})
```
和下面利用`register`方法等价：  
```javascript
router.register('/user', ['get'], [function(ctx, next){...}])
```
可以看到直接使用`router.verb`注册路由会方便很多。来看看代码：  
你会发现`router.js`的代码里并没有`Router.prototype.get`的代码出现，原因是它还依赖了上面提到的`methods`模块来实现。
```javascript
// 这里的methods就是上面的methods模块提供的数组
methods.forEach(function (method) {
  Router.prototype[method] = function (name, path, middleware) {
    var middleware;

    // 这段代码做了两件事：
    // 1.name 参数是可选的，所以要做一些参数置换的处理
    // 2.将所有路由中间件合并成一个数组
    if (typeof path === 'string' || path instanceof RegExp) {
      middleware = Array.prototype.slice.call(arguments, 2);
    } else {
      middleware = Array.prototype.slice.call(arguments, 1);
      path = name;
      name = null;
    }

    // 调用register方法
    this.register(path, [method], middleware, {
      name: name
    });

    return this;
  };
});
```

## router.routes()
**作用：启动路由**  

这是在koa中配置路由的重要一步：  
```javascript
var router = require('koa-router')();
...
app.use(router.routes())
```
就这样，`koa-router`就启动了，所以我们也一定会很好奇这个`routes`函数到底做了什么,但可以肯定`router.routes()`返回了一个中间件函数。
函数体长了一点，简化一下看下整体轮廓：  
```javascript
Router.prototype.routes = Router.prototype.middleware = function () {
  var router = this;
  var dispatch = function dispatch(ctx, next) {
    ...
  }
  dispatch.router = this;
  return dispatch;
};

```
这里形成了一个闭包，在`routes`函数内部返回了一个`dispatch`函数作为中间件。  
接下来看下`dispatch`函数的实现：  
```javascript
var dispatch = function dispatch(ctx, next) {
    var path = router.opts.routerPath || ctx.routerPath || ctx.path;

    // router.match函数内部遍历所有路由（this.stach）,
    // 根据路径和请求方法找到对应的路由
    // 返回的matched对象为： 
    /* 
      var matched = {
        path: [], // 保存了path匹配的路由数组
        pathAndMethod: [], // 保存了path和methods都匹配的路由数组
        route: false // 是否有对应的路由
      };
    */
    var matched = router.match(path, ctx.method);
    var layerChain, layer, i;
    if (ctx.matched) {
      ctx.matched.push.apply(ctx.matched, matched.path);
    } else {
      ctx.matched = matched.path;
    }

    // 如果没有对应的路由，则直接进入下一个中间件
    if (!matched.route) return next();

    // 找到正确的路由的path
    var mostSpecificPath = matched.pathAndMethod[matched.pathAndMethod.length - 1].path;
    ctx._matchedRoute = mostSpecificPath;

    // 使用reduce方法将路由的所有中间件形成一条链
    layerChain = matched.pathAndMethod.reduce(function(memo, layer) {

      // 在每个路由的中间件执行之前，根据参数不同，设置 ctx.captures 和 ctx.params
      // 这就是为什么我们可以直接在中间件函数中直接使用 ctx.params 来读取路由参数信息了
      memo.push(function(ctx, next) {

        // 返回路由的参数的key 
        ctx.captures = layer.captures(path, ctx.captures);

        // 返回参数的key和对应的value组成的对象
        ctx.params = layer.params(path, ctx.captures, ctx.params);

        // 执行下一个中间件
        return next();
      });

      // 将上面另外加的中间件和已有的路由中间件合并到一起
      // 所以最终 layerChain 将会是一个中间件的数组
      return memo.concat(layer.stack);
    }, []);

    // 最后调用上面提到的 compose 模块提供的方法，返回将 layerChain (中间件的数组) 
    // 顺序执行所有中间件的执行函数， 并立即执行。
    return compose(layerChain)(ctx, next);
  };
```

## router.allowMethods()
**作用： 当请求出错时的处理逻辑**  

同样也是koa中配置路由的中一步：  
```javascript
var router = require('koa-router')();
...
app.use(router.routes())
app.use(router.allowMethods())
```
可以看出，该方法也是闭包内返回了中间件函数。我们将代码简化一下：  
```javascript
Router.prototype.allowedMethods = function (options) {
  options = options || {};
  var implemented = this.methods;
  return function allowedMethods(ctx, next) {
    return next().then(function() {
      var allowed = {};

      if (!ctx.status || ctx.status === 404) {
        ...

        if (!~implemented.indexOf(ctx.method)) {
          if (options.throw) {
            ...
          } else {
            ctx.status = 501;
            ctx.set('Allow', allowedArr);
          }
        } else if (allowedArr.length) {
          if (ctx.method === 'OPTIONS') {
            ctx.status = 204;
            ctx.set('Allow', allowedArr);
          } else if (!allowed[ctx.method]) {
            if (options.throw) {
              ...
            } else {
              ctx.status = 405;
              ctx.set('Allow', allowedArr);
            }
          }
        }
      }
    });
  };
};
```
眼尖的同学可能会看到一些`http code` ： `404`, `501`, `204`, `405`    
那这个函数其实就是当所有中间件函数执行完了，并且请求出错了进行相应的处理：  
1. 如果请求的方法koa-router不支持并且没有设置`throw`选项，则返回 `501(未实现)`
2. 如果是`options`请求，则返回 `204(无内容)`
3. 如果请求的方法支持但没有设置`throw`选项，则返回 `405(不允许此方法 )`

## 总结
粗略浅析了这么些，能大概知道了koa-router的工作原理。笔者能力有限，有错误还请指出。