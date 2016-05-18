> `Ajax`是一种能够向服务器请求额外的数据而无需卸载页面(无刷新)的技术，是对`Asynchronous Javascript + XML`的简写，因其良好的用户体验，现已成为web不可或缺的技术。我们所熟知的`Jquery`的封装的`ajax`方法，也是通过这种技术实现的。

1. 没有 XHR 对象之前我们怎么实现 Ajax
----------
在XHR出现之前，Ajax式的通信必须借助一些hack手段来实现，大多数是使用隐藏的框架或内联框架，还可以使用script标签和img标签；

`<iframe> :` iframe元素还是挺强大的，我们首先需要把发送给web服务器的数据编码到URL中，如：`pages/index.html?name='jozo'&age=22,`然后设置iframe的src属性为该URL，服务器能创建一个包含响应内容的HTML文档，那么我们就可以把响应信息保存在该文档中返回web浏览器。这样实现的话，需要让iframe元素对用户不可见，可以通过CSS来隐藏它。

`<script>:` script标签的src属性也能发起HTTP GET请求，而且它可以跨域通信而不受同源策略的限制。通过这种方式交互时，服务器的响应需要采用JSON编码的数据格式，并用一个指定的回调函数名包裹需要返回的数据：`callBack({"name":"jozo","age":22})`,这个包裹的响应会成为script标签的里的内容来执行，就相当于执行了`callBack()`这个函数，所以在web端需要定义一个同名函数。这个就是JSONP跨域，详细请自行查阅。

`<img>:`img标签同样也是利用src属性发起的HTTP GET 请求，但它的功能没有上面两者的全，因为它只能实现单向的通信，只能由客户端发送数据到服务器，服务器则响应对应的图片，而我们无法轻易从图片中获取数据，而且这个图片必须不可见，比如透明的1x1PX的图片。

2. XHR 对象
----------


Ajax技术的核心是`XMLHttpRequest`对象，XHR为向服务器发送请求和解析服务器响应提供了流畅的接口，能以异步的方式从服务器取得更多的信息，意味着用户单击后，可以不必刷新页面也能取得数据。这个单词包含`XML,Http,Rquest`,的确，ajax与这三者都有关系 ：

 - `XML` ：可作为ajax交互数据的数据类型，当然也不仅局限于xml，像我们所知的`json,jsonp,html,script,text`都可以作为数据类型。
 
 - `http` : 使用ajax技术其实就是通过发送HTTP请求和接收响应的来达到目的。可以通过配置发送请求头信息来使服务器做出相应的响应。

 - `request` ：说宽泛一些就是request和response，请求和响应，get请求，post请求，然后操作响应信息。

下面来看下具体的XHR对象有哪些属性和方法。

3. XHR 对象的属性和方法
----------

**属性：**

1. `readyState`：HTTP 请求的状态
2. `responseText`：响应体（不包括头部）
3. `responseXML`：对请求的响应，解析为 XML 并作为 Document 对象返回。
4. `status`：由服务器返回的 HTTP 状态代码，如 200 表示成功
5. `statusText`：这个属性用名称而不是数字指定了请求的 HTTP 的状态代码。也就是说，当状态为 200 的时候它是 "OK"，当状态为 404 的时候它是 "Not Found"。

**方法：**

1. `abort()` : 取消当前响应，关闭连接并且结束任何未决的网络活动。
2. `getAllResponseHeaders()`：把 HTTP 响应头部作为未解析的字符串返回。
3. `getResponseHeader()`：返回指定的 HTTP 响应头部的值。
4. `open()`：初始化 HTTP 请求参数，例如 URL 和 HTTP 方法，但是并不发送请求。
5. `send()`：发送 HTTP 请求，使用传递给 open() 方法的参数，以及传递给该方法的可选请求体。
6. `setRequestHeader()`：向一个打开但未发送的请求设置或添加一个 HTTP 请求。


标红的属性和方法都是比较常用的，偷个懒，具体的属性和方法的介绍去 [w3school][1] 看下了哈，⊙▂⊙。

属性和方法都要熟悉掌握才能很好的掌握后面的内容。


4. 跨浏览器的 XHR 对象
----------

IE7之前的浏览器都是不支持原生的XMLHttpRquest对象的，IE5,6中是通过MSXML库中的一个ActiveX对象实现的。《JS高级程序设计》和《JS权威指南》都是通过检测MSXML库中XMLHttp的版本来创建XHR对象的，看起来比较麻烦，我们还是用w3school的吧  o(╯□╰)o：
```javascript
    var xhr = null;
    function createXHR(){
        if (window.XMLHttpRequest){
             // 新浏览器
             xhr = new XMLHttpRequest();
         }else if (window.ActiveXObject){
             // IE5,IE6
             xhr = new ActiveXObject("Microsoft.XMLHTTP");
         }
    }
```
5. 一些细节
----------

1. Ajax技术可以用于 HTTP 和 HTTPS 请求。

2. 我们需要将ajax测试代码部署到服务器上，才能正常工作。但是，在firefox浏览器上测试则不用。

3. 请求的方式除了get,post 外还支持：delete,head,option,put.请求方式名称大小写不敏感。

4. 当我们给请求设置了onreadystatechange事件时，当readyState改变为0或1时可能没有触发这个事件，经过测试，当为0时确实没有触发，为1时触发了，我也不知道为啥  ⊙▂⊙。

5. 如果你获取的表单数据只是用来读取服务器数据，而且表单数据是公开的，那么用get方式的请求吧，因为少量数据的get请求的效率比post快多了。后面可以测试来测试下。

6. HTTP请求的各部分的指定顺序是：请求方法和URL--> 请求头-->请求主体。而且在使用XHR对象的时候，当调用了send()方法才开始启动网络。而XHR API 的设计使每个方法都会写入网络流，所以在send()方法后面定义的事件或属性会被忽略。所以，调用XHR对象的方法要有一定的顺序，比如：在send()方法注册onreadystatechange()事件。




  [1]: http://www.w3school.com.cn/xmldom/dom_http.asp