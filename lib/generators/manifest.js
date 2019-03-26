'use strict'

const YAML = require('yaml')

function isObject(obj) {
  const type = typeof obj
  return type === 'function' || type === 'object' && !!obj
}

function generate (struct) {
  const mapObjects = (s) => {
    const m = Array.isArray(s) ? [] : {}
    for (const [k, v] of Object.entries(s)) {
      const value = (Array.isArray(v) && v.map(mapObjects)) || (isObject(v) && mapObjects(v)) || v
      if (Array.isArray(s)) {
        m.push(value)
      } else {
        m[k] = value
      }
    }
    return m
  }

  return mapObjects(struct)
}

function stringify (manifest, options) {
  return YAML.stringify(generate(manifest), options)
}

module.exports = { generate, stringify }
