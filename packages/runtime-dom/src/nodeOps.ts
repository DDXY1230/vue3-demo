export const nodeOps = {
  // 创建元素 createElement 
  createElement: (tagName) => {
    document.createElement(tagName)
  },
  remove: child => {
    const parent = child.parentNode
    if(parent) {
      parent.removeChild(child)
    }
  },
  insert: (child, parent,ancher=null) => {
    parent.insertBefore(child,ancher)
  },
  querySelecter: select => {
    document.querySelector(select)
  },
  setElementText: (el,text) => {el.textContent = text},
  createText: text => document.createTextNode(text),
  setText:(node, text) => node.nodeValue = text
}