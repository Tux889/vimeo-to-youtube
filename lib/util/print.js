const colors = require('colors')
const pretty = require('prettysize')
const sugar = require('sugar/string').String
const { table } = require('table')

const { logger } = require('../logger')

const { findAll } = require('./database')
const { getBestDownloadOption, sortBySize } = require('./video')

const printVideos = videos => {
  const data = [ ['Name', 'Folder', 'Status', 'Size'] ]

  let totalSize = 0

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
        break
      case status.includes('Not'):
        break
      case status.includes('ing'): status = colors.yellow(status)
        break
      case status.includes('ed'): status = colors.green(status)
        break
    }

    data.push([name, folder, status, pretty(size)])
  })

  console.log(table(data))

  logger.info(`Total size: ${pretty(totalSize)} (${videos.length} videos)`)
}

module.exports.all = () => findAll().then(videos => sortBySize(videos)).then(videos => printVideos(videos))
