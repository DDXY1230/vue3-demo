import { isFunction } from '@vue/shared';
import { effect } from './effect'
export function computed(getterOrOptions) {
  // 传过来的参数可能是函数或者对象
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions,
      setter = () => {
        console.log('computed value must be readonly')
      }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions
  }
  //返回值
  return new ComputedRefImpl(getter, setter)
}
class ComputedRefImpl {
  public _dirty = true;
  public _value;
  public effect
  constructor(getter, public setter) {
    this.effect = effect(getter, {
      lazy: true, sch: () => {
        if (!this._dirty) {
          this._dirty = true
        }
      }
    })
  }
  get value() {
    if (this._dirty) {
      this._value = this.effect()
      this._dirty = false
    }
    return this._value
  }
  set value(newValue) {
    this._value = newValue
  }
}