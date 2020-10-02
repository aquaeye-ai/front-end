import React, { Component } from 'react'
export default class Player extends Component {
    constructor(props) {
        super(props);
        this.state = {
            streamId: this.props.match.params.id,
            streamData: {}
        };
    }
    async componentDidMount() {
        try {
            const res = await fetch(`http://localhost:4000/stream/${this.state.streamId}/data`);
            const data = await res.json();
            this.setState({ streamData: data });
        } catch (error) {
            console.log(error);
        }
    }
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <stream controls muted autoPlay>
                        <source src={`http://localhost:4000/stream/${this.state.streamId}`} type="stream/mp4"></source>
                    </stream>
                    <h1>{ this.state.streamData.name }</h1>
                </header>
            </div>
        )
    }
}