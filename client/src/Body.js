import React from 'react';

class Body extends React.Component {
    render() {
      return (
        <div className="app-body">
          {this.props.children}
        </div>
      );
    }
}

export default Body;
