import { Model } from 'backbone'
import _ from 'mods/utils'
import browser from 'mods/browser'

const FIRST_PAGE = 0
export default class extends Model {

  @_.Memoize()
  getImageType() {
    var data = this.get('images')[FIRST_PAGE]
      , src = data.web && data.web.src
      , type = src['default']

    if (browser.webp && src.webp) {
      type = 'webp'
    }

    return type
  }

  getImage(index) {
    var data = this.get('images')[index]
      , web = data.web
      , type = this.getImageType()

    return {
      ..._.pick(web, 'width', 'height')
    , src: web.src[type]
    }
  }

  getImages(){
    return this.get('images').map((image, index) => { return this.getImage(index) })
  }

  getBookCoverSize() {
    var cover = this.getImage(FIRST_PAGE)
    return {
      width: Math.ceil(cover.width / cover.height * 220)
    , height: 220
    }
  }

  getCanvasModelInfo() {
    return {
      totalPage: this.get('images').length
    }
  }

  getBookCoverImg() {
    return {
      ...this.getImage(FIRST_PAGE)
    , ...this.getBookCoverSize()
    }
  }

  getCurrentImageUri(page) {
    var { src } = this.getCurrentImage(page)
    return src
  }

  getNaturalAverageDiagonal() {
    var images = this.getImages()
      , number = images.length
      , sum = _.reduce(images, (memo, image) => {
          var diagonal = _.rectangleDiagonal(image.width, image.height)
          return memo + diagonal
        }, 0)

    return sum / number
  }

  getCurrentImage(page) {
    return this.getImage(page - 1)
  }

  getThumbnails() {
    var imgs = this.get('images')
      , rootSrc = this.get('thumbnails').path
      , thumbHeight = this.get('thumbnails').height
    return (
      this.getImages().map(function (image, index) {
        return {
          src: `${rootSrc}#${index}`
        , page: `${index+1}`
        , size: {
            width: Math.ceil(image.width * thumbHeight / image.height)
          , height: thumbHeight
          }
        }
      })
    )
  }

  getTitle() {
    return this.get('name')
  }

  getUUID() {
    return this.get('content_json_uuid')
  }
}
