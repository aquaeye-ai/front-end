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
	faExternalLinkAlt,
  faPoll
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import ReefLagoonDatabase from './ReefLagoonDatabase';
import Fmt from './Fmt';
import './Player.scss';

let socket = io('http://localhost:5000')

export default class Player extends Component {
  constructor(props) {
		super(props);

    this.init = this.init.bind(this);

    // menu buttons
    this.play = this.play.bind(this);
    this.undo = this.undo.bind(this);
    this.handleK = this.handleK.bind(this);
    this.predict = this.predict.bind(this);
    this.handleThreshold = this.handleThreshold.bind(this);

    // mouse events
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.mouseMove = this.mouseMove.bind(this);

    // fish gallery
		this.showParentFishGalleryDrawer = this.showParentFishGalleryDrawer.bind(this);
		this.onCloseParentFishGalleryDrawer = this.onCloseParentFishGalleryDrawer.bind(this);
 	 	this.showChildFishGalleryDrawer = this.showChildFishGalleryDrawer.bind(this);
  	this.onCloseChildFishGalleryDrawer = this.onCloseChildFishGalleryDrawer.bind(this);

    // predict-one results
		this.showParentPredictOneResultsDrawer = this.showParentPredictOneResultsDrawer.bind(this);
		this.onCloseParentPredictOneDrawer = this.onCloseParentPredictOneDrawer.bind(this);
 	 	this.showChildPredictOneDrawer = this.showChildPredictOneDrawer.bind(this);
  	this.onCloseChildPredictOneDrawer = this.onCloseChildPredictOneDrawer.bind(this);
  
		this.state = {
			streamId: this.props.match.params.id,
			streamData: {},
			threshold: 0.50,
      K: 1,
      drag: false,
      rect: {
        x: 0,
        y: 0,
        h: 0,
        w: 0
      },
      predictOneResults: {
        id: null,
        top_k_classes: [],
        top_k_scores: []
      },
      parentFishGalleryDrawerVisible: false,
      childrenFishGalleryDrawerVisible: {
        chelmon_rostratus: false,
        acanthurus_triostegus: false,
        monodactylus_argenteus: false,
        trachinotus_mookalee: false
      },
      parentPredictOneDrawerVisible: false,
      childrenPredictOneDrawerVisible: {
        chelmon_rostratus: false,
        acanthurus_triostegus: false,
        monodactylus_argenteus: false,
        trachinotus_mookalee: false
      },
      numClasses: 1
		};
  }

