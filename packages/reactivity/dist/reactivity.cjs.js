'use strict';

// 公共方法
function isObject(target) {
    return typeof target === 'object' && target != null;
}
const isArray = Array.isArray;
const isFunction = (val) => typeof val === 'function';
const isIntegerKey = (key) => parseInt(key) === key;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const hasChanged = (value, oldValue) => value !== oldValue;

//1.定义effect
function effect(fn, options = {}) {
    const effect = createReactEffect(fn, options);
    if (!options.lazy) {
        effect();
    }
}
let uid = 0;
let activeEffect = null;
const effectStack = [];
function createReactEffect(fn, options) {
    const effect = function reactiveEffect() {
        if (!effectStack.includes(effect)) {
            try {
                console.log('执行用户传的方法');
                // 入栈
                effectStack.push(effect);
                activeEffect = effect;
                fn();
            }
            finally {
                effectStack.pop();
                activeEffect = effectStack[effectStack.length - 1];
            }
        }
    };
    effect.id = uid++; // 区别effect
    effect._isEffect = true; // 区分是不是响应式
    effect.raw = fn;
    effect.options = options;
    return effect;
}
// 收集effect
let targetMap = new WeakMap();
function Track(target, type, key) {
    // 
    console.log("Track==>", target, type, key, activeEffect);
    // 对应的key
    // key 和我们的effect一一对应 map=》key=》target=》  属性=》[effect]
    if (activeEffect == undefined) { // 没有在effect中使用
        return;
    }
    // 获取effect
    let depMap = targetMap.get(target);
    if (!depMap) {
        targetMap.set(target, (depMap = new Map())); // 添加值
    }
    // 有值的情况
    let dep = depMap.get(key);
    if (!dep) {
        // 没有属性的话
        depMap.set(key, (dep = new Set()));
    }
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
    }
    console.log(targetMap);
}
// 触发更新
function trigger(target, type, key, newValue, oldValue) {
    console.log('trigger==>', target, type, key, newValue, oldValue);
    console.log('targetMap===', targetMap);
    const depsMap = targetMap.get(target);
    console.log('depsMap这里是', depsMap);
    if (!depsMap) {
        return;
    }
    // let effect = depsMap.get[key]// set[]
    let effectSet = new Set();
    const add = (effectAdd) => {
        if (effectAdd) {
            effectAdd.forEach(effect => effectSet.add(effect));
        }
    };
    // add(depsMap.get(key))
    // 处理数组
    if (key === 'length' && isArray(target)) {
        console.log('进入数组处理');
        depsMap.forEach((dep, key) => {
            console.log('depsMap=====>', depsMap);
            if (key === 'length' || key >= newValue) {
                add(dep);
            }
        });
    }
    else {
        if (key !== undefined) {
            add(depsMap.get(key));
        }
        switch (type) {
            case 0 /* TriggerOpTypes.ADD */:
                if (isArray(target) && isIntegerKey(key)) {
                    add(depsMap.get('length'));
                }
        }
    }
    effectSet.forEach((effect) => {
        if (effect.options.sch(effect)) {
            effect.options.sch(effect);
        }
        else {
            effect();
        }
    });
}

// get
const get = createGetter(); // 不是只读,不是浅的
const shallowGet = createGetter(false, true); // 不是只读, 是浅的
const readonlyGet = createGetter(true); // 是只读, 不是浅的
const shallowReadonlyGet = createGetter(true, true); // 是只读, 是浅的
// set 是不是深的
const set = createSetter();
const shallowSet = createSetter(true);
const reactiveHandlers = {
    get,
    set
};
const shallowReactiveHandlers = {
    get: shallowGet,
    set: shallowSet
};
const readonlyHandlers = {
    get: readonlyGet,
    set: (target, key, value) => {
        console.log('set on key is faild');
    }
};
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set: (target, key, value) => {
        console.log('set on key is faild');
    }
};
function createGetter(isReadOnly = false, shallow = false) {
    return function get(target, key, receiver) {
        // proxy + reflect搭配使用
        const res = Reflect.get(target, key, receiver); // target[key]
        if (!isReadOnly) {
            // 收集依赖
            Track(target, 0 /* TrackOpType.GET */, key);
        }
        if (shallow) {
            return res;
        }
        // 
        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res); // 递归
        }
        // return res + '  <<<-代理后的结果'
        console.log(res + '  <<<-代理后的结果');
        return res;
    };
}
function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        const oldValue = target[key];
        console.log('oldValue', oldValue);
        // 判断是否是数组
        let haskey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
        console.log(haskey);
        if (!haskey) {
            // 没有 就是新增值
            trigger(target, 0 /* TriggerOpTypes.ADD */, key, value);
        }
        else {
            // 修改
            if (hasChanged(value, oldValue)) {
                trigger(target, 1 /* TriggerOpTypes.SET */, key, value, oldValue);
            }
        }
        const result = Reflect.set(target, key, value, receiver); // 设置最新值并返回设置是否成功 true / false
        console.log('set==>result=> ', result);
        return result;
    };
}

