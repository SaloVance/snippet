//http://www.alloyteam.com/2013/12/node-js-series-event-agent/

//同步串行调用
var render = function (template, data) {
  _.template(template, data);
};
$.get("template", function (template) {
  // something
  $.get("data", function (data) {
    // something
    $.get("l10n", function (l10n) {
      // something
      render(template, data, l10n);
    });
  });
});

//异步并行调用
var proxy = new EventProxy();
var render = function (template, data, l10n) {
    _.template(template, data);
};
proxy.assign('template', 'data', 'l10n', render);
$.get('template', function (template) { // something 
    proxy.trigger('template', template);
});
$.get('data', function (data) { // something 
    proxy.trigger('data', data);
});
$.get('l10n', function (l10n) { // something 
    proxy.trigger('l10n', l10n);
});

//assign source
var _assign = function (eventname1, eventname2, cb, once) {
    var proxy = this, length, index = 0, argsLength = arguments.length,
        bind, _all,
        callback, events, isOnce, times = 0, flag = {};

    // Check the arguments length.
    if (argsLength < 3) {
        //由于参数列表的最后两项分别是回调函数
        //和是否只进行一次监听的标识位，因此加上要监听一事件，
        //所以参数列表的长度至少是3位或者3位以上，否则直接返回。
        return this;
    }

    //获取所有要进行监听的事件名
    events = Array.prototype.slice.apply(arguments, [0, argsLength - 2]);
    //获取回调函数
    callback = arguments[argsLength - 2];
    //获取监听标识位
    isOnce = arguments[argsLength - 1];

    // Check the callback type.
    if (typeof callback !== "function") {
        return this;
    }

    length = events.length;
    //bind函数是关键，主要用于各个需要监听的事件绑定到一个指定函数里，主要通过
    //method指定的方法进行事件的绑定（once或者bind函数），同时在function(data){...}
    //函数里对将传递过来的参数记录下来，以便之后传递给回调函数，并且在这个函数里地相应事件的触发
    //进行计数，以便在所有监听的事件都触发后，对callback函数进行回调，见下文
    bind = function (key) {
        var method = isOnce ? "once" : "bind";
        //proxy[method]事实就是指eventproxy模块上下文的bind和once事件，进行相应的绑定操作
        proxy[method](key, function (data) {
            proxy._fired[key] = proxy._fired[key] || {};
            //对相应事件传递过来的实参进行记录
            proxy._fired[key].data = data;
            if (!flag[key]) {
                flag[key] = true;
                //times用于对触发相应事件时完成对其的计数功能
                times++;
            }
        });
    };

    for (index = 0; index < length; index++) {
        //依次对监听的事件进行绑定，使用上面的bind函数（注意不是上下文的bind函数）
        bind(events[index]);
    }

    _all = function () {
        if (times < length) {
            //这里是重点，作用是为了判断是否所有的监听事件都已经完成了触发动作（可以通过emit事件）
            //，如果还有未触发的事件，则跳出当前函数，也就放弃了对回调函数的调用过程，理解这点对
            //assign函数的原理也就差不多理清楚了
            return;
        }
        var data = [];
        for (index = 0; index < length; index++) {
            //获取所有监听事件所传递过来的实参，以便给回调函数使用
            data.push(proxy._fired[events[index]].data);
        }
        if (isOnce) {
            //当isOnce为true时，则将all事件进行去除绑定，那么回调函数也只会在
            //所有监听事件触发完成后被调用一次，此后便不会再进行回调。
            //相反，如果当isOnce为false时，则在所有监听事件触发完成之后的时间里，
            //只要触发任意的监听函数都会对回调函数进行回调调用。这也就assign和assignAll的本质差异！！！
            proxy.unbind("all", _all);
        }
        //对回调函数进行回调(需要理解javascript的apply或者cal方法的使用）
        callback.apply(null, data);
    };
    //对_all事件进行绑定，以便能够正确对回调函数进行回调
    proxy.bind("all", _all);
};