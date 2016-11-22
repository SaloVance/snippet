/*
 * extend utility
 */
function extend(target, origin, deep) {
    var target = target || {};
    for(var k in origin) {
        if(typeof(origin[k]) === 'object' && deep) {
            target[k] = origin[k].constructor === Array ? [] : {};
            extend(target[k], origin[k], deep);
        } else {
            target[k] = origin[k];
        }
    }
    return target;
}