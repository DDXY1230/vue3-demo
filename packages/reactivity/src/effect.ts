import { isArray,isIntegerKey } from '@vue/shared';
import { TriggerOpTypes } from './operations'
//1.定义effect
export function effect(fn, options: any = {}) {
  const effect = createReactEffect(fn, options)
  if (!options.lazy) {
    effect()
  }
}
let uid = 0
let activeEffect = null
const effectStack = []

function createReactEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      try {
        console.log('执行用户传的方法')
        // 入栈
        effectStack.push(effect)
        activeEffect = effect
        fn()
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  effect.id = uid++ // 区别effect
  effect._isEffect = true // 区分是不是响应式
  effect.raw = fn
  effect.options = options
  return effect
}
// 收集effect
let targetMap = new WeakMap()
export function Track(target, type, key) {
  // 
  console.log("Track==>", target, type, key, activeEffect)
  // 对应的key
  // key 和我们的effect一一对应 map=》key=》target=》  属性=》[effect]
  if(activeEffect == undefined) { // 没有在effect中使用
    return
  }
  // 获取effect
  let depMap = targetMap.get(target)
  if(!depMap) {
    targetMap.set(target, (depMap = new Map())) // 添加值
  }
  // 有值的情况
  let dep = depMap.get(key)
  if(!dep) {
    // 没有属性的话
    depMap.set(key, (dep = new Set()))
  }
  if(!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
  console.log(targetMap)
}
// 触发更新
export function trigger(target, type,key?,newValue?, oldValue?) {
   console.log('trigger==>', target, type,key,newValue, oldValue)
  console.log('targetMap===',targetMap)
  const depsMap = targetMap.get(target)
  console.log('depsMap这里是', depsMap)
  if(!depsMap) {return}
  // let effect = depsMap.get[key]// set[]
  let effectSet = new Set()
  const add = (effectAdd) => {
    if(effectAdd) {
      effectAdd.forEach(effect=>effectSet.add(effect))
    }
  }
  // add(depsMap.get(key))
  // 处理数组
  if(key === 'length' && isArray(target)) {
    console.log('进入数组处理')
    depsMap.forEach((dep, key) => {
      console.log('depsMap=====>',depsMap)
      if(key === 'length' || key >= (newValue as number)) {
        add(dep)
      }  
    })
  }else {
    if(key !== undefined) {
      add(depsMap.get(key))
    }
    switch(type) {
      case TriggerOpTypes.ADD:
        if(isArray(target) && isIntegerKey(key)){
          add(depsMap.get('length'))
        }
    }
  }
  effectSet.forEach((effect:any) => {
    if(effect.options.sch(effect)){
      effect.options.sch(effect)
    }else {
      effect()
    }
  })
}