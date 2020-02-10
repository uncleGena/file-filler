const chokidar = require('chokidar');
const shell = require('shelljs')
const minimist = require('minimist')
const dargs = require('dargs')
const path = require('path')
const fs = require('fs')

const WATCH_DIR = '.'

const ignoredFolders = [
  'node_modules',
  '.git',
  '_templates',
  '__tests__',
  '.nuxt',
  '.vscode'
]

let watcher = chokidar.watch(WATCH_DIR, {
  ignored: ignoredFolders.map(f => '**/' + f + '/**'),
  ignoreInitial: true,
  persistent: true
});

function doTheWork(path: string, argv: any) {
  const { pathToFile, fileNameWithExtension, fileName, fileExtension, hasContent } = parseFilePath(path)

  // pause watching for new files in order to prevent recursion 
  // because now we will create new files by hygen
  watcher.unwatch('*.*')

  const argsString = objToArguments(argv)

  Object.keys(argv).map(generator => {
    const generatorValue = argv[generator]
    if (typeof generatorValue === 'string' && path.includes(generatorValue)) {
      if (!hasContent) {
        shell.exec(`HYGEN_OVERWRITE=1 hygen ${generator} new --fileNameWithExtension ${fileNameWithExtension} --pathToFile ${pathToFile} --fileName ${fileName} --fileExtension ${fileExtension} ${argsString}`)
      }
    }
  })
  // after creating new files, start watch again
  watcher.add(WATCH_DIR)
}

function stripPath(p: string) {
  const pathToFile = p.replace(/\/[^\/]+$/, '')
  return pathToFile
}

function parseFilePath(p: string) {
  return {
    pathToFile: stripPath(p),
    fileNameWithExtension: path.basename(p),
    fileName: path.basename(p).split('.')[0],
    fileExtension: path.basename(p).split('.').reverse()[0],
    hasContent: fs.readFileSync(p, 'utf8')
  }
}

function argsToObject(args: string[]) {
  return minimist(args.slice(2))
}

function objToArguments(obj: object) {
  return ' ' + dargs(obj).join(' ') + ' '

}

export function cli(args: string[]) {
  var argv = argsToObject(args);
  watcher.on('add', (path: string) => doTheWork(path, argv))
}