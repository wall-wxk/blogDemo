;(function(FUN, undefined){
	'use strict'

	var list = []; // 存储订阅的需要调用的方法

	/**
	* @function 函数转换接口，用于判断函数是否存在命名空间中，有则调用，无则不调用
	* @version {create} 2015-11-30
	* @description
	*		用途：只设计用于延迟加载
	*		示例：Wall.mytext.init(45, false);
	*		调用：Sniffer.run({'base':window, 'name':'Wall.mytext.init'}, 45, false);
				或 Sniffer.run({'base':Wall, 'name':'mytext.init'}, 45, false);
	*		如果不知道参数的个数，不能直接写，可以用apply的方式调用当前方法
	*		示例:  Sniffer.run.apply(window, [ {'name':'Wall.mytext.init'}, 45, false ]);
	**/
	FUN.run = function(){
		if(arguments.length < 1 || typeof arguments[0] != 'object'){
			throw new Error('Sniffer.run 参数错误');
			return;
		}
		
		var name = arguments[0].name, // 函数名 0位为Object类型，方便做扩展
			subscribe = arguments[0].subscribe || false, // 订阅当函数可执行时，调用该函数, true:订阅; false:不订阅
			prompt = arguments[0].prompt || false, // 是否显示提示语(当函数未能执行的时候)
			promptMsg = arguments[0].promptMsg || '功能还在加载中，请稍候', // 函数未能执行提示语
			base = arguments[0].base || window, // 基准对象，函数查找的起点
			
			args = Array.prototype.slice.call(arguments), // 参数列表
			funcArgs = args.slice(1), // 函数的参数列表
			callbackFunc = {}, // 临时存放需要回调的函数
			result; // 检测结果

		result = checkMethod(name, base);
		if(result.success){
			subscribe = false;
			try{
				return result.func.apply(result.func, funcArgs); // apply调整函数的指针指向
			}catch(e){
				(typeof console != 'undefined') && console.log && console.log('错误:name='+ e.name +'; message='+ e.message);
			}
		}else{
			if(prompt){
				// 输出提示语到页面，代码略
			}
		}
		
		//将订阅的函数缓存起来
		if(subscribe){
			callbackFunc.name = name;
			callbackFunc.base = base;
			callbackFunc.args = funcArgs;
			list.push(callbackFunc);
		}
	};
	
	/**
	* @function 触发函数接口，调用已提前订阅的函数
	* @param {object} option -- 需要调用的相关参数
	* @description
	*		用途：只设计用于延迟加载
	*		另外，调用trigger方法的前提是，订阅方法所在js已经加载并解析完毕
	*		不管触发成功与否，都会清除list中对应的项
	**/
	FUN.trigger = function(option){
		if(typeof option !== 'object'){
			throw new Error('Sniffer.trigger 参数错误');
			return;
		}
		
		var funcName = option.name || '', // 函数名
			base = option.base || window, // 基准对象，函数查找的起点
			newList = [], // 用于更新list
			result, // 检测结果
			func, // 存储执行方法的指针
			i, // 遍历list
			param; // 临时存储list[i]
		
		if(funcName.length < 1){
			return;
		}
		
		// 遍历list，执行对应的函数，并将其从缓存池list中删除
		for(i = 0; i < list.length; i++){
			param = list[i];
			if(param.name == funcName){
				result = checkMethod(funcName, base);
				if( result.success ){
					try{
						result.func.apply(result.func, param.args);
					}catch(e){
						(typeof console != 'undefined') && console.log && console.log('错误:name='+ e.name +'; message='+ e.message);
					}
				}
			}else{
				newList.push(param);
			}
		}
		
		list = newList;
	};
	
	/**
	* @function {private} 检测方法是否可用
	* @param {string} funcName -- 方法名***.***.***
	* @param {object} base -- 方法所依附的对象 
	**/
	function checkMethod(funcName, base){
		var methodList = funcName.split('.'), // 方法名list
			readyFunc = base, // 检测合格的函数部分
			result = {
				'success':true,
				'func':function(){}
			}, // 返回的检测结果
			methodName, // 单个方法名
			i;
			
		for(i = 0; i < methodList.length; i++){
			methodName = methodList[i];
			if(methodName in readyFunc){
				readyFunc = readyFunc[methodName];
			}else{
				result.success = false;
				return result;
			}
		}
		
		result.func = readyFunc;
		return result; 
	}
})(window.Sniffer || (window.Sniffer = {}));
