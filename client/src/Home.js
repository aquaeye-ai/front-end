import React, { Component } from 'react';
import { Link } from 'react-router-dom';
export default class Home extends Component {
    constructor() {
        super();
        this.state = {
            streams: []
        };
    }
    async componentDidMount() {
        try {
            const response = await fetch('http://localhost:4000/streams');
            const data = await response.json();
            console.log(data);
            this.setState({ streams: [...data] });
        } catch (error) {
            console.log(error);
        }
    }
    render() {
        return (
            <div className="App App-header">
                <div className="container">
                    <div className="row">
                        {this.state.streams.map(stream =>
                        <div className="col-md-4" key={stream.id}>
                            <Link to={`/player/${stream.id}`}>
                                <div className="card border-0">
                                    <img src={`data:image/jpeg;base64,${stream.poster}`} alt={stream.name} />
                                    <div className="card-body">
                                        <p>{stream.name}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}
