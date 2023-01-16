import { isObject } from "@vue/shared"
import {reactiveHandlers,shallowReactiveHandlers,readonlyHandlers,shallowReadonlyHandlers} from './baseHandlers'


export function reactive(target) {
  return createReactObj(target, false, reactiveHandlers)
}
export function shallowReactive(target) {
  return createReactObj(target, false, shallowReactiveHandlers)

}
export function readonly(target) {
  return createReactObj(target, true, readonlyHandlers)

}
export function shallowReadonly(target) {
  return createReactObj(target, true, shallowReadonlyHandlers)
}
// 数据结构
const reactiveMap = new WeakMap() // key 必须是对象, 自动垃圾回收 用来存放代理对象
const readonlyMap = new WeakMap() // 用来存放代理对象
// 实现代理的核心
function createReactObj(target, isReadonly, baseHandlers) {
  
  // proxy() 对象
  if(!isObject(target)) {
    return target // 不是对象不进行处理
  }
  const proxymap = isReadonly? readonlyMap : reactiveMap
  const proxyEs = proxymap.get(target)
  if(proxyEs) {
    return proxyEs // 已经代理的直接返回
  }
  // 核心  proxy
  const proxy = new Proxy(target, baseHandlers)
  proxymap.set(target, proxy) // 存放数据,不会重复代理
  return proxy
}