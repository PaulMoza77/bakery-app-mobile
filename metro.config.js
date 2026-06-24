const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { resolve } = require('metro-resolver')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

const nodeStubPath = path.resolve(__dirname, 'shims/empty.js')

const nodeOnlyModules = new Set([
  'stream',
  'http',
  'https',
  'zlib',
  'net',
  'tls',
  'crypto',
  'ws',
  'bufferutil',
  'utf-8-validate',
])

const defaultResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (nodeOnlyModules.has(moduleName)) {
    return {
      filePath: nodeStubPath,
      type: 'sourceFile',
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform)
  }

  return resolve(context, moduleName, platform)
}

module.exports = config
