'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

const spec = require('./swagger')

const generators = {
  type: require('./lib/generators/type'),
  resource: require('./lib/generators/resource')
}

for (const key in spec.definitions) {
  // deprecated definitions are all in this namespace
  if (key.startsWith('io.k8s.kubernetes')) {
    continue
  }

  const def = spec.definitions[key]
  const name = key.replace(/^io\.k8s\./, '')

  const types = generators.type(name, def)
  for (const file of types) {
    mkdirp.sync(file.dir)
    fs.writeFileSync(path.join(file.dir, file.file), file.content)
  }

  const resources = generators.resource(name, def)
  for (const file of resources) {
    mkdirp.sync(file.dir)
    fs.writeFileSync(path.join(file.dir, file.file), file.content)
  }
}
