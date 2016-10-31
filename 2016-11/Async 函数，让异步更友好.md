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

### 示例： 记录一个fetch请求

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