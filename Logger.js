/*
 * @fileoverview 日志打印模块，便于手机端调试
 * var logger = new Logger('saloding');
 * logger.log(x, y ,z)
 * logger.info('something')
 */
function _extend(target, origin, deep) {
    var target = target || {},
        k;
    for (k in origin) {
        if (typeof origin[k] === 'object' && deep) {
            target[k] = (origin[k].constructor === Array) ? [] : {};　　　　　　
            _extend(target[k], origin[k], deep);　　　　
        } else {　　　　　　
            target[k] = origin[k];　　　　
        }　　
    }
    return target;
}

function getQueryStr(str) {
    var LocString = String(window.document.location.href);
    var rs = new RegExp('(^|)' + str + '=([^\&]*)(\&|$)', 'gi').exec(LocString),
        tmp;
    if (tmp = rs) {
        return tmp[2];
    }
    return '';
}

function loadScript(url, callback) {
    var scr = document.createElement('SCRIPT');
    scr.onload = scr.onreadystatechange = function() {
        var readyState = scr.readyState;
        if ('undefined' == typeof readyState ||
            readyState == 'loaded' ||
            readyState == 'complete') {
            try {
                callback && callback();
            } finally {
                scr.onload = scr.onreadystatechange = null;
            }
        }
    };
    scr.setAttribute('type', 'text/javascript');
    scr.setAttribute('charset', 'utf-8');
    scr.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(scr);
}

var printer = window['console'],
    referer = getQueryStr('referer'),
    rtxList = {
        'saloding': 1,
        'sunnytwang': 1,
        'cjgeng': 1,
        'cynthiawu': 1,
        'jasperkang': 1,
        'justinebi': 1,
        'merlinhu': 1,
        'xiajing': 1
    };

function _all() {
    var fn = arguments[0];
    arguments[0] = this.name;
    printer[fn].apply(printer, arguments);
}

function log() {
    Array.prototype.unshift.call(arguments, 'log');
    _all.apply(this, arguments);
}

function info() {
    Array.prototype.unshift.call(arguments, 'info');
    _all.apply(this, arguments);
}

function warn() {
    Array.prototype.unshift.call(arguments, 'warn');
    _all.apply(this, arguments);
}

function error() {
    Array.prototype.unshift.call(arguments, 'error');
    _all.apply(this, arguments);
}

function debug() {
    Array.prototype.unshift.call(arguments, 'debug');
    _all.apply(this, arguments);
}

var _none = new Function;
var ttyNull = {
    log: _none,
    info: _none,
    warn: _none,
    error: _none,
    debug: _none
};
var ttyConsole = {
    log: log,
    info: info,
    warn: warn,
    error: error,
    debug: debug
};
var isLoaded = false;
var loggerList = {};

function Logger(name) {
    if (loggerList[name]) {
        return loggerList[name];
    }
    loggerList[name] = this;

    this.name = name;
    if (window.location.hostname.indexOf('localhost') != -1) {
        _extend(this, ttyConsole);
    } else if (referer && rtxList[referer] && referer == this.name) {
        _extend(this, ttyConsole);
        if (!isLoaded) {
            isLoaded = true;
            var url = '//3gimg.qq.com/map_site_cms/h5nav/eruda.min.js';
            var cb = function() {
                eruda.init();
            }
            loadScript(url, cb);
        }
    } else {
        _extend(this, ttyNull);
    }
}

module.exports = Logger;