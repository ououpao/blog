今天有群友在群里问了为什么给box设置了`position:absolute;`既然box脱离了文档流,box却还是在原来的位置。大概的效果图如下(他还添加了`right:0;`)：  

![](http://7xsiri.com2.z0.glb.clouddn.com/css-position-01.png)  

任何元素在设置了绝对定位都会脱离正常的文档流，心想，既然脱离了文档流应该不受其它元素影响，‘浮’到它最近的设置了定位的父元素的顶部才是啊，可是结合自己的开发情况却发现不是这样的，必须给他设置`top:0;`, 决定定位的元素才会在负元素的顶部，不设置则在原来的位置不变。看来里边一定有其他原理或基础理论没有掌握。隧去查看了[规格书][1]：   

![](http://7xsiri.com2.z0.glb.clouddn.com/css-position-02.png)

可以看到设置了定位元素的top属性的初始默认值为：`auto`, 也就是说刚才群友值设置了：`position：absolute;right:0;`这两个属性，那么`top`的值就是`auto`了，这应该就是问题所在了。  
那`top:auto;`,又是什么一种效果呢？是和`width:auto;`,`margin:auto;`一样的表现吗？在[stackoverflow][2]找到了，里面的答案：  

![](http://7xsiri.com2.z0.glb.clouddn.com/css-position-03.png)

意思就是说定位元素的`top:auto;`位置是该元素在没有脱离文档流前的位置，也就是说如果定位元素没有设置其他属性，该元素定位后的位置就是其没有定位前的位置。这么说就名白了，所以设置了`top:0;`,刚才的box马上就上去了。  

另外：`float:left|right;`也会使元素脱离正常文档流。当元素左浮动或右浮动的时候，元素会向容器的边缘移动，直到碰到容器边缘或其他浮动元素。



[1]:https://www.w3.org/TR/CSS21/visuren.html#position-props
[2]: http://stackoverflow.com/questions/5399708/the-behaviour-of-top-auto-bamboozles-me

