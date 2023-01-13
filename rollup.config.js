// 通过rollup进行打包
// 1.获取打包文件  引入相关依赖
const ts = require('rollup-plugin-typescript2') // 解析ts
const json = require('@rollup/plugin-json')
const resolvePlugin = require('@rollup/plugin-node-resolve') // 解析第三方依赖
const path = require('path') // 处理路径
// 2. 获取文件路径
let packageDirPath = path.resolve(__dirname, 'packages')
console.log('路径==》', packageDirPath)
// 获取需要打包的包
let packageDir = path.resolve(packageDirPath, process.env.TARGET)
console.log('打包的包',packageDir)
// 获取到每个配置文件的配置
const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))
console.log('pkg==>', pkg)
const name = path.basename(packageDir)
console.log('包名==》', name)

// 创建映射表进行打包
const outputOptions = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es'
  },
  "cjs": {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs'
  },
  "global": {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife'
  }
}
const options = pkg.buildOptions
function createConfig(format, output) {
  output.name = options.name
  output.sourcemap = true
  return {
    input: resolve('src/index.ts'),
    output,
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      resolvePlugin()
    ]
  }
}
const resultConfig = options.formats.map(format => createConfig(format, outputOptions[format]))
module.exports = resultConfig
