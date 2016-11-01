> [原文链接](https://developers.google.com/web/fundamentals/getting-started/primers/async-functions?utm_source=javascriptweekly&utm_medium=email)

Async 函数是一个非常神奇的东西，它将会在Chrome 55中得到默认支持。它允许你书写基于`promise`的代码，但它看起来就跟同步的代码一样，而且不会阻塞线程。所以，它让你的异步代码看起来并没有那么聪明却更具有可读性。   

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

如果你在一个函数的前面使用`async`关键字，那你就可以在这个函数内使用`await`。当你去`await`一个`Promise`的时候，这个函数将会以非阻塞的方式暂停，直到`Promise`处于`settled`状态。如果这个`Promise`返回的是成功的状态，你将会得到返回值，如果返回的是失败的状态，那失败的信息将会被抛出。

### 示例1： 记录一个fetch请求

假设我们想要请求一个URL然后把返回信息打印出来，下面是使用`promise`的示例代码：  
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
当执行`hello()`时，返回一个执行成功并且传递的值为`world`的`promise`.
```javascript
async function foo() {
  await wait(500);
  throw Error('bar');
}
```
当执行`hello()`时，返回一个执行失败并且传递的值为`Error('bar')`的`promise`.

### 示例2： 流式地接收响应数据

在更复杂点的案例中, `async`函数更能体现其优越性。假设我们想要在输出`chunk`数据时处理响应信息， 并返回最终的信息长度。  

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



