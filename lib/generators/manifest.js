'use strict'

const YAML = require('yaml')

function isObject(obj) {
  const type = typeof obj
  return type === 'function' || type === 'object' && !!obj
}

function generate (struct) {
  const mapObjects = (s) => {
    const m = {}
    for (const [k, v] of Object.entries(s)) {
      m[k] = (Array.isArray(v) && v.map(mapObjects)) || (isObject(v) && mapObjects(v)) || v
    }
    return m
  }

  return mapObjects(struct)
}

function stringify (manifest, options) {
  return YAML.stringify(generate(manifest), options)
}

module.exports = { generate, stringify }
