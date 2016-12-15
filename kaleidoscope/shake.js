/*
 * Shake event will trigger the method "window.shakeEvent"
 * 摇一摇功能主要针对内置支持加速器的移动设备去判断用户行为，这里设定的参数值是通过多款手机实践并设定的。 
 * 代码里将监听事件挂在window.shakeEvent下，如果需求有变化可以自行修改。
 */
;(function(){
	window.shakeEvent = function(){};
	var THRESHOLD = 500, INTERVAL = 200, lastTime = 0, coordinate = {}, flag = true, delay = 500;
	function deviceMotionHandler(eventData, callback) {
		var acceleration = eventData.accelerationIncludingGravity, now = new Date().getTime(), _interval = now - lastTime;
		if(_interval > INTERVAL) {
			lastTime = now;
			var speed = Math.abs(acceleration.x + acceleration.y + acceleration.z - coordinate.x - coordinate.y - coordinate.z) / _interval * 10000;
			coordinate.x = acceleration.x;
			coordinate.y = acceleration.y;
			coordinate.z = acceleration.z;
			if (speed > THRESHOLD) {
				if(flag){
					flag = false;
					callback && callback();
					window.setTimeout(function(){flag = true;},delay);
				}
			}
		}
	}
	if (window.DeviceMotionEvent){
		window.addEventListener('devicemotion',function(eventData){deviceMotionHandler(eventData,window.shakeEvent);}, false);
	}
})(window);
