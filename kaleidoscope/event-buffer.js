/*
Android 4.0 以下是不支持原生的 webview 滚动的，
通用的解决方法就是iscroll
但在条件允许的情况下可以使用原生的滚动
启用原生滚动只需要给外层元素加上样式 -webkit-overflow-scrolling: touch; 
即可，如果你的监听函数比较占用资源我们可以通过一个简单的 buffer 函数来限制它的触发间隔，例如：


*/
function buffer(fn, ms) {
  var timeout;
  return function() {
    if (timeout) return;
    var args = arguments;
    timeout = setTimeout(function() {
      timeout = null;
      fn.apply(null, args);
    }, ms);
  }
}


document.querySelector('.scrollable').onscroll = buffer(onScroll, 100);