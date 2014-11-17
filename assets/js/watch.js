

helper.watch = function(target, prop, handler) {
    if (target.__lookupGetter__(prop) != null) {
        return true;
    }
    console.log('trigered');
    var oldval = target[prop],
        newval = oldval,
        self = this,
        getter = function () {
            return newval;
        },
        setter = function (val) {
            if (Object.prototype.toString.call(val) === '[object Array]') {
                val = _extendArray(val, handler, self);
            }
            oldval = newval;
            newval = val;
            handler.call(target, prop, oldval, val);
        };
    if (delete target[prop]) { // can't watch constants
        if (Object.defineProperty) { // ECMAScript 5
            Object.defineProperty(target, prop, {
                get: getter,
                set: setter,
                enumerable: false,
                configurable: true
            });
        } else if (Object.prototype.__defineGetter__ &amp;&amp; Object.prototype.__defineSetter__) { // legacy
            Object.prototype.__defineGetter__.call(target, prop, getter);
            Object.prototype.__defineSetter__.call(target, prop, setter);
        }
    }
    return this;
};

helper.unwatch = function(target, prop) {
    var val = target[prop];
    delete target[prop]; // remove accessors
    target[prop] = val;
    return this;
};

// Allows operations performed on an array instance to trigger bindings
helper._extendArray = function(arr, callback, framework) {
    if (arr.__wasExtended === true) return;

    function generateOverloadedFunction(target, methodName, self) {
        return function () {
            var oldValue = Array.prototype.concat.apply(target);
            var newValue = Array.prototype[methodName].apply(target, arguments);
            target.updated(oldValue, motive);
            return newValue;
        };
    }
    arr.updated = function (oldValue, self) {
        callback.call(this, 'items', oldValue, this, motive);
    };
    arr.concat = generateOverloadedFunction(arr, 'concat', motive);
    arr.join = generateOverloadedFunction(arr, 'join', motive);
    arr.pop = generateOverloadedFunction(arr, 'pop', motive);
    arr.push = generateOverloadedFunction(arr, 'push', motive);
    arr.reverse = generateOverloadedFunction(arr, 'reverse', motive);
    arr.shift = generateOverloadedFunction(arr, 'shift', motive);
    arr.slice = generateOverloadedFunction(arr, 'slice', motive);
    arr.sort = generateOverloadedFunction(arr, 'sort', motive);
    arr.splice = generateOverloadedFunction(arr, 'splice', motive);
    arr.unshift = generateOverloadedFunction(arr, 'unshift', motive);
    arr.__wasExtended = true;

    return arr;
}