/**
 * 简易版lazy.js
 */
var MAX_ARRAY_LENGTH = 4294967295; // 最大的数组长度
var LAZY_FILTER_FLAG = 1; // filter方法的标记

// 缓存数据结构体
function LazyWrapper(value){
    this.__wrapped__ = value;
    this.__iteratees__ = [];
    this.__takeCount__ = MAX_ARRAY_LENGTH;
}

// 惰性求值的入口
function lazy(value){
    return new LazyWrapper(value);
}

// 根据 筛选方法iteratee 筛选数据
function filter(iteratee){
    this.__iteratees__.push({
        'iteratee': iteratee,
        'type': LAZY_FILTER_FLAG
    });
    return this;
}

// 截取n个数据
function take(n){
    this.__takeCount__ = n;
    return this;
};

// 惰性求值
function lazyValue(){
    var array = this.__wrapped__;
    var length = array.length;
    var resIndex = 0;
    var takeCount = this.__takeCount__;
    var iteratees = this.__iteratees__;
    var iterLength = iteratees.length;
    var index = -1;
    var dir = 1;
    var result = [];

    // 标签语句
    outer:
    while(length-- && resIndex < takeCount){
        // 外层循环待处理的数组
        index += dir;

        var iterIndex = -1;
        var value = array[index];

        while(++iterIndex <　iterLength){
            // 内层循环处理链上的方法
            var data = iteratees[iterIndex];
            var iteratee = data.iteratee;
            var type = data.type;
            var computed = iteratee(value);

            // 处理数据不符合要求的情况
            if(!computed){
                if(type == LAZY_FILTER_FLAG){
                    continue outer;
                }else{
                    break outer;
                }
            }
        }

        // 经过内层循环，符合要求的数据
        result[resIndex++] = value;
    }

    return result;
}

// 绑定方法到原型链上
LazyWrapper.prototype.filter = filter;
LazyWrapper.prototype.take = take;
LazyWrapper.prototype.value = lazyValue;

