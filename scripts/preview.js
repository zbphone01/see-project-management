// Only for local verification of the production output.
const express = require('express')
const path = require('path')
const fs = require('fs')
const root = path.resolve(__dirname, '../dist')

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('请先执行 pnpm build 生成 dist。')
  process.exit(1)
}

const app = express()
app.use(express.static(root))
app.listen(4173, '127.0.0.1', function () {
  console.log('预览地址：http://127.0.0.1:4173/')
})