  async componentDidMount() {
    // connect to the broadcasting port for the stream
		try {
			const stream_data_res = await fetch(`http://localhost:4000/stream/${this.state.streamId}/data`);
			const stream_data = await stream_data_res.json();
			this.setState({ streamData: stream_data });

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
			
      const num_classes_req_settings = {
        method: 'GET'
      };
      const num_classes_res = await fetch('http://localhost:4000/predict/num-classes', num_classes_req_settings);
      const num_classes_data = await num_classes_res.json(); 
      this.setState({ 
        numClasses: num_classes_data.num_classes,
        K: num_classes_data.num_classes
      }); 
		} catch (error) {
			console.log('componentDidMount:error');
			console.log(error);
		}

    this.canvas = document.getElementById('streamCanvas');
    this.canvas.height = 756;
    this.canvas.width = 1344;
    this.ctx = this.canvas.getContext('2d');
    this.canvasX = this.canvas.offsetLeft;
    this.canvasY = this.canvas.offsetTop;

    this.init();
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

  init() {
    this.canvas.addEventListener('mousedown', this.mouseDown, false);
    this.canvas.addEventListener('mouseup', this.mouseUp, false);
    this.canvas.addEventListener('mousemove', this.mouseMove, false);

    const predictOneBtn = document.getElementById('predictOne');
    predictOneBtn.disabled = true;
    
    const predictOneResultsBtn = document.getElementById('predictOneResults');
    predictOneResultsBtn.disabled = true;
  }

  mouseDown(e) {
    // auto pause when drawing 
    socket.off('image');

    const playBtn = document.getElementById('play');
    playBtn.disabled = false;

    const pauseBtn = document.getElementById('pause');
    pauseBtn.disabled = true;

    this.setState({
      rect: {
        x: e.offsetX, 
        y: e.offsetY,
        h: 0,
        w: 0 
      },
      drag: true
    });

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  mouseUp(e) {
    this.setState({
      drag: false
    });
  }

  mouseMove(e) {
    if (this.state.drag) {
      this.setState({
        rect: {
          x: this.state.rect.x,
          y: this.state.rect.y,
          h: e.offsetY - this.state.rect.y, 
          w: e.offsetX - this.state.rect.x
        }
      });

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.draw();
		  const predictOneBtn = document.getElementById('predictOne');
      predictOneBtn.disabled = false;
    };
  }

  draw() {
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeStyle = 'rgb(0, 255, 255)';
    this.ctx.strokeRect(this.state.rect.x, this.state.rect.y, this.state.rect.w, this.state.rect.h);
  }
  
  play() {
    try {
			socket.on('image', image => {
				const imageElm = document.getElementById('streamImage');
				imageElm.src = `data:image/jpeg;base64,${image}`;
			});
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
      const playBtn = document.getElementById('play');
      playBtn.disabled = true;

      const pauseBtn = document.getElementById('pause');
      pauseBtn.disabled = false;
    } catch (error) {
      console.log('play:error');
      console.log(error);
    }
  }

  pause() {
    try {
      socket.off('image');
    
      const playBtn = document.getElementById('play');
      playBtn.disabled = false;

      const pauseBtn = document.getElementById('pause');
      pauseBtn.disabled = true;
    } catch (error) {
      console.log('pause:error');
      console.log(error);
    }
  }
  
  async predict() {
    const imageElm = document.getElementById('streamImage');
    const jsonData = {
      frame: {
        id: 0,
        height: 756,
        width: 1344,
        depth: 3,
        K: this.state.numClasses,
        data: imageElm.src
      },
      rect: this.state.rect
    }
    const config = {
      method: 'POST',
      body: JSON.stringify(jsonData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch('http://localhost:4000/predict/one', config);
      const data = await response.json();

      this.setState({
        predictOneResults: data
      });
      
      const predictOneResultsBtn = document.getElementById('predictOneResults');
      predictOneResultsBtn.disabled = false;
    } catch (error) {
      console.log(error);
    }
  }
  
  //async predict() {
  //  console.log('predict');
  //  const settings = {
  //    method: 'GET'
  //  };

  //  try {
  //    const response = await fetch('http://localhost:4000/quote', settings);
  //    const data = await response.json();
  //    console.log(data);
  //  } catch (error) {
  //    console.log('predict:error');
  //    console.log(error);
  //  }
  //}
  
  undo() {
    try {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		  const predictOneBtn = document.getElementById('predictOne');
      predictOneBtn.disabled = true;
		  
      const predictOneResultsBtn = document.getElementById('predictOneResults');
      predictOneResultsBtn.disabled = true;
    } catch (error) {
      console.log('undo:error');
      console.log(error);
    }
  }

  handleThreshold(e) {
    this.setState({
      threshold: parseFloat(e.target.value).toFixed(2)
    });
  }
  
	handleK(e) {
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
  
  renderPlayTooltip = (props) => (
    <Tooltip id="threshold-tooltip" {...props}>
      Play livestream
    </Tooltip>
  );
  
  renderPauseTooltip = (props) => (
    <Tooltip id="threshold-tooltip" {...props}>
      Pause livestream
    </Tooltip>
  );
  
  renderPredictOneTooltip = (props) => (
    <Tooltip id="predict-tooltip" {...props}>
      Ask the AI what fish is in current selection
    </Tooltip>
  );
  
  renderPredictOneResultsTooltip = (props) => (
    <Tooltip id="predict-one-tooltip" {...props}>
      Show predict-one results 
    </Tooltip>
  );
  
  renderUndoTooltip = (props) => (
    <Tooltip id="undo-tooltip" {...props}>
      Remove selection
    </Tooltip>
  );
  
  renderFishGalleryTooltip = (props) => (
    <Tooltip id="fish-gallery-tooltip" {...props}>
      View gallery of fish species in this exhibit
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
  
  showParentPredictOneResultsDrawer() {
    this.setState({
      parentPredictOneDrawerVisible: true
    });
  };
  
  onCloseParentPredictOneDrawer() {
    this.setState({
      parentPredictOneDrawerVisible: false
    });
  };

  showChildPredictOneDrawer(id) {
    var visibleState = this.state.childrenPredictOneDrawerVisible;
    visibleState[id] = true;

    this.setState({
      childrenPredictOneDrawerVisible: visibleState
    });
  };
  
  onCloseChildPredictOneDrawer(id) {
    var visibleState = this.state.childrenPredictOneDrawerVisible;
    visibleState[id] = false;

    this.setState({
      childrenPredictOneDrawerVisible: visibleState
    });
  };
  
  renderPredictOneChildrenDrawers = (gallery_info) => (
    /* display predict-one results */
    this.state.predictOneResults.top_k_classes.map((r_key, r_idx) => {
      let first = false
      let foundFirst = false

      return (
        /* search through database to find matching entrie(s) with scores above threshold */
        Object.keys(gallery_info).map((key, idx) => {
          let fish = gallery_info[key]

          if (fish.common_group_name === r_key && this.state.predictOneResults.top_k_scores[r_idx] > this.state.threshold && (r_idx+1) <= this.state.K) {
            if (foundFirst === true) {
              first = false
            } else {
              first = true
              foundFirst = true
            }

            /* NOTE: there are several 'child' elements returned in lists and React requires these elements to possess unique 
             * 'key' attributes.  So, we do our best to provide unique 'key' attributes without collision. */
            return (
              <React.Fragment key={r_idx*idx}>
                {/* this trick works because in Javascript, 'true && expression' evaluates to 'expression' and 'false && expression' evaluates to 'false': https://reactjs.org/docs/conditional-rendering.html */} 
                {first === true &&
                  <React.Fragment key={2*r_idx*idx}>
                    <h1>{Fmt.capFirstLetter(r_key)}</h1>
                    <h2>Match: {Fmt.num(this.state.predictOneResults.top_k_scores[r_idx], {precision: 2, suffix: '%', multiplier: 1e2})}</h2>
                    <div className="divider"></div>
                  </React.Fragment>
                }
                <h3>{fish.common_name}</h3>
                <Image src={fish.thumbnail.url} fluid rounded/>
                <p className="photo-credit">
                  Photo credit: <a href={fish.thumbnail.credit.owner.url}>{fish.thumbnail.credit.owner.name}</a>,&nbsp;  
                  <a href={fish.thumbnail.credit.license.url}>{fish.thumbnail.credit.license.name}</a> via Wikimedia Commons
                </p>
                <Button variant="primary" onClick={() => this.showChildPredictOneDrawer(fish.scientific_name)}>
                  Learn more 
                  <FontAwesomeIcon icon={faAngleRight} />
                </Button>
                <Drawer
                  title={fish.common_name}
                  width={320}
                  closable={false}
                  onClose={() => this.onCloseChildPredictOneDrawer(fish.scientific_name)}
                  visible={this.state.childrenPredictOneDrawerVisible[fish.scientific_name]}
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
                        <Nav.Link href={info.url} target="_blank" key={r_idx+idx+idy}>
                          {idy}. {info.name}
                          <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </Nav.Link>
                      ))
                    }
                  </Nav> 
                </Drawer>
              </React.Fragment>
            )
          } else {
            /* We have to make a return statement for every case in a .map() call.
             * TODO: We could avoid this by directly using a mapping dict of common_group_names to keys in the database */
            return (<React.Fragment key={-1*(r_idx+idx+1)}></React.Fragment>) 
          }
        })
      )  
    })
  );

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
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={this.renderPlayTooltip}
                    >
                      <Button id="play" onClick={this.play}>
                        Play
                        <FontAwesomeIcon icon={faPlay} />
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={this.renderPauseTooltip}
                    >
                      <Button id="pause" onClick={this.pause}>
                        Pause
                        <FontAwesomeIcon icon={faPause} />
                      </Button>
                    </OverlayTrigger>
                    
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={this.renderUndoTooltip}
                    >
                      <Button id="undo" onClick={this.undo}>
                        Undo
                        <FontAwesomeIcon icon={faUndo} />
                      </Button>
                    </OverlayTrigger>
                    
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={this.renderFishGalleryTooltip}
                    >
                      <Button onClick={this.showParentFishGalleryDrawer}>
                        In this exhibit	
                        <FontAwesomeIcon icon={faFish} />
                      </Button>
                    </OverlayTrigger>
                    
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={this.renderPredictOneTooltip}
                    >
                      <Button id="predictOne" onClick={this.predict}>
                        Predict-One
                        <FontAwesomeIcon icon={faBrain} />
                      </Button>
                    </OverlayTrigger>
                    
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={this.renderPredictOneResultsTooltip}
                    >
                      <Button id="predictOneResults" onClick={this.showParentPredictOneResultsDrawer}>
                        Predict-One Results	
                        <FontAwesomeIcon icon={faPoll} />
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
								
                <Drawer
									title="Predict-One Results"
									width={520}
									closable={false}
									onClose={this.onCloseParentPredictOneDrawer}
									visible={this.state.parentPredictOneDrawerVisible}
								>
                  {this.renderPredictOneChildrenDrawers(ReefLagoonDatabase)}
								</Drawer>

              </Col>

              <Col xs={10}>
                <div className="stream-image-outer-container">
                  <div className="stream-image-inner-container">
                    <Image id="streamImage" alt="stream"/>
                    <canvas id="streamCanvas"></canvas>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </Body>
				<Footer />
			</div>
		)
	}
}
