const semver = require('semver')
const expected = require('../package.json').engines.node

if (!semver.satisfies(process.version, expected)) {
  console.error('需要 Node.js ' + expected + '，当前为 ' + process.version)
  process.exit(1)
}
console.log('Node.js 环境检查通过：' + process.version)