function reactive(target) {
    return createReactObj(target, false, reactiveHandlers);
}
function shallowReactive(target) {
    return createReactObj(target, false, shallowReactiveHandlers);
}
function readonly(target) {
    return createReactObj(target, true, readonlyHandlers);
}
function shallowReadonly(target) {
    return createReactObj(target, true, shallowReadonlyHandlers);
}
// 数据结构
const reactiveMap = new WeakMap(); // key 必须是对象, 自动垃圾回收 用来存放代理对象
const readonlyMap = new WeakMap(); // 用来存放代理对象
// 实现代理的核心
function createReactObj(target, isReadonly, baseHandlers) {
    // proxy() 对象
    if (!isObject(target)) {
        return target; // 不是对象不进行处理
    }
    const proxymap = isReadonly ? readonlyMap : reactiveMap;
    const proxyEs = proxymap.get(target);
    if (proxyEs) {
        return proxyEs; // 已经代理的直接返回
    }
    // 核心  proxy
    const proxy = new Proxy(target, baseHandlers);
    proxymap.set(target, proxy); // 存放数据,不会重复代理
    return proxy;
}

// 
function ref(target) {
    return createRef(target);
}
class RefImpl {
    rawValue;
    shallow;
    __v_isRef = true;
    _value;
    constructor(rawValue, shallow) {
        this.rawValue = rawValue;
        this.shallow = shallow;
        this._value = rawValue; // 用户传入的值
    }
    get value() {
        Track(this, 0 /* TrackOpType.GET */, 'value'); // 收集依赖
        return this._value;
    }
    set value(newValue) {
        if (hasChanged) {
            this._value = newValue;
            this.rawValue = newValue;
            trigger(this, 1 /* TriggerOpTypes.SET */, 'value', newValue);
        }
    }
}
function createRef(target, shallow = false) {
    return new RefImpl(target, shallow);
}
function toRef(target, key) {
    return new ObjectRefImpl(target, key);
}
class ObjectRefImpl {
    target;
    key;
    __v_isRef = true;
    constructor(target, key) {
        this.target = target;
        this.key = key;
    }
    get value() {
        return this.target[this.key];
    }
    set value(newValue) {
        this.target[this.key] = newValue;
    }
}
function toRefs(target) {
    let ret = isArray(target) ? new Array(target.length) : {};
    for (let key in target) {
        ret[key] = toRef(target, key);
    }
    return ret;
}

function computed(getterOrOptions) {
    // 传过来的参数可能是函数或者对象
    let getter;
    let setter;
    if (isFunction(getterOrOptions)) {
        getter = getterOrOptions,
            setter = () => {
                console.log('computed value must be readonly');
            };
    }
    else {
        getter = getterOrOptions.get;
        setter = getterOrOptions;
    }
    //返回值
    return new ComputedRefImpl(getter, setter);
}
class ComputedRefImpl {
    setter;
    _dirty = true;
    _value;
    effect;
    constructor(getter, setter) {
        this.setter = setter;
        this.effect = effect(getter, {
            lazy: true, sch: () => {
                if (!this._dirty) {
                    this._dirty = true;
                }
            }
        });
    }
    get value() {
        if (this._dirty) {
            this._value = this.effect();
            this._dirty = false;
        }
        return this._value;
    }
    set value(newValue) {
        this._value = newValue;
    }
}

exports.computed = computed;
exports.effect = effect;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
exports.toRef = toRef;
exports.toRefs = toRefs;
//# sourceMappingURL=reactivity.cjs.js.map
