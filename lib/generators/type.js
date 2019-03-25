'use strict'

const path = require('path')
const { getTypeName } = require('../names')

const template = (name, reqs, props) => `'use strict'

${reqs.map(({ name, path }) => `const ${name} = require('${path}')`).join('\n')}

class ${getTypeName(name)} extends Base {
  constructor (val) {
    super([
      ${props.map(prop => propToString(prop)).join(',\n      ')}
    ], val)
  }
}

module.exports = ${getTypeName(name)}
`

function propToString (prop) {
  let result = `{ name: '${prop.name}', `

  const parts = []
  if (prop.type) {
    parts.push(`type: '${prop.type}'`)
  }

  if (prop.subtype) {
    parts.push(`subtype: '${prop.subtype}'`)
  }

  if (prop.class) {
    parts.push(`class: ${prop.class}`)
  }

  result += `${parts.join(', ')} }`
  return result
}

function cleanRef (ref) {
  return ref.replace(/^#\/definitions\/io\.k8s\./, '')
}

function getRefs (spec, refs = new Set()) {
  for (const key in spec) {
    const val = spec[key]
    if (key === '$ref' && typeof val === 'string') {
      refs.add(cleanRef(val))
    } else if (typeof val === 'object') {
      getRefs(val, refs)
    }
  }

  return refs
}

function getReqs (name, spec) {
  const myPath = path.join('types', ...name.split('.').slice(0, -1))
  const reqs = [
    { name: 'Base', path: path.relative(myPath, path.join('lib', 'base')) }
  ]

  const refs = getRefs(spec)
  for (const ref of refs.values()) {
    const segments = ref.split('.').slice(0, -1)
    const name = getTypeName(ref)
    const rel = path.relative(myPath, path.join('types', ...segments, name))
    reqs.push({
      name,
      path: rel.startsWith('.') ? rel : `./${rel}`
    })
  }

  return reqs
}

function getProps (spec) {
  const props = []
  const gvk = spec['x-kubernetes-group-version-kind']
  for (const name in spec.properties || {}) {
    if (gvk && ['apiVersion', 'kind'].includes(name)) {
      continue
    }

    const prop = spec.properties[name]

    // single reference
    if (typeof prop.$ref === 'string') {
      props.push({
        name,
        class: getTypeName(cleanRef(prop.$ref))
      })
      continue
    }

    if (prop.type === 'array') {
      if (typeof prop.items.$ref === 'string') {
        props.push({
          name,
          type: 'array',
          class: getTypeName(cleanRef(prop.items.$ref))
        })
        continue
      } else {
        props.push({
          name,
          type: 'array',
          subtype: prop.items.type
        })
        continue
      }
    }

    props.push({
      name,
      type: prop.type
    })
  }

  return props
}

function generate (name, spec) {
  const reqs = getReqs(name, spec)
  const props = getProps(spec)
  const files = [{
    dir: path.resolve(__dirname, '..', '..', 'types', ...name.split('.').slice(0, -1)),
    file: `${getTypeName(name)}.js`,
    content: template(name, reqs, props)
  }]

  return files
}

module.exports = generate
