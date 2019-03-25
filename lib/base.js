'use strict'

class Base {
  constructor (props = [], val = {}) {
    for (const prop of props) {
      if (prop.type === 'array') {
        Object.defineProperty(this, `_${prop.name}`, {
          enumerable: false,
          value: []
        })

        Object.defineProperty(this, prop.name, {
          enumerable: true,
          value: new Proxy(this[`_${prop.name}`], {
            set: function (target, p, val) {
              if (isNaN(Number(p))) {
                return Reflect.set(target, p, val)
              }

              if (!prop.class || val instanceof prop.class) {
                return target[p] = val
              } else {
                return target[p] = new prop.class(val)
              }
            }
          })
        })
      } else {
        Object.defineProperty(this, `_${prop.name}`, {
          writable: true,
          enumerable: false
        })

        Object.defineProperty(this, prop.name, {
          enumerable: true,
          get: () => this[`_${prop.name}`],
          set: (val) => {
            if (!prop.class || val instanceof prop.class) {
              return this[`_${prop.name}`] = val
            }

            this[`_${prop.name}`] = new prop.class(val)
          }
        })
      }

      for (const key in val) {
        this[key] = val[key]
      }
    }
  }
}

module.exports = Base
