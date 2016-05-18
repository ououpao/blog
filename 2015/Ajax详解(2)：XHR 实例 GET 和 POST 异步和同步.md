[上一篇文章][5] 我们大概知道了XHR对象是什么东东，也都了解了它的一些属性和方法，那么现在具体来实现一下Ajax技术 和 了解下XHR2对象。

1.实现Ajax
----------

**先来创建个XHR对象的实例：**
```javascript
var xhr = function(){
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }else{
        return new ActiveObject('Micrsorf.XMLHttp');
    }
}();
console.log(xhr.readyState);
```
    
 **先来看个get请**求
```javascript   
xhr.onreadystatechange = function(){
    switch(xhr.readyState){
        case 0 : 
            console.log(0,'未初始化....');
            break;
        case 1 : 
            console.log(1,'请求参数已准备，尚未发送请求...');
            break;
        case 2 : 
            console.log(2,'已经发送请求,尚未接收响应');
            break;
        case 3 : 
            console.log(3,'正在接受部分响应.....');
            data.innerHTML = xhr.responseText;
            break;
        case 4 : 
            console.log(4,'响应全部接受完毕');
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                document.write(xhr.responseText);
            }else{
                document.write('error:' + xhr.status);
            }
            break;
    }
}
xhr.open('get','/products/getProduct?id=1');
xhr.send(null);
```

这里发送了个简单的get异步请求到我本地的web服务器中，然后我们在控制台看下输出：


![][1]



可以看到刚创建完XHR对象后的readyState为0，当readyState为1,2,3,4，时都触发了onreadystatechange事件，而 readyState为0没有触发，readyState为3时触发了两次，为什么这样呢？

为什么为0时没有触发，我们刚创建XHR对象后readyState为0，然后接着执行后面的代码，直到send()方法之前readyState的值都没有发生改变，所以在onreadystatechange事件中检测readyState为0是没有意义的。

readyState为3是触发了两次，其实有些请求不止两次，看你请求的数据量的大小而定，我们增大接收数据来看看：

![][2]

这就好了，既然我们能在readystate为3时获取数据的相关信息，那我们就可以利用这个特性在readystate为3时做一个数据加载进度条变化的效果了，这个讲到XHR2对象的时候来试试。

还有一个就是在发送get请求时，get请求的数据会附在URL之后（就是把数据放置在HTTP协议头中），以?分割URL和传输数据，参数之间以&相连，如：`'/products/getProduct?id=1'`。如果数据是英文字母/数字，原样发送，如果是空格，转换为+，如果是中文/其他字符，则直接把字符串用BASE64加密，得出如：%E4%BD%A0%E5%A5%BD，其中％XX中的XX为该符号以16进制表示的ASCII。

POST把提交的数据则放置在是HTTP包的包体中。


**再来个post请求**

1.先来个简单的表单,注册一个用户

![][3]

2.用Ajax提交数据到服务器
```javascript
var btn = document.getElementById('add');
btn.onclick = function(){
    var tel = document.getElementById('tel').value.toString(),
        pwd = document.getElementById('pwd').value.toString();
    var data =encodeFormData({
        tel : tel,
        pwd : pwd
    }) ;
    xhr.onreadystatechange = function(){
        switch(xhr.readyState){
            case 0 : 
                console.log(0,'未初始化....');
                break;
            case 1 : 
                console.log(1,'请求参数已准备，尚未发送请求...');
                break;
            case 2 : 
                console.log(2,'正在添加....');
                break;
            case 3 : 
                console.log(3,'已接收数据长度：'+xhr.responseText.length );
                break;
            case 4 : 
                console.log(4,'响应全部接受完毕');
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    databox.innerHTML = xhr.responseText;
                }else{
                    databox.innerHTML = 'error:' + xhr.status;
                }
                break;
        }
    }
    xhr.open('post','/member/register');
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
    xhr.send(data);

};
```
那么post请求需要注意两个地方：

**第一：**
```javascript
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
```
表单数据编码格式有一个正式的MIME类型：`pplication/x-www-form-urlencoded`
当使用post方式提交这种顺序表单时，必须设置`Content-Type`请求头为这个值来模仿表单数据的提交。

**第二：**
```javascript
    var data =encodeFormData({
        tel : tel,
        pwd : pwd
    }) ;
```
`HTTP  POST`请求包含一个请求主体，它包含了客户端发送给服务器的数据，比如：

![][4]

这里为了简单直接明文传输了。 这个数据比较少和简单，我们也可以直接修改上面的send()方法发送数据的方式如下：
```javascript
    xhr.send('tel='+tel+'&pwd='+pwd);
```
但是当这个表单数据的比叫多而复杂时，再以这种字符串拼接的方式传递的话比较容易出错，不好维护，所以我们需要封装一个这样的方法帮助我们将我们的数据拼接成这样的格式：
```javascript
function encodeFormData(data){
    if(!data) return '';
    var pairs = [];
    for(var name in data){
        if(!data.hasOwnProperty(name)) continue;
        if(typeof data[name] === 'function') continue;
        var value = data[name].toString();
        name = encodeURIComponent(name.replace('%20','+'));
        value = encodeURIComponent(value.replace('%20','+'));
        pairs.push(name+'='+value);
    }
    return pairs.join('&');
}
```
2.`GET` 还是  `POST`
----------
get还是post，其实这和ajax是没有关系的了，主要还是取决于这两个请求方式的特点：

通过上面的两个ajax的实例，我们可以看出get请求和post请求的一些特点：

**get请求：**

 - GET 请求可被缓存
 - GET 请求保留在浏览器历史记录中
 - GET 请求可被收藏为书签
 - GET 请求不应在处理敏感数据时使用
 - GET 请求有长度限制
 - GET 请求只应当用于取回数据


**post请求：**

 - POST 请求不会被缓存
 - POST 请求不会保留在浏览器历史记录中
 - POST 不能被收藏为书签
 - POST 请求对数据长度没有要求

那，有了这个比较，你应该知道什么时候用get什么时候用post了。

3.异步和同步
----------

ajax默认的都是异步的请求，我们上面的两个实例也是用的异步请求，那没什么不用同步呢？同步和异步有什么特点？


**同步请求：**

`发送器请求-->等待结果-->操作结果-->继续还行后面的代码` ，这是同步请求的大致过程，由于客服端的javascript是单线程的，也就是说我们必须等待结果完全接收完毕之后才能继续执行后面的代码，严格按照步骤一步一步来，它通常会导致整个浏览器的UI阻塞（白屏等），如果连接服务器响应很慢，那么用户浏览器将冻结，用不不能进行其他操作。
如果我们发起一个同步请求，chrome浏览器会给你这样一个警告：`Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check http://xhr.spec.whatwg.org/.` 意思就是同步请求不利于用户体验。


**异步请求：**

发送器请求-->继续还行后面的代码-->响应结果接收完毕了-->操作结果，这是同步请求的大致过程。
可以看到，异步请求在发送请求之后没有等待结果的返回而是继续执行后面的代码，也就是说在结果返回之前用户可以操作其他东西或是看到其他UI，用户体验良好。但是有些情况下我们还是得用同步请求。














  [1]:https://github.com/callmeJozo/blog/raw/master/assets/imgs/ajax1.png 
  [2]:https://github.com/callmeJozo/blog/raw/master/assets/imgs/ajax2.png 
  [3]:https://github.com/callmeJozo/blog/raw/master/assets/imgs/ajax3.png 
  [4]:https://github.com/callmeJozo/blog/raw/master/assets/imgs/ajax4.png 
  [5]: https://github.com/callmeJozo/blog/issues/7