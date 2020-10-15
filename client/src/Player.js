import React, { Component } from 'react'
import io from 'socket.io-client'
import { Button, ButtonGroup, Container, Row, Col } from 'shards-react';
import {
  faPlay,
  faPause,
  faBrain,
  faUndo
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import './Player.scss';

let socket = io('http://localhost:5000')

export default class Player extends Component {
  constructor(props) {
		super(props);

    this.handleThreshold = this.handleThreshold.bind(this);
    this.handleK = this.handleK.bind(this);

		this.state = {
			streamId: this.props.match.params.id,
			streamData: {},
			threshold: 1
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

  handleThreshold(e) {
		console.log(e.target.value);
    this.setState({
      threshold: parseFloat(e.target.value)
    });
  }
  
	handleK(e) {
		console.log(e.target.value);
    this.setState({
      K: parseFloat(e.target.value)
    });
  }

	render() {
		return (
			<div className="App">
				<Header />
        <Body>
					<h1>{ this.state.streamData.name }</h1>
					{/*<video controls muted autoPlay>
							<source type="video/webm" id="videoSource"></source>
					</video>
					<canvas id="canvasImg" height="1080" width="1920"></canvas>*/}
          <div className="stream-image-container">
          </div>
          <Container>
            <Row>
              <Col className="stream-image-container">
					      <img id="streamImage" alt="stream"/>
              </Col>
            </Row>
            <Row>
              <Col>
                <ButtonGroup>
                  <Button>
                    Start
                    <FontAwesomeIcon icon={faPlay} />
                  </Button>
                  <Button>
                    Pause
                    <FontAwesomeIcon icon={faPause} />
                  </Button>
                  <Button>
                    Predict
                    <FontAwesomeIcon icon={faBrain} />
                  </Button>
                  <Button>
                    Undo
                    <FontAwesomeIcon icon={faUndo} />
                  </Button>
                </ButtonGroup>
              </Col>
              <Col>
								<input id="sliderK" type="range" value={this.state.threshold} min="0" max="1" step="any" list="steplistK" onChange={this.handleThreshold} />
								<datalist id="steplistK">
									<option value="0">0</option>
									<option value="1">1</option>
								</datalist>
              </Col>
              <Col>
								<input id="sliderThreshold" type="range" value={this.state.K} min="1" max="5" step="1" list="steplistThreshold" onChange={this.handleK} />
								<datalist id="steplistThreshold">
									<option value="1">1</option>
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4">4</option>
									<option value="5">5</option>
								</datalist>
              </Col>
            </Row>
          </Container>
        </Body>
				<Footer />
			</div>
		)
	}
}
