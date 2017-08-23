import Link from 'next/link';
import React from 'react';

export default class extends React.Component {
  render(){
    const item = this.props.item || {};
    console.log('ListGroupItem.render', item);
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
}
