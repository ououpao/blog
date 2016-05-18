var _Promise = function() {
    this.callbacks = [];
}
_Promise.prototype = {
    construct: Promise,
    resolve: function(result) {
        this.complete("resolve", result);
    },
    reject: function(result) {
        this.complete("reject", result);
    },
    complete: function(type, result) {
        while (this.callbacks[0]) {
            this.callbacks.shift()[type](result, this);
        }
    },
    then: function(successHandler, failedHandler) {
        this.callbacks.push({
            resolve: successHandler,
            reject: failedHandler
        });
        return this;
    }
}

window.Promise = function(fn){
	if(typeof fn != 'function'){
		throw new TypeError('need a function!')
	}
	var promise = new _Promise();
	fn.call(this, promise);
	return promise;
}

// test
var delay = function(promise) {
    setTimeout(function() {
        promise.resolve('数据1');
    }, 1000);
};

var callback1 = function(re, promise) {
    re = re + '数据2';
    promise.resolve(re);
};
var callback2 = function(re) {
    console.log(re + '数据3');

};
Promise(delay).then(callback1).then(callback2);

// test2
var delay2 = function(promise) {
    setTimeout(function() {
        promise.resolve('数据1');
    }, 5000);
};
var callback3 =  function(){
	console.log('here');
}
Promise(delay2).then(callback3);

