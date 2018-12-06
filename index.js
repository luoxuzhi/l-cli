#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const VERSION = require('./package.json').version

function template (filename) {
  return `<template>
  <div class="${filename}-wrapper">${filename}</div>
</template>

<script>
  export default{}
</script>

<style lang="stylus">

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
    fs.writeFile(path, data, (err)=>{ err ? reject(err) : resolve() })
  })
}

/**
 * [mkdirDirectory description]
 * @param  {[type]} vieworbase [将文件创建在src/components或者src/views]
 */
function mkdirDirectory (filename,directory) {
  return new Promise((resolve, reject) => {
    let createPath = directory === '-c' ?  path.join(process.cwd(),'/src/components/',filename) : directory === '-v' ? path.join(process.cwd(),'/src/views/',filename) : path.join(process.cwd(),'/src/pages/',filename)
    fs.mkdir(createPath,(err)=>{err ? reject(err) : resolve(createPath) })
  })
}

function appendRouter (filename,directory) {
  return new Promise((resolve, reject) => {
    let routerPath = path.join(process.cwd(),'/src/router/index.js')
    let importName = ''
    if (/(-|_)/.test(filename)) {
      let arr = filename.match(/(\w+)/g)
      arr.forEach(item=>{importName += upperFirstword(item)})
    }else {
      importName = upperFirstword(filename)
    }
    let data = directory === '-c' ? `\nimport ${importName} from '@/components/${filename}/${filename}'` : directory === '-v' ? `\nimport ${importName} from '@/views/${filename}/${filename}'` : `\nimport ${importName} from '@/pages/${filename}/${filename}'`
    fs.appendFile(routerPath, data, 'utf8', (err) => { err ? reject(err) : resolve() })
  })
}

function createVue () {
  let args = process.argv
  let directory = args[2]
  let filenames = args.slice(3)
  return new Promise((resolve, reject) => {
    if (directory === '-help') {
      console.log(chalk.green('please check terminal directory,make sure it works same with the path of package.json，second param is one of: [-v,-c,-p,-help,-version]'))
      console.log(chalk.green('-c, create file in src/components,')+chalk.red('src/components must be exists first'))
      console.log(chalk.green('-v, create file in src/views,')+chalk.red('src/views must be exists first'))
      console.log(chalk.green('-p, create file in src/views,')+chalk.red('src/pages must be exists first'))
      console.log(chalk.green('-version, check version'))
      resolve('')
    }
    else if (directory === '-version') {
      resolve(VERSION)
    }
    else if ( (directory === '-v' || directory === '-c' || directory === '-p') && !filenames.length) {
      reject('at least create one file,input filename after second param')
    }
    else if ( (directory === '-v' || directory === '-c' || directory === '-p') && filenames.length) {
      filenames.forEach(async filename =>{
        try {
          let createPath = await mkdirDirectory(filename,directory)
          let dir = path.join(createPath,`${filename}.vue`)
          let str = template(filename)
          await write(dir,str)
          await appendRouter(filename,directory)
        } catch(e) {
          reject(e)
        }
        resolve('created done !')
      })
    }
    else {
      reject('second param should be one of them: [-v,-c,-p,-help,-version]')
    }
  })
}

createVue().then(e=>console.log(chalk.green(e))).catch(e=>console.log(chalk.red(e)))