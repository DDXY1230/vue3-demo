import { isObject, isArray,hasChanged, isFunction, isNumber, isString, isIntegerKey, hasOwn } from "@vue/shared"
import { readonly, reactive } from "./reactive"
import { TrackOpType,TriggerOpTypes } from './operations'
import { Track,trigger } from './effect'
// get
const get = createGetter() // 不是只读,不是浅的
const shallowGet = createGetter(false, true) // 不是只读, 是浅的
const readonlyGet = createGetter(true)// 是只读, 不是浅的
const shallowReadonlyGet = createGetter(true, true) // 是只读, 是浅的
// set 是不是深的
const set = createSetter()
const shallowSet = createSetter(true)
export const reactiveHandlers = {
  get,
  set
}
export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet
}
export const readonlyHandlers = {
  get: readonlyGet,
  set: (target, key, value) => {
    console.log('set on key is faild')
  }
}
export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set: (target, key, value) => {
    console.log('set on key is faild')
  }
}

function createGetter(isReadOnly = false, shallow = false) {
  return function get(target, key, receiver) {
    // proxy + reflect搭配使用
    const res = Reflect.get(target, key, receiver)// target[key]
    if (!isReadOnly) {
      // 收集依赖
      Track(target, TrackOpType.GET, key)

    }
    if (shallow) {
      return res
    }
    // 
    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res) // 递归
    }
    // return res + '  <<<-代理后的结果'
    console.log(res + '  <<<-代理后的结果')
    return res
  }
}
function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const oldValue = target[key]
    console.log('oldValue', oldValue)
    // 判断是否是数组
    let haskey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)
    console.log(haskey)
    if (!haskey) {
      // 没有 就是新增值
      trigger(target, TriggerOpTypes.ADD, key, value)
    }else{
      // 修改
      if(hasChanged(value, oldValue)){

      trigger(target, TriggerOpTypes.SET,key,value,oldValue)
      }
    }
    const result = Reflect.set(target, key, value, receiver) // 设置最新值并返回设置是否成功 true / false
    console.log('set==>result=> ', result)
    return result
  }
}
