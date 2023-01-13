1. 因为根目录package.json里面添加了
`"workspaces": ["packages/*"],`
所以安装typescript的时候命令应该是: `yarn add typescript -D -W`
2. 生成ts的配置文件: `npx tsc --init`
3. 由于vue3进行rollup打包的,我在这里也需要进行安装
`yarn add rollup rollup-plugin-typescript2 @rollup/plugin-node-resolve @rollup/plugin-json execa -D -W`