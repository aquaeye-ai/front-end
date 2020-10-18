import React, { Component } from 'react';
import io from 'socket.io-client';
import { 
  Container, 
  Row, 
  Col, 
  ButtonGroup, 
  Button, 
  OverlayTrigger,
  Tooltip,
  Image,
	Nav
} from 'react-bootstrap';
import { Drawer } from 'antd';
import {
  faPlay,
  faPause,
  faBrain,
  faUndo,
	faFish,
  faAngleRight,
	faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import ReefLagoonDatabase from './ReefLagoonDatabase';
import './Player.scss';

let socket = io('http://localhost:5000')

export default class Player extends Component {
  constructor(props) {
		super(props);

    this.handleThreshold = this.handleThreshold.bind(this);
    this.handleK = this.handleK.bind(this);
		this.showParentFishGalleryDrawer = this.showParentFishGalleryDrawer.bind(this);
		this.onCloseParentFishGalleryDrawer = this.onCloseParentFishGalleryDrawer.bind(this);
 	 	this.showChildFishGalleryDrawer = this.showChildFishGalleryDrawer.bind(this);
  	this.onCloseChildFishGalleryDrawer = this.onCloseChildFishGalleryDrawer.bind(this);
  
		this.state = {
			streamId: this.props.match.params.id,
			streamData: {},
			threshold: 0.50,
      K: 1,
      parentFishGalleryDrawerVisible: false,
      childrenFishGalleryDrawerVisible: {
        chelmon_rostratus: false,
        acanthurus_triostegus: false,
        monodactylus_argenteus: false,
        trachinotus_mookalee: false
      }
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
  
  play() {
    try {
			socket.on('image', image => {
				const imageElm = document.getElementById('streamImage');
				imageElm.src = `data:image/jpeg;base64,${image}`;
			});
    } catch (error) {
      console.log('play:error');
      console.log(error);
    }
  }

  pause() {
    try {
      socket.off('image');
    } catch (error) {
      console.log('pause:error');
      console.log(error);
    }
  }

  handleThreshold(e) {
		console.log(e.target.value);
    this.setState({
      threshold: parseFloat(e.target.value).toFixed(2)
    });
  }
  
	handleK(e) {
		console.log(e.target.value);
    this.setState({
      K: parseFloat(e.target.value)
    });
  }

  renderThresholdTooltip = (props) => (
    <Tooltip id="threshold-tooltip" {...props}>
      Threshold that must be met before prediction from model is deemed correct
    </Tooltip>
  );
  
  renderKTooltip = (props) => (
    <Tooltip id="k-tooltip" {...props}>
      Number of predictions to return when predictions are sorted in descending order based on probability 
    </Tooltip>
  );
  
  renderPredictTooltip = (props) => (
    <Tooltip id="predict-tooltip" {...props}>
      Ask the AI what fish is in current selection
    </Tooltip>
  );
  
  renderUndoTooltip = (props) => (
    <Tooltip id="undo-tooltip" {...props}>
      Undo latest selection
    </Tooltip>
  );

  showParentFishGalleryDrawer() {
    this.setState({
      parentFishGalleryDrawerVisible: true
    });
  };
  
  onCloseParentFishGalleryDrawer() {
    this.setState({
      parentFishGalleryDrawerVisible: false
    });
  };

  showChildFishGalleryDrawer(id) {
    var visibleState = this.state.childrenFishGalleryDrawerVisible;
    visibleState[id] = true;

    this.setState({
      childrenFishGalleryDrawerVisible: visibleState
    });
  };
  
  onCloseChildFishGalleryDrawer(id) {
    var visibleState = this.state.childrenFishGalleryDrawerVisible;
    visibleState[id] = false;

    this.setState({
      childrenFishGalleryDrawerVisible: visibleState
    });
  };

  renderFishGalleryChildrenDrawers = (gallery_info) => (
    Object.keys(gallery_info).map((key, idx) => {
      let fish = gallery_info[key]

      return (
        <React.Fragment key={idx}>
          <h1>{fish.common_name}</h1>
          <Image src={fish.thumbnail.url} fluid rounded/>
          <p className="photo-credit">
            Photo credit: <a href={fish.thumbnail.credit.owner.url}>{fish.thumbnail.credit.owner.name}</a>,&nbsp;  
            <a href={fish.thumbnail.credit.license.url}>{fish.thumbnail.credit.license.name}</a> via Wikimedia Commons
          </p>
          <Button variant="primary" onClick={() => this.showChildFishGalleryDrawer(fish.scientific_name)}>
            Learn more 
            <FontAwesomeIcon icon={faAngleRight} />
          </Button>
          <Drawer
            title={fish.common_name}
            width={320}
            closable={false}
            onClose={() => this.onCloseChildFishGalleryDrawer(fish.scientific_name)}
            visible={this.state.childrenFishGalleryDrawerVisible[fish.scientific_name]}
          >
            <Image src={fish.thumbnail.url} fluid rounded/>
            <p className="photo-credit">
              Photo credit: <a href={fish.thumbnail.credit.owner.url}>{fish.thumbnail.credit.owner.name}</a>,&nbsp;  
              <a href={fish.thumbnail.credit.license.url}>{fish.thumbnail.credit.license.name}</a> via Wikimedia Commons
            </p>
            <p className="detail">
              <span className="header">Species: </span>
              {fish.scientific_name}
            </p>
            <p className="detail">
              <span className="header">Status: </span>
              {fish.status}
            </p>
            <p className="detail">
              <span className="header">Diet: </span>
              {fish.diet}
            </p>
            <p className="detail">
              <span className="header">Reproduction: </span>
              {fish.reproduction}
            </p>
            <p className="detail header">Learn more</p>
            <Nav className="flex-column">
              {
                fish.info_urls.map((info, idy) => (
                  <Nav.Link href={info.url} target="_blank" key={idx+idy}>
                    {idy}. {info.name}
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </Nav.Link>
                ))
              }
            </Nav> 
          </Drawer>
        </React.Fragment>
      )
    })
  );

	render() {
		return (
			<div className="App">
				<Header />
        <Body>
					{/*<video controls muted autoPlay>
							<source type="video/webm" id="videoSource"></source>
					</video>
					<canvas id="canvasImg" height="1080" width="1920"></canvas>*/}
          <Container fluid>
            <Row>
              <Col>
					      <h1>{ this.state.streamData.name }</h1>
              </Col>
            </Row>
            <Row>
              <Col>
                <div className="video-controls">
                  <ButtonGroup vertical className="controls">
                    <Button onClick={this.play}>
                      Play
                      <FontAwesomeIcon icon={faPlay} />
                    </Button>
                    <Button onClick={this.pause}>
                      Pause
                      <FontAwesomeIcon icon={faPause} />
                    </Button>
                    
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={this.renderPredictTooltip}
                    >
                      <Button>
                        Predict
                        <FontAwesomeIcon icon={faBrain} />
                      </Button>
                    </OverlayTrigger>
                    
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={this.renderUndoTooltip}
                    >
                      <Button>
                        Undo
                        <FontAwesomeIcon icon={faUndo} />
                      </Button>
                    </OverlayTrigger>
                  
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={this.renderKTooltip}
                    >
                      <Button variant="primary" onClick={this.showParentFishGalleryDrawer}>
                        In this exhibit	
                        <FontAwesomeIcon icon={faFish} />
                      </Button>
                    </OverlayTrigger>
                  </ButtonGroup>
                </div>

                <div className="slider-control">
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={this.renderThresholdTooltip}
                  >
                    <p>Prediction Threshold: {this.state.threshold}</p>
                  </OverlayTrigger>
                  <input id="sliderThreshold" type="range" value={this.state.threshold} min="0" max="1" step="any" list="steplistThreshold" onChange={this.handleThreshold} />
                  <datalist id="steplistThreshold">
                    <option value="0">0</option>
                    <option value="1">1</option>
                  </datalist>
                </div>

                <div className="slider-control">
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={this.renderKTooltip}
                  >
                    <p>K: {this.state.K}</p>
                  </OverlayTrigger>
                  <input id="sliderK" type="range" value={this.state.K} min="1" max="5" step="1" list="steplistK" onChange={this.handleK} />
                  <datalist id="steplistK">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </datalist>
                </div>

								<Drawer
									title="Fish in this Exhibit"
									width={520}
									closable={false}
									onClose={this.onCloseParentFishGalleryDrawer}
									visible={this.state.parentFishGalleryDrawerVisible}
								>
                  {this.renderFishGalleryChildrenDrawers(ReefLagoonDatabase)}
								</Drawer>

              </Col>

              <Col xs={10} className="stream-image-container">
                {/*<img id="streamImage" alt="stream"/>*/}
					      <Image id="streamImage" fluid alt="stream"/>
              </Col>
            </Row>
          </Container>
        </Body>
				<Footer />
			</div>
		)
	}
}
