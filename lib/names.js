'use strict'

function getTypeName (name) {
  return `T${getResourceName(name)}`
}

function getResourceName (name) {
  return name.split('.').pop()
}

module.exports = {
  getTypeName,
  getResourceName
}
