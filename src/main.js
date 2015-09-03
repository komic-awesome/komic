import 'normalize.css'
import './styles/index.styl'

import $ from 'jquery'
import React from 'react'
import Router from 'react-router'
import app from 'app'

import routes from 'routes'

$(document).on('click', 'a[href="#"]', (e) => {
  e.preventDefault()
})

var bookModel = app.createModel('book')
  , appViewWrapper = $('<div>', {'class': 'react-app-wrapper'})

$('body').prepend(appViewWrapper)

bookModel.fetch({ url: './content.json' })
  .done(() => {
    app.trigger('fetched:book')
    app.createModel('canvas')
    var router = Router.create({
      routes: routes
    , location: Router.HashLocation
    })
    router.run((Root) => {
      React.render(<Root model={ bookModel } />, appViewWrapper[0])
    })
    app.set('router', router)
  })
