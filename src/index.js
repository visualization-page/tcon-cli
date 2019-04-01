const { exec } = require('child_process')
const path = require('path')
const Ora = require('ora')
const spinner = new Ora()
const fs = require('fs').promises
const tconSrc = path.resolve(__dirname, '../node_modules', 'tcon/src')
const tmpDir = path.resolve(__dirname, './tmp')

const execSync = cmd => new Promise((res, rej) => {
  exec(cmd, err => {
    if (err) {
      rej(err)
    } else {
      res()
    }
  })
})

const bakSrc = async () => {
  const has = await fs.readdir(tmpDir).then(() => true).catch(() => false)
  if (!has) {
    await execSync(`cp -rf ${tconSrc} ${tmpDir}`)
  }
}

const transfer = (varPath) => {
  // 将自定义 json 转换为 styl
  const originPath = path.resolve(__dirname, '../', varPath)
  const cus = require(originPath)

  let res = '@import "./var.styl"\n'
  let isObj = false
  let objNum = 0
  const spread = (obj) => {
    let content = ''
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        content += `${isObj ? `['${key}']` : key} = ${obj[key]}\n`
        isObj = false
      } else {
        res += objNum === 0 ? key : `['${key}']`
        isObj = true
        objNum++
        return spread(obj[key])
      }
    })
    res += `${content}`
    return content
  }

  spread(cus)
  return res
}

const write = async (res) => {
  const oPath = `${tconSrc}/custom.styl`
  await fs.writeFile(oPath, res, 'utf8')
  // console.log('写入成功')
  const dirs = await fs.readdir(tconSrc)
  const all = []

  dirs.forEach(dir => {
    all.push(new Promise(async resolve => {
      if (!/\.styl$/.test(dir)) {
        const originFile = `${tmpDir}/${dir}/index.styl`
        const targetFile = `${tconSrc}/${dir}/index.styl`

        let con = await fs.readFile(originFile, 'utf8')
        con = con.replace(/var\.styl/, () => 'custom.styl')
        await fs.writeFile(targetFile, con, 'utf8')
        // console.log(`${dir} var.styl => custom.styl 成功`)
      }
      resolve()
    }))
  })

  return Promise.all(all)
}

const buildDist = async (tarPath) => {
  const tconPath = path.resolve(__dirname, '../node_modules', 'tcon')
  const hasDir = await fs.readdir(tarPath).catch(() => false)
  if (hasDir === false) {
    spinner.fail(`目录不存在 ${tarPath}`)
    process.exit(0)
  }

  const json = require(`${tconPath}/package.json`)
  const modifyPath = name => `stylus src/${name === 'tcon' ? '' : `${name}/`}index.styl -o ${path.resolve(tarPath, `${name}.css`)} --compress`
  const tconDirs = ['', 'size', 'layout', 'color', 'text', 'border', 'shadow', 'reset', 'button']
  const modify = () => {
    tconDirs.forEach(i => {
      if (i === '') {
        json.scripts.release = modifyPath('tcon')
      } else {
        json.scripts[i] = modifyPath(i)
      }
    })
  }
  modify()
  await fs.writeFile(`${tconPath}/package.json`, JSON.stringify(json, null, 2), 'utf8')
  await execSync([`cd ${tconPath}`].concat(tconDirs.map(dir => `npm run ${dir ? dir : 'release'}`)).join(' && '))
}

module.exports = async (varPath, tarPath) => {
  spinner.start('写入中...')
  await bakSrc()
  const originPath = path.resolve(process.cwd(), varPath)
  const result = await transfer(originPath)

  await write(result)

  const buildPath = path.resolve(process.cwd(), tarPath)
  await buildDist(buildPath)
  spinner.succeed(`写入完成 ${buildPath}`)
}
