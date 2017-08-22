import React from 'react'

export default class extends React.Component {
  static async getInitialProps ({ req }) {
    console.log(req);
    return req
      ? { userAgent: req.headers['user-agent'] }
      : { userAgent: navigator.userAgent }
  }
  render () {
    return (
      <div className='card'>
        <div className='card-header'>
          <h4>Hello Card</h4>
        </div>
        <pre>props = {JSON.stringify(this.props)}</pre>
      </div>
    )
  }
}
