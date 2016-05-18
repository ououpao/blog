ECMA中有两种属性：数据属性和访问器属性；  

* 数据属性：`configurable`, `Enumerable`, `Writable`, `Value`;  
* 访问器属性： `configurable`, `Enumerable`, `Get`, `Set`;

其中 `configurable`, `Enumerable`, `Writable` 的默认值都为`true`;
这些属性是对象的内部属性，无法直接访问，但可以通过以下对象的几种方法进行操作：  

* `Object.defineProperty` ： 修改对象的一个属性的特征值；
* `Object.defineProperties`： 修改对象的多个属性的特征值；
* `Object.getOwnPropertyDescriptor`： 获取属性的特征

### `Object.defineProperty`
该方法接受三个参数： 属性所在的对象， 属性的名字， 属性的描述符对象；
描述符对象包含了数据属性和访问器属性；
例如：

改变`value`
```javascript
var man = {
    name: 'naraku',
    age: 10
};
Object.defineProperty(man, 'name', {
    value: 'naraku666'
})
console.log(man.name); // "naraku666"
```

改变`Writable`
```javascript
Object.defineProperty(man, 'name', {
    writable: false
})
man.name = 'ljs';
console.log(man.name); // "naraku666"; 修改不成功
```

改变`Enumerable`
```javascript
var keys1 = Object.keys(man);
console.log(keys1); // ["name", "age"]
Object.defineProperty(man, 'name', {
    enumerable: false
})
var keys2 = Object.keys(man);
console.log(keys2); // ["age"]
```

改变`configurable`
```javascript
Object.defineProperty(man, 'name', {
    configurable: false
})
delete man.name;
console.log(man.name); // "naraku666"; 修改不成功
```

当`configurable`为false时不可再更改
```javascript
// 设置为false
Object.defineProperty(man, 'name', {
    configurable: false
})
// 再次设置为true
Object.defineProperty(man, 'name', {
    configurable: true
}) // 报错

```

### getter & setter
在读取访问器属性时，会调用getter函数，并返回有效的值； 在写入访问器属性时，会调用setter函数传入新值， 并负责处理数据；  
```javascript
var man = {
    _name: 'naraku',
    age: 22
};
Object.defineProperty(man, 'name', {
    get: function(){
        console.log('set');
        return this._name + '666';
    },
    set: function(newValue){
        console.log('set')
        this._name = newValue + '666';
    }
});
console.log(man.name); // 'naraku666'
man.name = 'naraku'; // 此时 man.name 为 ‘naraku666'
console.log(man.name); // 'naraku666666'

```
我一开始比较奇怪，为什么要定义个`name`, 而不是直接操作`_name`;
如下：
```javascript
var man = {
    _name: 'naraku',
    age: 22
};
Object.defineProperty(man, '_name', {
    get: function(){
        console.log('set');
        return this._name + '666';
    },
    set: function(newValue){
        console.log('set')
        this._name = newValue + '666';
    }
});
console.log(man._name); // 报错

```
为什么会报错呢？ 看两个表达式：  
1. `console.log(man._name);` 这里访问man的_name属性，所以这里会调用get方法；
2. `return this._name + '666';` 这里也访问man的_name属性，也会调用get方法，这就造成了死循环，导致堆栈溢出； 
所以当改变访问器属性时不能直接修改对象已有的属性的描述符， 而应该定义一个其他的属性，间接修改对象的属性，就如上面的第一个；

但是如果你在get函数里访问man的_name属性则都可以；

注意：不能同时定义get/set 和 vlaue的特征值；

### `Object.defineProperties`
该方法接受两个参数对象，第一个参数对象是要添加或修改的对象，第二个参数对象是要修改的属性的和属性的描述符构成的对象；  
```javascript
var man = {
    _name: 'naraku'
};
Object.defineProperties(man, {
    name: {
        get: function(){

        },
        set: function(){

        }
    },
    age: {
        value: 22
    }
});
console.log(man); // {_name: "naraku", age: 22}
```

### `Object.getOwnPropertyDescriptor`
该方法接受两个参数：属性所在的对象和要读取的其描述符的属性名称， 返回值是一个对象；
```javascript
var man = {
    _name: 'naraku'
};
Object.defineProperties(man, {
    name: {
        get: function(){

        },
        set: function(){

        }
    },
    age: {
        value: 22
    }
});
Object.getOwnPropertyDescriptor(man, 'name'); 
```
![][1]
你会看到为什么`enumerable`， `configurable`都为false；  

再来看看`_name`的特征对象：  
```javascript
Object.getOwnPropertyDescriptor(man, '_name')
```
![][2]
可以看到都是true;

`_name` 的特征值都为true，因为前面说过`configurable`, `Enumerable`, `Writable` 的默认值都为`true`;

但是，如果使用Object.defineProperty给对象新增一个属性但是没有指定`configurable`, `Enumerable`, `Writable`的话，那这几个值都为false;

[1]: https://github.com/callmeJozo/blog/raw/master/assets/imgs/descriptor.png
[2]: https://github.com/callmeJozo/blog/raw/master/assets/imgs/descriptor2.png