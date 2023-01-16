import { hasChanged,isArray } from '@vue/shared';
import { Track, trigger } from "./effect"
import { TrackOpType,TriggerOpTypes } from "./operations"

// 
export function ref(target) {
  return createRef(target)
}
export function shallowRef(target) {
  return createRef(target,true)
}
class RefImpl{
  public __v_isRef = true
  public _value
  constructor(public rawValue,public shallow) {
    this._value = rawValue // 用户传入的值
  }
  get value() {
    Track(this, TrackOpType.GET, 'value') // 收集依赖
    return this._value
  }
  set value(newValue) {
    if(hasChanged) {
      this._value = newValue
      this.rawValue = newValue
      trigger(this,TriggerOpTypes.SET, 'value', newValue)
    }
  }
}
function createRef(target, shallow = false) {
  return new RefImpl(target, shallow)
} 
export function toRef(target,key) {
  return new ObjectRefImpl(target,key)
}
class ObjectRefImpl{
  public __v_isRef = true
  constructor(public target,public key) {

  }
  get value() {
    return this.target[this.key]
  }
  set value(newValue) {
    this.target[this.key] = newValue
  }
}
export function toRefs(target) {
  let ret = isArray(target) ? new Array(target.length) : {}
  for(let key in target) {
    ret[key] = toRef(target, key)
  }
  return ret
}