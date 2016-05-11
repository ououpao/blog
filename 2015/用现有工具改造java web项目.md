# 背景
过年回来接手了公司的’半死不活‘的项目，前端人员都不敢去碰，没人管，只能自己主动上了，还能练练手。项目用后台用java，强制给我装了个`eclipse`,（话说以前也是因为看着这编辑器蛋疼而选择了去学C#, 哈哈）。虽然页面渲染交给了前端，但前端代码和后端代码放了在一块，反正我是把前端代码拉出来在sublime修改了，每次改动，即使是一小点点，也要回'eclipse'按个F5, 等个好几秒，再回浏览器刷新浏览器，等个好几秒，一天下来，感觉手都要炸了，心想死都要摆脱用’eclipse'来进行前端开发；来看看现有项目的目录结构：  

![](http://7xsiri.com2.z0.glb.clouddn.com/java-web1.png)

可以看到，前端代码放在了`webcontent`目录下，全部的html页面放在了`web-info`文件夹下（居然还有几个jsp页面），以前端项目结构的习惯，这`css`,`js`,`img`是不是和`html`文件隔了几条街啊，见个面多难啊！
# 开始改造
上面说了几个痛点：
a. 前后端代码放一块，得和后端代码一起运行；
b. 得用`eclipse`；
c. 开发效率慢；
d. 项目结构混乱；  
那么我就先搞定这几个痛点先：  
对于a, 毋庸置疑，把前端代码从现有的项目抽离出来，迭代开发完成之后打包到svn/git，让后端去部署前端代码；  
对于b, 在解决a的基础这些都不是事，sublime，atom，vscode这些对前端开发有好的ide随你选了。  
对于c, 效率慢主要是靠手动刷新的次数比较多，这时候前端自动化工具该上场了，那么现在可以选的有grunt,gulp,webpack等，结合项目实际，这里选择gulp；  
对于d, 项目结构对一个项目是很重要的，这个要在项目的起始阶段就应该预估好该选用什么样的项目结构；
### 目录结构
![](http://7xsiri.com2.z0.glb.clouddn.com/java-web2.png) 

app目录：开发代码
dist目录：打包压缩的代码
build目录：构建工具配置文件
再看app/assets目录： 

![](http://7xsiri.com2.z0.glb.clouddn.com/java-web3.png)

由于html文件全部用[gulp-swig][1]插件来写，存放在template目录下，编译后输出到app根目录下；
### 使用gulp构建工作流
那么主要到下面这几个gulp插件：  
[gulp-connect][2]: 用于启动一个静态服务器，设置代理等；  
[gulp-ruby-sass][3]: 用于编译sass, 使用compass；
[gulp-swig][4]：用于编译html模板；
[connect-history-api-fallback][5]: 这里主要用于改写url;  

来看看gulpfile的大概配置：  

![](http://7xsiri.com2.z0.glb.clouddn.com/java-web4.png)

这里主要配置开发时自动刷新的静态'watch'和打包时build静态文件；


# 总结
---
总算是把前端代码抽离了，静态服务器，自动化，打包也跑起来了，但还是不够完善。
这是带领项目刨坑的第一步，后面会继续奔着前端工程化/组件化的目标改进；

[1]:https://www.npmjs.com/package/gulp-swig
[2]:https://www.npmjs.com/package/gulp-connect
[3]:https://www.npmjs.com/package/gulp-ruby-sass
[4]:https://www.npmjs.com/package/gulp-swig
[5]:https://www.npmjs.com/package/connect-history-api-fallback