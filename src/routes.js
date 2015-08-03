import React from 'react'
import { Route, DefaultRoute } from 'react-router'

import AppView from 'views/app'
import BookIntroView from 'views/book_intro'
import ReaderView from 'views/reader/index'

// Combine the behavior of DefaultRoute and Redirect
//   See more: http://tinyurl.com/qj3zj57
function RedirectTo(destination, params = {}) {
  return class extends React.Component {
    static willTransitionTo(transition) {
      transition.redirect(destination, params)
    }

    render() {}
  }
}

export default (
   <Route path="/" handler={ AppView }>
     <DefaultRoute name="home" handler={ BookIntroView }/>
     <Route name="reader" path="reader">
        <Route name="page" path="page/:page" handler={ ReaderView } />
        <Route handler={ RedirectTo('page', { page: 1 }) } />
     </Route>
   </Route>
)
