import Link from 'next/link';
import React from 'react';
import ListGroupItem from './list-group-item';

export default class extends React.Component{
  render(){
    const items = this.props.items || [];
    console.log('ListGroup', items);
    
    return (
      <div>
        <ul className="list-group">
          {items && items.map((item, index) => {
            <ListGroupItem key={index} item={item}/>
          })}
        </ul>
      </div>
    )
  }
}
