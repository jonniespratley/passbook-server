import React from 'react'
import Link from 'next/link';

import ListGroup from './list-group';

export default class extends React.Component {
  render() {
    const items = this.props.items;
    console.log('List', 'render', this);
    let item = {};
    if(!items){
      return (<p>No Items</p>)
    }
    return (
      <div className='list-group'>
        {this.props.items && this.props.items.map((item, index) => (<Link key={index} href={{pathname: '/browse',query: {id: item._id}}}><a className='list-group-item'>{item._id}</a></Link>))}
      </div>
    )
  }
}
