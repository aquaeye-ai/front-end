import React, { Component } from 'react'
import io from 'socket.io-client'
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

          //const sio_script = document.createElement('script');
          //sio_script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.1/socket.io.js";
          //sio_script.async = true;
          //this.div.appendChild(sio_script);

          //const img_script = document.createElement('script');
          //function img_script_func() { 
          //  const socket = io.connect('http://localhost:3000');
          //  socket.on('image', (image) => {
          //    const imageElm = document.getElementById('image');
          //    imageElm.src = `data:image/jpeg;base64,${image}`;
          //  });
          //};
          //img_script = img_script_func;
          //img_script.async = true;
          //this.div.appendChild(img_script);

					socket.on('image', data => {
						//this.setState({ data })		
						const imageElm = document.getElementById('image');
						imageElm.src = `data:image/jpeg;base64,${data}`;
					});
      } catch (error) {
					console.log('error');
          console.log(error);
      }
  }
	render() {
		return (
			<div className="App">
				<header className="App-header">
					{/*<video controls muted autoPlay>
							<source src={`http://localhost:4000/video/${this.state.videoId}`} type="video/mp4"></source>
					</video>*/}
					<h1>{ this.state.streamData.name }</h1>
					<img id="image"/>
					{/*<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.1/socket.io.js"></script>
					<script>
						const socket = io.connect('http://localhost:3000');
						socket.on('image', (image) => {
							const imageElm = document.getElementById('image');
							imageElm.src = `data:image/jpeg;base64,${image}`;
						});
					</script>*/}
				</header>
			</div>
		)
	}
}
