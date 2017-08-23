import React from 'react'
import PassCard from '../components/pass-card';


export default class extends React.Component {
  render() {
    console.log('detail', 'render', this.props);
    let item = {};
    return (
      <div>
        <h3>{item._id}</h3>
        <div className="flex u-m">
          <PassCard pass={this.props.item}/>
        </div>
      </div>

    )
  }
}
