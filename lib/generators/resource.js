'use strict'

const path = require('path')

const { getTypeName, getResourceName } = require('../names')

const template = (name, reqs, gvk) => `'use strict'

${reqs.map(({ name, path }) => `const ${name} = require('${path}')`).join('\n')}

class ${getResourceName(name)} extends ${getTypeName(name)} {
  constructor (val) {
    super(Object.assign({
      apiVersion: '${gvk.version}',
      kind: '${gvk.kind}'
    }, val))
  }
}

module.exports = ${getResourceName(name)}
`

function cleanRef (ref) {
  return ref.replace(/^#\/definitions\/io\.k8s\./, '')
}

function getReqs (name, spec, gvk) {
  const myPath = path.join('resources', gvk.group, gvk.version)
  const reqs = [
    { name: getTypeName(name), path: path.relative(myPath, path.join('types', ...name.split('.').slice(0, -1), getTypeName(name))) }
  ]

  return reqs
}

function generate (name, spec) {
  const gvks = spec['x-kubernetes-group-version-kind']
  if (!gvks) {
    return []
  }

  return gvks.map(gvk => {
    const reqs = getReqs(name, spec, gvk)
    return {
      dir: path.resolve(__dirname, '..', '..', 'resources', gvk.group, gvk.version),
      file: `${gvk.kind}.js`,
      content: template(name, reqs, gvk)
    }
  })
}

module.exports = generate
