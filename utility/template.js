/*
 * common template compiler
 * template(tpl, data) => html snippet
 */
 
function template(str, data) {
    var _escape = function(string) {
        return ('' + string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
    };
    var templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    var noMatch = /.^/;

    var c = templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
        'with(obj||{}){__p.push(\'' +
        str.replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(c.escape || noMatch, function(match, code) {
            return "',_escape(" + unescape(code) + "),'";
        })
        .replace(c.interpolate || noMatch, function(match, code) {
            return "'," + unescape(code) + ",'";
        })
        .replace(c.evaluate || noMatch, function(match, code) {
            return "');" + unescape(code).replace(/[\r\n\t]/g, ' ') + ";__p.push('";
        })
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t') + "');}return __p.join('');";
    var func = new Function('obj', '_escape', tmpl);
    if (data) return func(data, _escape);
    return function(data, _escape) {
        return func.call(this, data, _escape);
    };
};

/* demo code for test */
var tpl =   '<div id="<%= name %>">' +
                '<% if(pass) { %>' + 
                    '<ul>' +
                    '<% for(var i in list){ %>' +
                        '<li><%= list[i] %></li>' +
                    '<% } %>' + 
                    '</ul>' +
                '<% } else { %>' +
                    '<p> failed </p>' +
                '<% } %>' +
            '</div>';

var data = {
    name: 'salovance', 
    list: ['javascript', 'python', 'java'], 
    score: {java: 98}, 
    pass: true
};

console.log(template(tpl, data));