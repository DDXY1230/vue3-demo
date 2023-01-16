// 公共方法
export function isObject(target) {
  return typeof target === 'object' && target != null
}
export const extend = Object.assign
export const isArray = Array.isArray
export const isFunction = (val) => typeof val === 'function'
export const isNumber = val => typeof val === 'number'
export const isString = val => typeof val === 'string'
export const isIntegerKey = (key) => parseInt(key) === key

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val => hasOwnProperty.call(val, key)
export const hasChanged = (value, oldValue) => value !== oldValue