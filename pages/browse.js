import DetailPage from '../components/detail';
import ListGroup from '../components/list-group';
import ListPage from '../components/list';
import Layout from '../components/layout';

import React from 'react';
import Error from 'next/error';
import Link from 'next/link';
import fetch from 'isomorphic-fetch';
// TODO: Extract
const BASE_URL = 'http://localhost:3001/_admin/db';




class PassService {
  static async getPasses(params) {
    const res = await fetch(BASE_URL);
    const statusCode = res.statusCode > 200
      ? res.statusCode
      : false;
    const json = await res.json();
    console.log('getPasses', params, json);
    return {statusCode, docs: json};
  }
  static async getPass(id) {
    try {
      const res = await fetch(`${BASE_URL}/${id}`);
      const statusCode = res.statusCode > 200
        ? res.statusCode
        : false;
      const json = await res.json();
      console.log('getPass', id, statusCode, json);
      return {statusCode, doc: json};
    } catch (e) {
      console.error('getPass', statusCode, e);
    }
  }
}


/**
 * Browse Page
 * Handle 2 things
 * Either display a list of passes or get details?
 */
export default class BrowsePage extends React.Component {

  static async getInitialProps({req, query}) {
    if (query.id) {
      console.warn('Get 1 pass', query);
      const resp = await PassService.getPass(query.id);
      return resp;
    } else {
      console.warn('Get all passes');
      const resp = await PassService.getPasses();
      return resp;
    }
  }

  render() {
    console.log('Browse page', this);
    if (this.props.statusCode) {
      ////return <Error statusCode={this.props.statusCode}/>;
    }
    const docs = this.props.docs && this.props.docs.filter(row => (row.docType === 'pass'));
    const doc = this.props.doc;

    return (
      <Layout title='Browse'>
        <div>
          <nav className='breadcrumb'>
            <Link href='/'><a className='breadcrumb-item'>Home</a></Link>
            <Link href='/browse'><a className='breadcrumb-item'>Browse</a></Link>
            <span className='breadcrumb-item'>{doc && doc._id}</span>
          </nav>
        </div>
        <p>Documents: {docs && docs.length}</p>
        {docs && <ListPage items={docs}/>}
        {doc && <DetailPage item={doc}/>}
      </Layout>
    );
  }
}
