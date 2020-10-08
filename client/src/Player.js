import React, { Component } from 'react'
import io from 'socket.io-client'
import Header from './Header';
import Footer from './Footer';

let socket = io('http://localhost:5000')

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

			//const imageDecoded = new Image();
			//const canvasElm = document.getElementById('canvasImg');
			//const ctx = canvasElm.getContext("2d");
			//imageDecoded.onload = () => {
			//	ctx.drawImage(imageDecoded, 0, 0);
			//};

			// we need to reconnect each time we mount the component since we disconnect on 'componentWillUnmount' below
			socket.connect('http://localhost:5000');
			socket.on('image', image => {
				const imageElm = document.getElementById('streamImage');
				imageElm.src = `data:image/jpeg;base64,${image}`;
				
				//const videoElm = document.getElementById('videoSource');
				//videoElm.src = `data:image/jpeg;base64,${image}`;
				
				//imageDecoded.src = `data:image/jpeg;base64,${image}`;
			});
		} catch (error) {
			console.log('componentDidMount:error');
			console.log(error);
		}
  }
  async componentWillUnmount() {
		try {
			/* disconnect socket so that when we leave stream page, the socket doesn't keep reading the stream and attempting to 
			set the image element */
			socket.disconnect();
		} catch (error) {
			console.log('componentWillUnmount:error');
			console.log(error);
		}
	}
	render() {
		return (
			<div className="App">
				<Header />
				<header className="App-header">
					<h1>{ this.state.streamData.name }</h1>
					{/*<video controls muted autoPlay>
							<source type="video/webm" id="videoSource"></source>
					</video>
					<canvas id="canvasImg" height="1080" width="1920"></canvas>*/}
					<img id="streamImage"/>
				</header>
				<Footer />
			</div>
		)
	}
}
