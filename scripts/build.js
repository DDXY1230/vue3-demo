// 进行打包
// 1.获取打包文件
const fs = require('fs')
const execa = require('execa')
const dirs = fs.readdirSync('packages').filter(p => {
  // 不是文件夹的过滤掉
  if(!fs.statSync(`packages/${p}`).isDirectory()){
    return false
  }
  return true
}) // 同步拿到文件目录
console.log("拿到的文件夹",dirs)
// 2. 进行打包 并行打包
async function build(target) {
  console.log('target==>',target)
  // -c 表示执行rollup的配置, 环境变量
  await execa('rollup', ['-c','--environment',`TARGET:${target}`],{stdio:'inherit'})
}
async function runParaller(dirs, build) {
  // 遍历
  let result = []
  for(let item of dirs) {
    result.push(build(item))
  }
  return Promise.all(result)
}
runParaller(dirs, build).then(() => {
  console.log('成功')
})