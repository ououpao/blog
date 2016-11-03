> [原文链接](https://developers.google.com/web/fundamentals/getting-started/primers/async-functions?utm_source=javascriptweekly&utm_medium=email)
> 
> 另，断断续续翻译了好几天，在发表的时候去搜索了下有没人翻译了，因为这确实是篇好文章。还真有：[文章链接](http://www.zcfy.cc/article/async-functions-making-promises-friendly-1566.html?hmsr=toutiao.io&utm_medium=toutiao.io&utm_source=toutiao.io)，看了下，这篇翻译的专业些，大家可以去看看。

Async 函数是一个非常了不起的东西，它将会在`Chrome 55`中得到默认支持。它允许你书写基于`promise`的代码，但它看起来就跟同步的代码一样，而且不会阻塞主线程。所以，它让你的异步代码看起来并没有那么"聪明"却更具有可读性。   

Async 函数的代码示例：  
```javascript
async function myFirstAsyncFunction() {
  try {
    const fulfilledValue = await promise;
  }
  catch (rejectedValue) {
    // …
  }
}
```

如果你在一个函数声明的的前面使用`async`关键字，那你就可以在这个函数内使用`await`。当你去`await`一个`promise`的时候，这个函数将会以非阻塞的方式暂停，直到`promise`处于`settled`状态。如果这个`Promise`返回的是成功的状态，你将会得到返回值，如果返回的是失败的状态，那失败的信息将会被抛出。

> :star: 提示: 如果你对`promises`不熟悉，请查看我们的[promises指南](https://developers.google.com/web/fundamentals/getting-started/primers/promises)

### 示例1： 打印响应信息

假设我们想要请求一个URL然后把响应信息打印出来，下面是使用`promise`的示例代码：  
```javascript
function logFetch(url) {
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      console.log(text);
    }).catch(err => {
      console.error('fetch failed', err);
    });
}
```

下面用`async` 函数来实现同样的功能：  
```javascript
async function logFetch(url) {
  try {
    const response = await fetch(url);
    console.log(await response.text());
  }
  catch (err) {
    console.log('fetch failed', err);
  }
}
```

可以看到代码行数和上例一样，但是使用`async`函数的方式使得所有的回调函数都不见了！这让我们的代码非常容易阅读，特别是那些对`promise`不是特别熟悉的同学。

> :star: 提示: 你`await`的任何值都是通过`Promise.resolve()`来传递的，所以你可以安全地使用非本地的`promise`.

### Async 函数的返回值

不管你是否在函数内部使用了`await`, `Async` 函数总是返回一个`promise` 。当 `async`函数显示滴返回任意值时,返回的`promise`将会调用`resolve`方法, 当`async`函数抛出异常错误时，返回的`promise`将会调用`reject`方法，所以：   
```javascript
// wait ms milliseconds
function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function hello() {
  await wait(500);
  return 'world';
}
```
当执行`hello()`时，返回一个成功状态，并且传递的值为`world`的`promise`.
```javascript
async function foo() {
  await wait(500);
  throw Error('bar');
}
```
当执行`hello()`时，返回一个失败状态，并且传递的值为`Error('bar')`的`promise`.

### 示例2： 响应流

在更复杂点的案例中, `async`函数更能体现其优越性。假设我们想要在记录`chunks`数据时将其变成响应流， 并返回最终的信息长度。  

> :star: 提示: "记录`chunks`" 让我感觉很别扭.

下面是使用`promise`的方式：  

```javascript
function getResponseSize(url) {
  return fetch(url).then(response => {
    const reader = response.body.getReader();
    let total = 0;

    return reader.read().then(function processResult(result) {
      if (result.done) return total;

      const value = result.value;
      total += value.length;
      console.log('Received chunk', value);

      return reader.read().then(processResult);
    })
  });
}
```

看清楚了，我是 promise “地下党” Jake Archibald。看到我是怎样在它内部调用 processResult 并建立异步循环的了吗？这样写让我觉得自己“很聪明”。但是正如大多数“聪明的”代码一样，你不得不盯着它看很久才能搞清楚它在做什么，就像九十年代的那些魔眼照片一样。[引用](http://www.zcfy.cc/article/async-functions-making-promises-friendly-1566.html?hmsr=toutiao.io&utm_medium=toutiao.io&utm_source=toutiao.io)

让我们用`async`函数来重写上面的功能：  
```javascript
async function getResponseSize(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  let result = await reader.read();
  let total = 0;

  while (!result.done) {
    const value = result.value;
    total += value.length;
    console.log('Received chunk', value);
    // get the next result
    result = await reader.read();
  }

  return total;
}
```

所有的"聪明"的代码都不见了。现在新的异步循环使用了可靠的，看起来普通的`while`循环来代替，这使我感觉非常的整洁。更多的是，在将来，我们将会使用[async iterators](https://github.com/tc39/proposal-async-iteration),它将会使用`for of`循环来代替`while`循环，那这讲会变得更加整洁！

> :star: 提示:  我对`streams`比较有好感。如果你对`streams`不太熟悉，可以看看我的[指南](https://jakearchibald.com/2016/streams-ftw/#streams-the-fetch-api)

### Async 函数的其他语法

我们已经看过了`async function() {} `的使用方式，但是`async`关键字还可以用于其他的函数语法中。

##### 箭头函数
```javascript
// map some URLs to json-promises
const jsonPromises = urls.map(async url => {
  const response = await fetch(url);
  return response.json();
});
```

> :star: 提示: ` array.map(func)`不会在乎你给的是否是`async`函数，它只会把它当做一个返回值是`promise`的普通函数。所以，第二个回调的执行并不会等待第一个回调中的`await`处理完成。

##### 对象方法
```javascript
const storage = {
  async getAvatar(name) {
    const cache = await caches.open('avatars');
    return cache.match(`/avatars/${name}.jpg`);
  }
};

storage.getAvatar('jaffathecake').then(…);
```

##### 类方法
```javascript
class Storage {
  constructor() {
    this.cachePromise = caches.open('avatars');
  }

  async getAvatar(name) {
    const cache = await this.cachePromise;
    return cache.match(`/avatars/${name}.jpg`);
  }
}

const storage = new Storage();
storage.getAvatar('jaffathecake').then(…);
```

> :star: 提示: 类的 `constructors`和`getters/settings`不能是 `async` 函数。 

### 注意！请避免太过强调顺序

尽管你正在写的代码看起来是同步的，但请确保你没有错失并行处理的机会。

```javascript
async function series() {
  await wait(500);
  await wait(500);
  return "done!";
}
```

上面的代码需要 `1000ms`才能完成，然而：

 ```javascript
 async function parallel() {
  const wait1 = wait(500);
  const wait2 = wait(500);
  await wait1;
  await wait2;
  return "done!";
}
 ```
上面的代码只需要`500ms`，因为两个`wait`在同一时间处理了。

### 示例3： 顺序输出请求信息

假设我们想要获取一系列的URL响应信息，并将它们尽可能快的按正确的顺序打印出来。  
深呼吸....下面就是使用`promise`来实现的代码：  

```javascript
function logInOrder(urls) {
  // fetch all the URLs
  const textPromises = urls.map(url => {
    return fetch(url).then(response => response.text());
  });

  // log them in order
  textPromises.reduce((chain, textPromise) => {
    return chain.then(() => textPromise)
      .then(text => console.log(text));
  }, Promise.resolve());
}
```

Yeah, 这达到了目的。我正在用`reduce`来处理一串的`promise`，我太"聪明"了。这是一个如此"聪明"的代码，但我们最好不要这样做。

但是，当把上面的代码转换成使用 `async`函数来实现时，它看起来太有顺序了，以至于会使我们很迷惑：  

**:-1:  不推荐** - 过于强调先后顺序
```javascript
async function logInOrder(urls) {
  for (const url of urls) {
    const response = await fetch(url);
    console.log(await response.text());
  }
}
```

看起来整洁多了，但是我的第二个请求只有在第一个请求被完全处理完成之后才会发出去，以此类推。这个比上面那个`promise`的实例慢多了。幸好这还有一个中立的方案：  

**:+1:  推荐** - 很好而且并行

```javascript
async function logInOrder(urls) {
  // fetch all the URLs in parallel
  const textPromises = urls.map(async url => {
    const response = await fetch(url);
    return response.text();
  });

  // log them in sequence
  for (const textPromise of textPromises) {
    console.log(await textPromise);
  }
}
```

在这个例子中，全部的url一个接一个被请求和处理，但是那个'聪明的'的`reduce`被标准的，普通的和更具可读性的`for loop` 循环取代了。


### 浏览器兼容性和解决方法
在我写这篇文章时，`Chrome 55`已经默认支持`async` 函数。但是在所有主流浏览器中，它还在开发中：  

* Edge - [In build 14342+ behind a flag](https://developer.microsoft.com/en-us/microsoft-edge/platform/status/asyncfunctions/)
* Firefox - [active development](https://bugzilla.mozilla.org/show_bug.cgi?id=1185106)
* Safari - [active development](https://bugs.webkit.org/show_bug.cgi?id=156147)

#### 解决方法 1：Generators
所有的主流浏览器的最新版本都支持`generators`，如果你正在使用它们，你可以稍稍`polyfill`一下 `async`函数.

`Babel`正可以为你做这些事情，[这里有个通过`Babel REPL`写的示例](https://goo.gl/0Cg1Sq) - 是不是感觉对转换后的代码很熟悉。这个转换机制是[ Babel's es2017 preset](http://babeljs.io/docs/plugins/preset-es2017/)的一部分。

> :star: 提示: `Babel REPL`是一个很有趣的东西，试试吧。

我建议你现在就这样做，因为当你的目标浏览器支持了`async`函数时，你只需要将`Babel`从你的项目中去除即可。但是如果你真的不想使用转换工具，你可以使用[Babel's polyfill](https://gist.github.com/jakearchibald/edbc78f73f7df4f7f3182b3c7e522d25)。

```javascript
async function slowEcho(val) {
  await wait(1000);
  return val;
}
```

当你使用了上面说的[polyfill](https://gist.github.com/jakearchibald/edbc78f73f7df4f7f3182b3c7e522d25),你可以将上面的代码替换为：  
```javascript
const slowEcho = createAsyncFunction(function*(val) {
  yield wait(1000);
  return val;
});
```

注意到你通过给`createAsyncFunction`函数传递了一个`generator` `(function*)`,然后使用`yield` 代替 `await`。除此之外它们的效果一样。

#### 解决方法2： regenerator

如果你想要兼容旧的浏览器，`Babel`同样也能把`generators`给转换了，这样你就可以在IE8以上的浏览器中使用`async`函数，但你需要使用`Babel`的 [es2017 preset](http://babeljs.io/docs/plugins/preset-es2017/)和 [the es2015 preset](http://babeljs.io/docs/plugins/preset-es2015/)

你会看到[转换后的代码](https://goo.gl/jlXboV)并不好看，所以请小心代码膨胀。

### Async all the things!

一旦所有浏览器都支持`async`函数了，请在所有返回值是`promise`的函数上使用`async`！因为它不仅可以使你的代码更`tider`， 而且它确保了`async`函数 总是返回一个 `promise` 。

[回到 2014 年](https://jakearchibald.com/2014/es7-async-functions/),我对`async`函数的出现感到非常激动, 现在很高兴看到它们在浏览器中被支持了。Whoop!

