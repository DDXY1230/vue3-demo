// 进行打包
// 1.获取打包文件
const execa = require('execa')
// 2. 进行打包 并行打包
async function build(target) {
  console.log('target==>',target)
  // -c 表示执行rollup的配置, 环境变量 -c 打包 -cw 实时自动打包
  await execa('rollup', ['-cw','--environment',`TARGET:${target}`],{stdio:'inherit'})
}
// build('reactivity')
build('runtime-dom')