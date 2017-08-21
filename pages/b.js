import React from 'react'
import Layout from '../components/layout';
export default class extends React.Component {
  static async getInitialProps ({ req }) {
    console.log(req);
    return req
      ? { userAgent: req.headers['user-agent'] }
      : { userAgent: navigator.userAgent }
  }
  render () {
    return (
      <Layout>
        <div>
        Hello World {this.props.userAgent}
        </div>
      </Layout>
    )
  }
}
