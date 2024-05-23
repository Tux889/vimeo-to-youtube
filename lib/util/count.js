const colors = require('colors')
const pretty = require('prettysize')
const sugar = require('sugar/string').String
const sugarNum = require('sugar/number').Number
const { table } = require('table')

const { logger } = require('../logger')

const { findAll } = require('./database')
const { getBestDownloadOption, sortBySize } = require('./video')

const printVideos = videos => {
  const data = [ ['Name', 'Folder', 'Status', 'Size'] ]

  let totalSize = 0

  let countDownloaded = 0
  let countNotDownloaded = 0
  let countDownloading = 0
  let countFailed = 0

  videos.forEach(video => {
    const name = sugar.truncate(video.name.replace(/[\u0001-\u001A]/g, ''), process.stdout.columns - 36)
    // const folder = sugar.truncate(video.parent_folder.replace(/[\u0001-\u001A]/g, ''), process.stdout.columns - 36)
    // const folder = JSON.stringify(video.parent_folder.name, null, 4) ? null : ""
    const folder = video.parent_folder !== null ? `${video.parent_folder.name}` : ''
    // let folder = "" 
    // if (video.parent_folder !== null) {
    //   folder = video.parent_folder.name
    // }

    const size = getBestDownloadOption(video).size

    totalSize += size

    let status = sugar.titleize(video.status)

    switch (true) {
      case status.includes('Failed'): status = colors.red(status)
        countFailed += 1
        break
      case status.includes('Not'):
        countNotDownloaded += 1
        break
      case status.includes('ing'): status = colors.yellow(status)
        countDownloading += 1
        break
      case status.includes('ed'): status = colors.green(status)
        countDownloaded += 1
        break
    }

    data.push([name, folder, status, pretty(size)])
  })

  console.log(table(data))

  logger.info(`Total size: ${pretty(totalSize)} (${videos.length} videos)`)
  console.log(" --- ")
  logger.info(`Downloaded: ${countDownloaded} (${sugarNum(countDownloaded / videos.length * 100).round(2)}%)`)
  logger.info(`Not Downloaded: ${countNotDownloaded} (${sugarNum(countNotDownloaded / videos.length * 100).round(2)}%)`)
  logger.info(`Downloading: ${countDownloading} (${sugarNum(countDownloading / videos.length * 100).round(2)}%)`)
  logger.info(`Failed: ${countFailed} (${sugarNum(countFailed / videos.length * 100).round(2)}%)`)

  console.log(" --- ")
  console.log(" ")
}

module.exports.count = () => findAll().then(videos => sortBySize(videos)).then(videos => printVideos(videos))
