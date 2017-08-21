import Layout from '../components/layout';

import React from 'react';
import Error from 'next/error';
import Link from 'next/link';
import fetch from 'isomorphic-fetch';

const DetailPage = ({item}) => {
  let props = [];
  for (let key in item) {
    //props.push({name: key, value: item[key]});
    console.log('DetailPage', item);
  }
  return (
    <div>
      <h3>{item._id}</h3>

    </div>
  )
};

const ListPage = ({items}) => {
  return (
    <div>
      <div>Docs: {items.length}</div>
      <ul className="list-group">
        {items && items.map((item, index) => {
          <ListItem key={index} item={item}/>
        })}
      </ul>
    </div>
  )
};

const ListItem = ({item}) => {
  return (
    <li key={item._id} className="list-group-item list-group-item-action">
      <Link href={{
        pathname: '/browse',
        query: {
          id: item._id
        }
      }}>
        <div className="d-flex w-100 justify-content-between">
          <div className="w-100">
            <h5 className="mb-1">{item.description}</h5>
            <small>{item.lastUpdated}</small>
            <small>{item.passTypeIdentifier}</small>
          </div>
          <div>
            <img src={`/images/${item.type}.png`}/>
          </div>
        </div>
      </Link>
    </li>
  );
}

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
    if (this.props.statusCode) {
      return <Error statusCode={this.props.statusCode}/>;
    }
    const docs = this.props.docs && this.props.docs.filter(row => (row.docType === 'pass'));
    const doc = this.props.doc;
    return (
      <Layout title='Browse'>
        {docs && <ListPage items={docs}/>}
        {doc && <DetailPage item={doc}/>}
      </Layout>
    );
  }
}
