#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const VERSION = require('./package.json').version

function template (filename) {
  return `<template>
  <div class="${filename}-wrapper">${filename}</div>
</template>

<script type="text/ecmascript-6">
  export default{}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>`
}

// 将函数第一个字母转成大写
function upperFirstword (word) {
  let start = word.substring(0, 1).toUpperCase()
  let end = word.substring(1)
  return start + end
}


function write (path,data,chartset='utf-8') {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err)=>{
      err ? reject(err) : resolve()
    })
  })
}

/**
 * [mkdirDirectory description]
 * @param  {[type]} str        [description]
 * @param  {[type]} vieworbase [讲文件创建在src/components或者src/views]
 * @return {[type]}            [description]
 */
function mkdirDirectory (filename,comporview) {
  return new Promise((resolve, reject) => {
    let createPath = comporview === '-c' ?  path.join(process.cwd(),'/src/components/',filename) : path.join(process.cwd(),'/src/views/',filename)
    fs.mkdir(createPath,(err)=>{err ? reject(err) : resolve(createPath) })
  })
}

function appendRouter (filename,comporview) {
  return new Promise((resolve, reject) => {
    let routerPath = path.join(process.cwd(),'/src/router/index.js')
    let importName = ''
    if (/(-|_)/.test(filename)) {
      let arr = filename.match(/(\w+)/g)
      arr.forEach(item=>{importName += upperFirstword(item)})
    }else {
      importName = upperFirstword(filename)
    }
    let data = comporview === '-c' ? `\nimport ${importName} from '@/components/${filename}/${filename}'` : `\nimport ${importName} from '@/views/${filename}/${filename}'`
    fs.appendFile(routerPath, data, 'utf8', (err) => { err ? reject(err) : resolve() })
  })
}

async function createVue () {
  let args = process.argv
  let comporview = args[2]
  if (comporview === '-help') {
    console.log(chalk.green('please check terminal directory,make sure it works same with the path of package.json. second param is one of: [-v,-c,-help,-version]'))
    console.log(chalk.green('if use mac, install version 1.0.0。if use windows, install version 1.0.1'))
    console.log(chalk.green('-c, create file in src/components,')+chalk.red('src/components must be exists first'))
    console.log(chalk.green('-v, create file in src/views,')+chalk.red('src/views must be exists first'))
    console.log(chalk.green('-version, check version'))
    return
  }
  if (comporview === '-version') {
    console.log(chalk.green(VERSION))
    return
  }
  let filenames = args.slice(3)
  if (!filenames.length) {
    return Promise.reject('at least create one file,input filename after second param')
  }
  filenames.forEach(async filename=>{
    try {
      let createPath = await mkdirDirectory(filename,comporview)
      let dir = path.join(createPath,`${filename}.vue`)
      let str = template(filename)
      await write(dir,str)
      await appendRouter(filename,comporview)
    } catch(e) {
      return Promise.reject(e)
    }
  })
}

createVue().catch(e=>console.log(chalk.red(e)))