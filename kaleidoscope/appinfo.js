/**
 * 封装各App提供的jsbridge，对HTML5页面的app检测功能提供支持，并向下兼容
 * 目前支持：腾讯新闻，
 * 用法
 * 1.判断是否安装某应用：
 * Appinfo.isInstall(options,success,failed);
 *
 * Appinfo.isInstall({
 *  "packageName":"com.tencent.qqlive",
 *  "openUrl":"tenvideo2://"
 * },function(version) {
 *      //version号
 * },function() {
 *      //uninstall
 * });
 *
 * 2.调起指定app
 * Appinfo.open(options);
 * Appinfo.open({
 *  "packageName":"com.tencent.qqlive",
 *  "openUrl":"tenvideo2://"
 * });
 *
 */
var Appinfo = {

    init:function() {
        var ua = this.uasniffer(navigator.userAgent);
        //判断android,ios
        if(this.api[ua]) {
            return this.api[ua];
        } return null;
    },
    isInstall:function(options,success,failed) {
        var adapter = this.init();
        if(adapter) {
            //options处理
            adapter.isInstall(options,success,failed);
        } else {
            failed();
        }
    },
    open:function(options) {
        var adapter = this.init();
        if(adapter) {
            //options处理
            adapter.open(options);
        } else {
            //待处理
        }
    },
    //移动端或者说只针对少数几个浏览器及webview的侦测
    uasniffer:function(ua) {
        var s = ua.toLowerCase();
        if(s.indexOf("micromessenger")>-1) {
            return "wx";
        } else if(s.indexOf("mqqbrowser") > -1) {
            return "mqq";
        }
        if(s.indexOf("qqnews") > -1) {
            return "qqnews";
        }
        if(s.indexOf("qq")>-1) {
            return "qq";
        }
        return ua;
        // "MicroMessenger/5.4.0.51" 微信
        // "MQQBrowser/5.3" QQ浏览器
        // "QQ/5.0.0.2215" 手Q
        // "Weibo" 新浪微博
        // "TXMicroBlog445" 腾讯微博
        // "qqnews/4.2.4" 腾讯新闻
    },
    load:function(url,callback) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        document.getElementsByTagName('head')[0].appendChild(script);
    },
    //封装接口，目前支持微信、腾讯新闻客户端android版、手机QQ
    api:(function() {
        return {
            "wx":{
                ready:function(callback) {
                    if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                        callback();
                    } else {
                        if (document.addEventListener) {
                            document.addEventListener("WeixinJSBridgeReady", callback, false);
                        } else if (document.attachEvent) {
                            document.attachEvent("WeixinJSBridgeReady", callback);
                            document.attachEvent("onWeixinJSBridgeReady", callback);
                        }
                    }
                },
                isInstall:function(options,success,failed) {
                    this.ready(function() {
                        WeixinJSBridge.invoke("getInstallState",{
                            "packageUrl":options['openUrl'],
                            "packageName":options['packageName']
                        },function(res) {
                            var msg = res.err_msg;
                            var p = msg.indexOf("yes_");
                            if(p>-1) {
                                success(msg.substr(p+4));
                                // return res.err_msg.substr()
                            } else {
                                //"failed:get_install_state:no"
                                failed(res.err_msg);
                            }
                        });
                    });
                },
                open:function(options) {
                    //openUrl最好提供完整路径
                    var ifr = document.createElement('iframe');
                    ifr.src = options['openUrl'];
                    document.body.appendChild(ifr);
                    // window.location.href = options['openUrl'];
                }
            },
            //android
            "qqnews":{
                isInstall:function(options,success,failed) {
                    if(window.TencentNewsScript && window.TencentNewsScript.getAppVersionName) {
                        success(window.TencentNewsScript.getAppVersionName(options['packageName']));
                    } else {
                        failed();
                    }
                },
                open:function(options) {
                    //alert("qqnews open"+options['openUrl']);
                    if(window.TencentNewsScript && window.TencentNewsScript.openApp) {
                        window.TencentNewsScript.openApp(options['openUrl'],options['packageName']);
                    }
                }
            },
            "mqq":{
                ready:function(callback) {
                    Appinfo.load("http://qzs.qq.com/open/mobile/jsbridge/jsbridge.js",callback);
                },
                isInstall:function(options,success,failed) {
                    this.ready(function() {
                        JsBridge.getAppInstalledVersion([options['packageName']],function(result) {
                            success(result[options['packageName']]);
                        });
                    });
                },
                open:function(options) {
                    this.ready(function() {
                        JsBridge.startApp(options['packageName'],"");
                    });
                }
            }
        }
    }())
}
