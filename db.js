/**
 * @version beta 0.1
 */
(function(_NAME_SPACE) {
    var __NAME_ = '$debugger';
    /**
     * @name tools
     * @class 内部使用的工具类对象, 不直接对外暴露, 但可以通过$debugger.getTools()获取该对象的副本
     */
    //内部所有的函数互相使用必须使用$. 不要使用this. 私有成员的调用在this的情况下被外部获取后使用会有问题
    var $ = {
        /**
         * 获取一个随机整数
         * @name random
         * @function
         * @member tools
         * @param {Number} length 随机数的位数
         * @return {Number} random number
         */
        getRandom: function(length) {
            return Math.floor(Math.random() * Math.pow(10, length));
        },
        /**
         * 按id获取一个dom对象
         * @name $
         * @function
         * @member tools
         * @param {String} id
         * @return {HTMLElement} document element
         * @example $('header')
         */
        $: function(id) {
            return document.getElementById(id);
        },
        _alert: function(text) {
            console.log('Error: ' + text);
        },
        _support: (function() {
            // from jQuery
            var div = document.createElement('div');
            div.style.display = 'none';
            div.innerHTML = "<a href='/a' style='color:red;float:left;opacity:.55;'>a</a>";
            var a = div.getElementsByTagName("a")[0];
            return {
                cssFloat: !!a.style.cssFloat,
                isPC: navigator.platform.indexOf('Win') >= 0
            };
        })(),
        /**
         * 遍历一个对象或数组
         * @name each
         * @function
         * @member tools
         * @param {Array || Object} mess 需要遍历的对象
         * @param {Function} handler 要执行的遍历函数, 接受index/key, value两个参数
         * @example
         *  each([1, 2, 3], function (index, value){
         *      alert(index + ':' + value );
         *  })
         */
        each: function(mess, handler, opt_isAllProperty) {
            var type = $._getObjectType(mess),
                len = 0,
                returnValue = null;
            switch (type) {
                case '[object Array]':
                case '[object HTMLCollection]':
                case '[object NodeList]':
                    len = mess.length;
                    break;
                case '[object Number]':
                    len = mess;
                    mess = {};
                    break;
                case '[object Object]':
                    for (var key in mess) {
                        if (opt_isAllProperty || !mess.hasOwnProperty || mess.hasOwnProperty(key)) {
                            returnValue = handler.call(null, key, mess[key]);
                            if (typeof returnValue !== 'undefined' && returnValue === false) {
                                break;
                            }
                        }
                    }
                    break;
            }
            if (len > 0) {
                for (var i = 0; i < len; i++) {
                    returnValue = handler.call(null, i, mess[i], mess);
                    if (typeof returnValue !== 'undefined' && returnValue === false) {
                        break;
                    }
                }
            }
        },
        /**
         * 根据tagName获取dom对象数组
         * @name $tag
         * @function
         * @member tools
         * @param {String} tagName
         * @param {HTMLElement} content 寻找element的父节点 default body
         * @return {Array} document element 数组
         * @example $tag("div", body.firstChild);
         */
        $tag: function(tagName, content) {
            var tagName = tagName;
            var dom = content;
            if (arguments.length === 1) {
                dom = DOC.body;
            } else if (arguments.length >= 2) {
                if (!dom) {
                    return [];
                }
            }
            var nodeList = dom.getElementsByTagName(tagName);
            var arr = [];
            for (var i = 0, len = nodeList.length; i < len; i++) {
                arr.push(nodeList[i]);
            }
            return arr;
        },
        /**
         * 从某一节点开始寻找上下的其他节点, 建议使用封装的 $nextNode/$prevNode, 本函数直接使用较麻烦
         * @name $nth
         * @function
         * @member tools
         * @param {HTMLElement} elem 寻找节点的起点dom元素
         * @param {Number} result 寻找次数 , 1会返回自己, 2为最邻近节点, 依次累加
         * @param {String} dir 节点寻找方向 'nextSibling' 向下寻找 / 'previousSibling' 向上寻找
         * @return {HTMLElement} 满足条件的节点
         */
        $nth: function(elem, result, dir) {
            // from jQuery
            result = result || 1;
            var num = 0;
            for (; elem; elem = elem[dir]) {
                if (elem.nodeType === 1 && ++num === result) {
                    break;
                }
            }
            return elem;
        },
        /**
         * 由某一节点开始向后寻找最近的兄弟节点
         * @name $nextNode
         * @function
         * @member tools
         * @param {HTMLElement} elem 寻找节点的起点dom元素
         * @return {HTMLElement} 邻近的下一个兄弟节点
         */
        $nextNode: function(elem) {
            return $.$nth(elem, 2, 'nextSibling');
        },
        /**
         * 由某一节点开始向前寻找最近的兄弟节点
         * @name $prevNode
         * @function
         * @member tools
         * @param {HTMLElement} elem 寻找节点的起点dom元素
         * @return {HTMLElement} 邻近的上一个兄弟节点
         */
        $prevNode: function(elem) {
            return $.$nth(elem, 2, 'previousSibling');
        },
        /**
         * 由某一节点开始向后寻找节点, 直至满足参数提供的tagName,并返回该元素
         * @name $nextNodeByTag
         * @function
         * @member tools
         * @param {HTMLElement} elem 寻找节点的起点dom元素
         * @param {String}  tagName 要寻找节点的tagName
         * @return {HTMLElement} 向下寻找的首个满足tagName的节点
         */
        $nextNodeByTag: function(elem, tagName) {
            var num = 0;
            for (; elem; elem = elem.nextSibling) {
                if (elem.nodeType === 1 && elem.tagName.toLowerCase() == tagName) {
                    break;
                }
            }
            return elem;
        },
        createElem: (function() {
            var elemStorage = {};
            return function(tag, id) {
                if (!elemStorage[tag]) {
                    elemStorage[tag] = document.createElement(tag.toUpperCase());
                }
                var c = elemStorage[tag].cloneNode(false);
                if (id) c.id = id;
                return c;
            };
        })(),
        /**
         * 批量设置样式
         * @name setStyle
         * @function
         * @member tools
         * @param {HTMLElement} dom 被设置样式的dom节点
         * @param {Object} cssObject 要设置的样式对象
         * @return {HTMLElement} 被设置样式的dom节点
         * @example
         *  tools.setStyle({
         *     width:'100px',
         *     height:'200px'
         * });
         */
        setStyle: function(dom, cssObject) {
            if (dom) {
                var _style = dom.style;
                for (var k in cssObject) {
                    var value = cssObject[k];
                    if (k == 'float') {
                        k = $._support.cssFloat ? 'cssFloat' : 'styleFloat';
                    }
                    _style[k] = value;
                }
                return dom;
            }
        },
        /**
         *
         * 等待一个状态,当条件为真时,执行另一个函数, 可用于等待一个dom节点出现时的操作,防止由于执行顺序问题导致不可预估的dom操作错误
         * @name waitingFor
         * @function
         * @member tools
         * @param {Function} checkMethod  需要检测的条件
         * @param {Function} doMethod  条件达成时的执行函数
         * @param {number} maxTime  最长等待时间,单位ms, default 3000
         * @param {number} eachTime  条件检测间隔,单位ms, default 100
         * @example
         *  tools.waitingFor(
         *     function(){
         *          return document.getElementById('iAmLate');
         *     },function(){
         *          document.getElementById('iAmLate').innerHTML = 'ok';
         *     }
         *  );
         */
        waitingFor: (function() {
            var _timeStorage = {};
            var _defaultMaxTime = 3000;
            var _defaultEachTime = 100;
            return function(checkMethod, doMethod, maxTime, eachTime) {
                if (checkMethod()) {
                    //如果条件已经达成则直接执行并return
                    doMethod();
                    return;
                }
                maxTime = maxTime || _defaultMaxTime;
                eachTime = eachTime || _defaultEachTime;
                var randomId = Math.floor(Math.random() * 100000);
                var checkFun = function() {
                    //console.log('wait...');
                    if (_timeStorage[randomId].lastTime <= 0) {
                        //尝试时间小于0 直接退出,放弃所有操作
                        clearTimeout(_timeStorage[randomId].id);
                        _timeStorage[randomId] = null;
                        return;
                    }
                    _timeStorage[randomId].tryTime -= eachTime;
                    if (checkMethod()) {
                        doMethod();
                        clearTimeout(_timeStorage[randomId].id);
                        _timeStorage[randomId] = null;
                    } else {
                        _timeStorage[randomId].id = setTimeout(_timeStorage[randomId].fun, eachTime);
                    }
                };
                _timeStorage[randomId] = {};
                _timeStorage[randomId].fun = checkFun;
                _timeStorage[randomId].lastTime = maxTime;
                _timeStorage[randomId].id = setTimeout(_timeStorage[randomId].fun, eachTime);
            };
        })(),
        //浏览器核心判断
        _explorer: (function() {
            var rwebkit = /(webkit)[ \/]([\w.]+)/,
                ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
                rmsie = /(msie) ([\w.]+)/,
                rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;
            var ua = navigator.userAgent.toLowerCase();
            var match = rwebkit.exec(ua) ||
                ropera.exec(ua) ||
                rmsie.exec(ua) ||
                ua.indexOf('compatible') < 0 && rmozilla.exec(ua) || [];
            var key = "";
            switch (match[1]) {
                case 'webkit':
                    key = 'webkit';
                    break;
                case 'opera':
                    key = 'O';
                    break;
                case 'msie':
                    key = 'ms';
                    break;
                case 'mozilla':
                    key = 'Moz';
                    break;
            }
            return {
                type: match[1] || '',
                version: match[2] || '0',
                cssKey: key
            };
        })(),
        _fixEvent: function(src) {
            //仅修正需要的属性
            if (!src.target) {
                src.target = src.srcElement || document;
            }
            return src;
        },
        //兼容移动设备的事件处理
        _mobileEvent: {
            click: 'touchend',
            mousemove: 'touchmove',
            mousedown: 'touchstart',
            mouseup: 'touchend'
        },
        /**
         * 为元素绑定一个事件
         * @name bind
         * @function
         * @member tools
         * @param {HTMLElement} elem 绑定的元素
         * @param {String} eventType 要绑定的事件名称
         * @param {Function}  eventHandler 要设置的事件函数
         * @return {Function} eventHandler 被设置样式的dom节点
         * @example
         *   var handler = tools.bind(elem, 'click', function(){
         *       alert(1);
         *   });
         */
        bind: (function() {
            var e = document.createElement('div');
            if (e.addEventListener) {
                return function(elem, eventType, eventHandler) {
                    eventType = ($._support.isPC || !$._mobileEvent[eventType]) ?
                        eventType : $._mobileEvent[eventType];
                    var _handler = function(e) {
                        var evt = $._fixEvent(e);
                        eventHandler.call(elem, evt);
                        e.preventDefault();
                    }
                    elem.addEventListener(eventType, _handler, false);
                    return _handler;
                };
            } else if (e.attachEvent) {
                return function(elem, eventType, eventHandler) {
                    //兼容移动设备
                    eventType = ($._support.isPC || !$._mobileEvent[eventType]) ?
                        eventType : $._mobileEvent[eventType];
                    var _handler = function(e) {
                        var evt = $._fixEvent(e);
                        eventHandler.call(elem, evt);
                        e.preventDefault();
                    }
                    elem.attachEvent('on' + eventType, _handler);
                    return _handler;
                };
            }
        })(),
        /**
         * 解除元素绑定的事件
         * @name unbind
         * @function
         * @member tools
         * @param {HTMLElement} elem 要取消事件的元素
         * @param {String} eventType 要取消的事件名称
         * @param {Function}  eventHandler 要需要的事件函数,忽略则取消所有事件
         * @example
         *   var handler = tools.bind(elem,'click',function(){
         *       alert(1);
         *   });
         *  tools.unbind(elem,'click', handler);
         */
        unbind: (function() {
            var e = document.createElement('div');
            if (e.removeEventListener) {
                return function(elem, eventType, eventHandler) {
                    eventType = ($._support.isPC || !$._mobileEvent[eventType]) ?
                        eventType : $._mobileEvent[eventType];
                    elem.removeEventListener(eventType, eventHandler, false);
                };
            } else if (e.detachEvent) {
                return function(elem, eventType, eventHandler) {
                    eventType = ($._support.isPC || !$._mobileEvent[eventType]) ?
                        eventType : $._mobileEvent[eventType];
                    elem.detachEvent("on" + eventType, eventHandler);
                };
            }
        })(),
        /**
         * 允许一个元素被拖动
         * @name enableDrag
         * @function
         * @member tools
         * @param {HTMLElement} elem 允许被拖动的元素
         * @param {HTMLElement} actionElem 激活拖动的元素,该元素被鼠标按下时, 会触发elem的移动, 如果忽略则使用elem自身激活自身拖动
         * @param {Object}  opt:
                {dragStartEvent:function(elem, actionElem){},dragEndEvent:function(elem, actionElem){}} 开始拖动和停止拖动时触发
         * @example
         *   tools.enableDrag(div)
         */
        enableDrag: function(elem, actionElem, opt) {
            var draging = false;
            var deltaX, deltaY, dragMoveEvent, dragEndEvent;
            opt = opt || {};
            elem.style.postion = 'absolute';
            var oldMouseStyle = actionElem.style.cursor;
            var dragStart = function(event) {
                actionElem.style.cursor = "move";
                if (event.touches && event.touches.length > 0) {
                    deltaX = event.touches[0].clientX - parseInt(elem.style.left);
                    deltaY = event.touches[0].clientY - parseInt(elem.style.top);
                } else {
                    deltaX = event.clientX - parseInt(elem.style.left);
                    deltaY = event.clientY - parseInt(elem.style.top);
                }
                dragMoveEvent = $.bind(document.body, 'mousemove', dragging);
                dragEndEvent = $.bind(document.body, 'mouseup', dragEnd);
                opt.dragStartEvent && opt.dragStartEvent(elem, actionElem);
            };
            var dragging = function(event) {
                if (!draging) {
                    draging = true;
                    if (event.touches && event.touches.length > 0) {
                        elem.style.top = (event.touches[0].clientY - deltaY) + 'px';
                        elem.style.left = (event.touches[0].clientX - deltaX) + 'px';
                    } else {
                        elem.style.top = (event.clientY - deltaY) + 'px';
                        elem.style.left = (event.clientX - deltaX) + 'px';
                    }
                    event.cancelBubble = true;
                    setTimeout(function() {
                        draging = false;
                    }, 10);
                }
            };
            var dragEnd = function(event) {
                actionElem.style.cursor = oldMouseStyle || 'default';
                $.unbind(document.body, 'mousemove', dragMoveEvent);
                $.unbind(document.body, 'mouseup', dragEndEvent);
                opt.dragEndEvent && opt.dragEndEvent(elem, actionElem);
            };
            $.bind(actionElem || elem, 'mousedown', dragStart);
        },
        _getColor: function(text, type) {
            var color = "";
            switch (type) {
                case '[object Array]':
                    color = "#0000FF";
                    return "<span style='cursor:pointer;font-weight:bold;color:" + color + ";'>" + text + "</span>";
                case '[object Object]':
                    color = "#FF0000";
                    return "<span style='cursor:pointer;font-weight:bold;color:" + color + ";'>" + text + "</span>";
                default:
                    color = "#000000";
                    return "<a style='font-weight:bold;color:" + color + ";'>" + text + "</a>";
            }
            //return "<span style='font-weight:bold;color:" + color + ";'>" + text + "</span>";
        },
        _parseToString: function(object) {
            var type = $._getObjectType(object);
            var result = [];
            switch (type) {
                case '[object Array]':
                    result.push(['<div style="margin-left:20px;"><p style="margin-left:-20px;font-weight:bold;color:blue;">[</p>']);
                    for (var i = 0, n = object.length; i < n; i++) {
                        var item = object[i];
                        var content = "";
                        if (typeof item != 'string' && typeof item != 'number') {
                            item = $._parseToString(item);
                            content = item.content;
                        } else {
                            content = item;
                        }
                        result.push("<div>" + $._getColor(i, item.type) + ":" + content + ",</div>");
                    }
                    result.push(['<p style="margin-left:-20px;font-weight:bold;color:blue;">]</p></div>']);
                    break;
                case '[object Object]':
                    result.push(['<div style="margin-left:20px;"><p style="margin-left:-20px;font-weight:bold;color:red;">{</p>']);
                    for (var key in object) {
                        if (object.hasOwnProperty(key)) {
                            var item = object[key];
                            var content = "";
                            if (typeof item != 'string' && typeof item != 'number') {
                                item = $._parseToString(item);
                                content = item.content;
                            } else {
                                content = item;
                            }
                            result.push("<div>" + $._getColor(key, item.type) + ":" + content + ",</div>");
                        }
                    }
                    result.push(['<p style="margin-left:-20px;font-weight:bold;color:red;">}</p></div>']);
                    break;
                case '[object String]':
                case '[object Number]':
                    result.push(object);
                    break;
                case '[object Null]':
                    result.push('NULL');
                    break;
                default:
                    result.push(type);
            }
            return {
                type: type,
                content: result.join('')
            };
        },
        /**
         * 拷贝对象, 针对复制体的改动不会影响源数据, 仅支持简单数组, 简单对象和dom元素  (一维, 非递归拷贝)
         * @name clone
         * @function
         * @member tools
         * @param {Array || Object || HTMLElement} target 要拷贝的目标
         * @param {Function} exceptCase 可选, 如果有该参数, 则该参数接受两个参数(为clone目标的key & value), 并排除拷贝该函数返回值为false的属性
         * @param {Boolean} hasEvent 是否拷贝事件, 仅对 HTMLElement有效
         * @example
         *   var target = [1,2,3,4,5,6,7,8];
         *   var result = tools.clone(target, function(index, value){
         *      return i > 3 ? false : true;
         *  });
         *  //result = [1, 3, 4, 5]
         */
        clone: function(target, exceptCase, hasEvent) {
            if (target.cloneNode && target.nodeType == 1) {
                //is dom
                return target.cloneNode(hasEvent);
            }
            var type = $._getObjectType(target);
            var returnValue;
            switch (type) {
                case '[object Array]':
                    returnValue = [];
                    break;
                case '[object Object]':
                    returnValue = {};
                    break;
                default:
                    $._alert('wrong dateType');
                    return;
            }
            if (exceptCase) {
                $.each(target, function(key, value) {
                    var test = exceptCase(key, value);
                    if (test !== false) {
                        if (type == '[object Object]' && target.hasOwnProperty(key)) {
                            returnValue[key] = value;
                        } else {
                            returnValue.push(value);
                        }
                    }
                });
            } else {
                $.each(target, function(key, value) {
                    returnValue[key] = value;
                });
            }
            return returnValue;
        },
        _getObjectType: function(object) {
            return Object.prototype.toString.call(object);
        },
        /**
         * try catch的封装写法
         * @name tryCatch
         * @function
         * @member tools
         * @param {Function} runMethod 要执行的函数
         * @param {Bollean || Number } autoPrint 可选, 如果该参数为真,则自动打印捕获到的错误
         * @return {String} log catch 到的错误信息
         * @example
         *   var log = tools.tryCatch(function(){
         *      alert(abc);
         *  });
         */
        tryCatch: function(runMethod, autoPrint) {
            try {
                return runMethod();
            } catch (e) {
                var log = e.name + ": " + e.message;
                if (e.fileName && e.lineNumber) {
                    // Mozilla only
                    log += "<i>( On " + e.fileName + " line: " + e.lineNumber + " )</i>";
                }
                if (autoPrint) {
                    var win = InterFace().getInfoWindow().show();
                    win.print("<span style='color:red;'>" + log + "</span>");
                    if (e.stack) {
                        //打印调用堆栈                    
                        var stacks = e.stack.split('\n');
                        //首行和log内容一致，堆栈内容缩进
                        stacks.shift();
                        $.each(stacks, function(index, item) {
                            win.print("<span style='color:red;margin-left:20px;'>" + item + "</span>");
                        });
                    }
                }
                return log;
            }
        },
        /**
         * 比较两个对象是否相似, 可以递归的比较对象和数组,数组会取第一个元素进行比较,对象则递归比较
            某个属性的值设置为undefined时,则只比较是否存在,不比较值是否相等
         * @name compare
         * @function
         * @member tools
         * @param {Object} compareOne 要比较的对象
         * @param {base} base 比较依据对象
         * @return {String || true} 如果 base 规定的属性 compareOne都满足则返回 true, 否则返回不合规范的参数名
         * @example
            var one = {
                a:'123',
                b:undefined,
                c:{
                    c1:'1',
                }   
                d:[{
                    d1:'2'
                }]
             }    
         *  var log = tools.compare(one, {
                a:'123',
                b:'1234'
                c:{
                    c1:'2'
                }
            });
            result c1 value was wrong
         */
        compare: function(compareOne, base) {
            for (var k in base) {
                //属性存在
                if (!compareOne[k] && compareOne[k] !== '' && compareOne[k] !== 0) {
                    return 'no ' + k + ' key';
                }
                //不检查内容和递归,属性存在即可
                if (base[k] === undefined) {
                    continue;
                }
                var type = base[k].constructor;
                //递归
                if (type == Object) {
                    var result = $.compare(compareOne[k], base[k]);
                    if (result !== true) {
                        return result;
                    }
                    continue;
                };
                if (type == Array) {
                    var result = $.compare(compareOne[k][0], base[k][0]);
                    if (result !== true) {
                        return result;
                    }
                    continue;
                };
                //基础数据类型检查
                if (base[k] == String || base[k] == Number) {
                    if (compareOne[k].constructor !== base[k]) {
                        return k + ' dataType was wrong';
                    } else {
                        continue;
                    }
                }
                //值检查
                if (compareOne[k] !== base[k]) {
                    return k + '=' + compareOne[k] + ';and it should be ' + base[k];
                }
            }
            return true;
        }
    };

    /**
     * 创建一个可拖动的弹出层窗口
     * @name InfoWindow
     * @class 弹出层窗口类, 在debugger内部单例使用, 也可利用接口返回值手动使用一个或多个
     * @param {Object} opt {@link InfoWindowOption} 弹出层参数
     * @return {Object} callback 使用.run()来调用包裹的函数, 可以传入false来临时禁用
     */
    var maxZIndex = 10000;
    var InfoWindow = function(opt) {
        opt = opt || {};
        var win, title, content;
        win = $.createElem('div');
        title = $.createElem('div');
        content = $.createElem('div');
        win.appendChild(title);
        win.appendChild(content);
        $.setStyle(win, {
            position: "absolute",
            top: (opt.top || 30) + "px",
            left: (opt.left || 30) + "px",
            width: (opt.width || 800) + "px",
            height: (opt.height || 600) + "px",
            zIndex: maxZIndex,
            border: "1px solid #000000",
            backgroundColor: "#FFFFFF"
        });
        $.setStyle(title, {
            cursor: "move",
            width: "100%",
            height: "20px",
            zIndex: "10001",
            backgroundColor: "#000000"
        });
        $.setStyle(content, {
            overflow: "auto",
            width: "100%",
            height: (opt.height || 600) - 20 + 'px',
            zIndex: "10001",
            backgroundColor: '#cce8cf',
            position: 'relative'
        });
        var titleName = $.createElem('span');
        $.setStyle(titleName, {
            'marginLeft': '15px',
            'float': 'left',
            'cursor': 'move',
            'color': '#FFFFFF'
        });
        titleName.innerHTML = opt.title || 'debugger window';
        var clearElem = $.createElem('span');
        $.setStyle(clearElem, {
            'marginRight': '15px',
            'float': 'right',
            'cursor': 'pointer',
            'color': '#FFFFFF'
        });
        clearElem.innerHTML = "clear";
        $.bind(clearElem, 'click', function() {
            content.innerHTML = "";
        });
        var changeSize = $.createElem('span');
        $.setStyle(changeSize, {
            'marginRight': '15px',
            'float': 'right',
            'cursor': 'pointer',
            'color': '#FFFFFF'
        });
        changeSize.innerHTML = "change size";
        $.bind(changeSize, 'click', function() {
            if (content.style.display == 'none') {
                $.setStyle(win, {
                    'height': (opt.height || 600) + "px"
                });
                content.style.display = 'block';
            } else {
                $.setStyle(win, {
                    'height': "20px"
                });
                content.style.display = 'none';
            }
        });
        title.appendChild(titleName);
        title.appendChild(clearElem);
        title.appendChild(changeSize);
        $.enableDrag(win, title, {
            dragStartEvent: function() {
                if (win.style.zIndex <= maxZIndex) {
                    $.setStyle(win, {
                        'zIndex': maxZIndex++
                    });
                }
            }
        });
        /**
         * 将infowindow绑定到dom上
         * @name show
         * @function
         * @member InfoWindow
         */
        this.show = function() {
            if (document.body && win.parentNode === document.body) {
                return this;
            }
            $.waitingFor(function() {
                return document.body;
            }, function() {
                document.body.appendChild(win);
            });
            return this;
        };
        /**
         * 打印一个变量,递归的展示数组和对象, 可以点击对象名进行折叠
         * @function
         * @name print
         * @member InfoWindow
         * @param {Array | Object | String | Number} object
         * @example
         *      print(['aaa', 'bbb', 'ccc'])
         *      print({a:'aa', b:'bb'})
         *      print(['aaa', {a:'aa', b:'bb'}, 'ccc'])
         */
        this.print = function(object) {
            var text = $._parseToString(object);
            var d = $.createElem('div');
            $.setStyle(d, {
                borderBottom: '1px dashed red',
                position: 'relative',
                margin: '5px 10px'
            });
            d.innerHTML = text.content;
            //content.appendChild(d);
            content.insertBefore(d, content.firstChild);
            //折叠变量
            var spans = $.$tag('SPAN', d);
            $.each(spans, function(index, item) {
                $.bind(item, 'click', function() {
                    var div = $.$nextNodeByTag(item, 'div');
                    if (div.style.display == 'none') {
                        div.style.display = '';
                    } else {
                        div.style.display = 'none';
                    }
                });
            });
            return this;
        };
        /**
         * 改变infowindw的宽度
         * @function
         * @name setWidth
         * @member InfoWindow
         * @param {Number} width
         */
        this.setWidth = function(val) {
            win.style.width = val + 'px';
            return this;
        };
        this.setLeft = function(val) {
            win.style.left = val + 'px';
            return this;
        };
        this.setTop = function(val) {
            win.style.top = val + 'px';
            return this;
        };
    };
    //var infowindow = new InfoWindow();
    var _debuggerInstances = {};
    //var InterFace = {};
    /**
     * @name debuggerClass
     * @class 所有调用必须的命名空间,自身也是一个可以被调用的函数, 默认关闭, 使用前必须手动  enable()
     * @description 包裹一个函数, 使用run()来控制是否执行, 且该函数在的调用debugger-Disable状态下会被忽略
     * @param {String} name 被包裹的函数
     * @return {Object} callback 使用.run()来调用包裹的函数, 可以传入false来临时禁用
     * @example
     *      $debugger.enable()
     *      $debugger(function(){
     *          alert('1')
     *      }).run()
     */
    var debuggerClass = function(name) {
        var disable = true;
        var infoWindow = new InfoWindow({
            title: name + ' debugger window'
        });
        this.name = name;
        this.checkEnable = function() {
            return disable;
        };
        /**
         * @name enable
         * @function
         * @memberOf debuggerClass
         * @description 启用debugger
         */
        this.enable = function() {
            disable = false;
            return this;
        };
        /**
         * @name disable
         * @function
         * @memberOf debuggerClass
         * @description 禁用debugger
         */
        this.disable = function() {
            disable = true;
            return this;
        };
        this.getInfoWindow = function() {
            return infoWindow;
        }
    };
    var InterFace = function(name) {
        var _name = name || 'default';
        //模拟同name的单例
        var instance = _debuggerInstances[_name];
        if (!instance) {
            instance = new debuggerClass(_name);
            _debuggerInstances[_name] = instance;
        }
        return instance;
    };
    /**
     * @name extend
     * @function
     * @member debuggerClass
     * @description 扩展一个debugger对象原型, 如果是一个函数,会受到$debugger.enable/disable的控制, 支持多级命名空间
     * @param {String} nameSpace  扩展成员的命名空间
     * @param {Object} handler  扩展成员对象,可以是对象,函数等
     * @example extend('tools.cookie.get', function(){ do something })
     */
    InterFace.extend = function(nameSpace, handler, unNeedEnable) {
        var _this = debuggerClass.prototype;
        var names = nameSpace.split('.'); //拆分命名空间
        var _member = names[0];
        while (names.length > 1) {
            if (typeof _this[_member] === 'undefined') {
                _this[_member] = {};
            }
            _this = _this[_member];
            names.shift();
            _member = names[0];
        }
        if (_this[names[0]]) {
            $._alert('member "' + name + '" aleardy exist !');
            return;
        }
        if (typeof handler == 'function') {
            _this[names[0]] = unNeedEnable ?
                function() {
                    return handler.apply(this, arguments) || this;
            } :
                function() {
                    if (this.checkEnable()) return this;
                    return handler.apply(this, arguments) || this;
            };
        } else {
            _this[names[0]] = handler;
        }
    };

    /**
     * @name getTools
     * @function
     * @memberOf debuggerClass
     * @description 返回工具类对象的副本
     * @return  {Object} {@link tools} 工具类函数对象
     */
    InterFace.getTools = function() {
        return $.clone($, function(key) {
            //剔除不希望暴露的私有函数
            return key.substr(0, 1) == '_' ? false : true;
        });
    };
    InterFace.Grace = {};
    //=================================基础函数=================================

    /**
     * @name run
     * @description 包裹一个函数, 使用isRun来控制是否执行, 且该函数在的调用debugger-Disable状态下会被忽略
     * @param {Function} method 被包裹的函数
     * @param {Boolean} isRun 是否立刻执行
     * @return {Object} callback 使用来调用包裹的函数, 可以传入false来临时禁用
     * @example
     *      $debugger.run(function(){
     *          alert('1')
     *      })
     */
    InterFace.extend('run', function(method, isRun) {
        if (isRun != false) method();
    });
    /**
     * @name useInfowindow
     * @memberOf debuggerClass
     * @function
     * @description 启用一个infowindow, 可以同时启用多个
     * @param {Object} InfoWindowOption {@link InfoWindowOption}  infowindow配置属性
     * @return {Object} {@link InfoWindow}  infowindow对象
     * @example useInfowindow()
     */
    var countWindows = 0;
    InterFace.extend('useInfoWindow', function(opt) {
        opt = opt || {};
        countWindows++;
        /**
         * @name InfoWindowOption
         * @class InfoWindow配置对象, 所有参数均为可选, 无需构造器, 直接使用对象字面量声明
         */
        var _opt = {
            /**
             * infowindow的标题名称
             * @name title
             * @type String
             * @fieldOf InfoWindowOption
             * @default debugger window
             */
            title: opt.title || 'debugger window',
            /**
             * infowindow的宽度
             * @name width
             * @type Number
             * @fieldOf InfoWindowOption
             * @default 600
             */
            width: opt.width || 600,
            /**
             * infowindow的高度
             * @name height
             * @type Number
             * @fieldOf InfoWindowOption
             * @default 500
             */
            height: opt.height || 500,
            /**
             * infowindow初始化时的页面左边距
             * @name left
             * @type Number
             * @fieldOf InfoWindowOption
             * @default 50
             */
            left: opt.left || 20 + countWindows * 30,
            /**
             * infowindow初始化时的页面右边距
             * @name top
             * @type Number
             * @static
             * @fieldOf InfoWindowOption
             * @default 50
             */
            top: opt.top || 20 + countWindows * 30
        };
        var infowindow = new InfoWindow(_opt);
        infowindow.show();
        return infowindow;
    });
    /**
     * @name print
     * @function
     * @memberOf debuggerClass
     * @description debugger公用infowindow打印输出接口, 等同于infowindow自带的print函数, 但只会在内部默认的infowindow中打印
     * @param {Array | Object | String | Number} object 要打印的对象
     * @example
     *      print(['aaa', 'bbb', 'ccc'])
     *      print({a:'aa', b:'bb'})
     *      print(['aaa', {a:'aa', b:'bb'}, 'ccc'])
     */
    InterFace.extend('print', function(object) {
        this.getInfoWindow().show();
        this.getInfoWindow().print(object);
    });

    InterFace.extend('clickBtn', function(name, actionMethod) {
        var actionName = new Date().getTime().toString(36) + $.getRandom(3);
        var btnStr =
            '<input type="button" value="' + name + '" onclick="' + __NAME_ + '.Grace.' + actionName + '();" />';
        _NAME_SPACE[__NAME_].Grace[actionName] = actionMethod;
        this.print(btnStr);
    });
    /**
     * 修改$debugger中默认的infowindow的宽度
     * @name setWidth
     * @function
     * @memberOf debuggerClass
     * @param {Number} width
     */
    InterFace.extend('setWidth', function(width) {
        infowindow.setWidth(width);
    });

    //时间线相关的私有函数
    var timeLineObject = {
        timeLineMarker: [],
        colors: ['#deb441', '#dc41de', '#4941de', '#41d8de'],
        start: function() {
            this.timeLineMarker = [];
            this.mark('start');
        },
        mark: function(key) {
            var t = new Date();
            this.timeLineMarker.push({
                key: key || this.timeLineMarker.length,
                t: t
            });
            return t;
        },
        end: function() {
            this.mark('end');
            var text = this.print();
            InterFace().print(text);
            this.timeLineMarker = [];
        },
        print: function() {
            var showString = [];
            var keyString = [];
            var timeLineMarker = this.timeLineMarker;
            var maxTime = timeLineMarker[timeLineMarker.length - 1].t - timeLineMarker[0].t; //500ms
            showString.push('<div style="height:30px;">');
            keyString.push('<div>');
            for (var i = 1, n = timeLineMarker.length; i < n; i++) {
                var skip = timeLineMarker[i].t - timeLineMarker[i - 1].t;
                var w = Math.floor((skip / maxTime) * 100);
                showString.push('<div style="background-color:' +
                    this.colors[i % 4] +
                    ';float:left;position:relative;width:' +
                    w + '%;height:20px;color:#FFFFFF;text-align:center;"><span style="">' +
                    skip + 'ms</span><div style="color:#000000;position:absolute;right:0px;top:20px">' +
                    i + '</div></div>');

                keyString.push('<p style="font-weight:bolder;color:' + this.colors[i % 4] + '">' +
                    i + ' . ' + timeLineMarker[i].key + ' : ' + skip + 'ms</p>');
            }
            keyString.push('</div>');
            showString.push('</div>');
            showString.push(keyString.join(''));
            return showString.join('');
        }
    };
    //时间线相关的接口
    /**
     * 在代码中标记一个时间点开始, 用以end时标记各个阶段的经过时间, 标记开始会清除所有已存的时间点
     * @name tStart
     * @function
     * @memberOf debuggerClass
     * @example 见 tEnd() example
     */
    InterFace.extend('tStart', function() {
        return timeLineObject.start();
    });
    /**
     * 在代码中标记一个时间点, 用以end时标记各个阶段的经过时间
     * @name tMark
     * @function
     * @memberOf debuggerClass
     * @param {String | Number} key 可选标记文字, 默认为时间点标记的数字序号
     * @example 见 tEnd() example
     */
    InterFace.extend('tMark', function(key, value) {
        return timeLineObject.mark(key, value);
    });
    /**
     * 结束标记, 结束后会在infowindow打印之前各个mark的间隔时间,并清除所有mark
     * @name tEnd
     * @function
     * @memberOf debuggerClass
     * @example
     *  tStart()
     *      do something...
     *  tMark('ready search')
     *      do something...
     *  tMark('search back')
     *      do something...
     *  tEnd()
     */
    InterFace.extend('tEnd', function() {
        timeLineObject.end();
    });

    _NAME_SPACE[__NAME_] = InterFace;
})(window);