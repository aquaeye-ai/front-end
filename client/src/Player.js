import { withOktaAuth } from "@okta/okta-react";
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
	Nav,
	Modal,
	Form,
	Toast,
  Spinner
} from 'react-bootstrap';
import { Drawer } from 'antd';
import {
  faPlay,
  faBrain,
  faUndo,
	faFish,
  faAngleRight,
	faExternalLinkAlt,
  faPoll,
  faFilter,
  faInfo,
  faMouse,
  faMousePointer,
  faBorderStyle,
	faArrowRight,
	faHourglassHalf,
	faArrowsAltH,
  faReply,
	faCheck,
	faMap,
	faBinoculars
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import ReefLagoonDatabase from './ReefLagoonDatabase';
import UnknownFish from './UnknownFish';
import Fmt from './Fmt';
import './Player.scss';

let HTTP_SERVER_STREAM_HOST = process.env.REACT_APP_HOST_ENV === 'PROD' ? process.env.REACT_APP_HTTP_SERVER_STREAM_HOST_PROD : process.env.REACT_APP_HTTP_SERVER_STREAM_HOST_DEV
let EXPRESS_SERVER_API = process.env.REACT_APP_HOST_ENV === 'PROD' ? process.env.REACT_APP_EXPRESS_SERVER_API_PROD : process.env.REACT_APP_EXPRESS_SERVER_API_DEV

let socket = null
	
export default withOktaAuth(
	class Player extends Component {
		_isMounted = false;
	
		constructor(props) {
			super(props);

			this.init = this.init.bind(this);

			// menu buttons
			this.setQuickstartModalShow = this.setQuickstartModalShow.bind(this);
			this.play = this.play.bind(this);
			this.undo = this.undo.bind(this);
			this.handleK = this.handleK.bind(this);
			this.predict = this.predict.bind(this);
			this.find = this.find.bind(this);
			this.handlePredictOneThreshold = this.handlePredictOneThreshold.bind(this);
			this.handleFindThreshold = this.handleFindThreshold.bind(this);
			this.hideShowPredictOneResultsFilters = this.hideShowPredictOneResultsFilters.bind(this);
			this.hideShowFindResultsFilters = this.hideShowFindResultsFilters.bind(this);

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
			
			// results feedback
			this.showPredictOneResultsFeedbackDrawer = this.showPredictOneResultsFeedbackDrawer.bind(this);
			this.onClosePredictOneResultsFeedbackDrawer = this.onClosePredictOneResultsFeedbackDrawer.bind(this);	
			this.predictOneResultsFeedbackFormSelectChanged = this.predictOneResultsFeedbackFormSelectChanged.bind(this);
			this.predictOneResultsFeedbackFormImageChanged = this.predictOneResultsFeedbackFormImageChanged.bind(this);
			this.sendPredictOneFeedback = this.sendPredictOneFeedback.bind(this);

			// toast
			this.setShowToast = this.setShowToast.bind(this);

			// user
			this.checkUser = this.checkUser.bind(this);
		
			this.state = {
				loading: true,
				streamId: this.props.match.params.id,
				streamData: {},
				predictOneThreshold: 0.80,
				findThreshold: 0.25,
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
				predictOneResultsFeedbackDrawerVisible: false,
				predictOneResultsImageChoicesVisible: false,
				predictOneResultsForm: {
					model_is_correct: true,
					user_choice: null,
					model_choice: null 
				},
				numClasses: 1,
				showPredictOneResultsFilters: false,
				showFindResultsFilters: false,
				showQuickstartModal: false,
				userInfo: null,
				toast: {
					show: false,
					header: "",
					body: "" 
				}	
			};
		}

		async componentDidMount() {
			this._isMounted = true;
			this.checkUser();

			// connect to the broadcasting port for the stream
			try {
				const stream_data_res = await fetch(`${EXPRESS_SERVER_API}/stream/${this.state.streamId}/data`);
				const stream_data = await stream_data_res.json();
				this.setState({ streamData: stream_data });

				// we need to reconnect each time we mount the component since we disconnect on 'componentWillUnmount' below
        socket = io(`${HTTP_SERVER_STREAM_HOST}:${stream_data.port}`)
        socket.connect(`${HTTP_SERVER_STREAM_HOST}:${stream_data.port}`);
				socket.on(`stream-${stream_data.id}-image`, image => {
          /*
           * We stick with this approach for simplicity, instead of approach below.
           */
					const imageElm = document.getElementById('streamImage');
					imageElm.src = `data:image/jpeg;base64,${image}`;

          /*
           * This approach doesn't require the server to convert its encoded jpg to base64 string before sending, so potentially
           * saves some work on the server side (maybe faster than above approach)
           */
          // use .reduce() to avoid 'maximum callstack error': https://stackoverflow.com/questions/38432611/converting-arraybuffer-to-string-maximum-call-stack-size-exceeded
          //const base64String = btoa(new Uint8Array(image).reduce(function (data, byte) {
          //  return data + String.fromCharCode(byte); 
          //}, ''));
					//imageElm.src = `data:image/jpeg;base64,${base64String}`;
				});
				
				const num_classes_req_settings = {
					method: 'GET'
				};
				const num_classes_res = await fetch(`${EXPRESS_SERVER_API}/predict/num-classes`, num_classes_req_settings);
				const num_classes_data = await num_classes_res.json(); 
				this.setState({ 
					loading: false,
					numClasses: num_classes_data.num_classes,
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
			this._isMounted = false;

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
			
			const playBtn = document.getElementById('play');
			playBtn.disabled = true;
			playBtn.classList.add("disabled");

			const predictOneBtn = document.getElementById('predictOne');
			predictOneBtn.disabled = true;
			predictOneBtn.classList.add("disabled");
			
			const predictOneResultsBtn = document.getElementById('predictOneResults');
			predictOneResultsBtn.disabled = true;
			predictOneResultsBtn.classList.add("disabled");
			
			const predictOneResultsFilters = document.getElementById('predictOneResultsFilters');
     	predictOneResultsFilters.classList.add("hidden");
			
			const findResultsFilters = document.getElementById('findResultsFilters');
			findResultsFilters.classList.add("hidden")
		}

		/* function came from: https://developer.okta.com/docs/guides/sign-into-spa/react/user-info/ */
		async checkUser() {
			if (this.props.authState.isAuthenticated && !this.state.userInfo) {
				const userInfo = await this.props.authService.getUser();
				if (this._isMounted) {
					this.setState({ 
						userInfo: userInfo 
					});
				}
			}
		}

		mouseDown(e) {
			// auto pause when drawing 
			this.pause();
			
			const imageElm = document.getElementById('streamImage');

			const playBtn = document.getElementById('play');
			playBtn.disabled = false;
			playBtn.classList.remove("disabled");

			this.setState({
				rect: {
					x: e.offsetX, 
					y: e.offsetY,
					h: 0,
					w: 0 
				},
				drag: true,
				frame: imageElm.src
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
				predictOneBtn.classList.remove("disabled");
			};
		}

		draw() {
			this.ctx.lineWidth = 2.0;
			this.ctx.strokeStyle = 'rgb(0, 255, 255)';
			this.ctx.strokeRect(this.state.rect.x, this.state.rect.y, this.state.rect.w, this.state.rect.h);
			this.ctx.fillStyle = 'rgba(225, 225, 225, 0.125)';
			this.ctx.fillRect(this.state.rect.x, this.state.rect.y, this.state.rect.w, this.state.rect.h);
		}
		
		setQuickstartModalShow(val) {
			this.setState({
				showQuickstartModal: val
			});
		}
		
		play() {
			try {
				socket.on(`stream-${this.state.streamId}-image`, image => {
          /*
           * We stick with this approach for simplicity, instead of approach below.
           */
					const imageElm = document.getElementById('streamImage');
					imageElm.src = `data:image/jpeg;base64,${image}`;

          /*
           * This approach doesn't require the server to convert its encoded jpg to base64 string before sending, so potentially
           * saves some work on the server side (maybe faster than above approach)
           */
          // use .reduce() to avoid 'maximum callstack error': https://stackoverflow.com/questions/38432611/converting-arraybuffer-to-string-maximum-call-stack-size-exceeded
          //const base64String = btoa(new Uint8Array(image).reduce(function (data, byte) {
          //  return data + String.fromCharCode(byte); 
          //}, ''));
					//imageElm.src = `data:image/jpeg;base64,${base64String}`;
				});
				
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
				const playBtn = document.getElementById('play');
				playBtn.disabled = true;
				playBtn.classList.add("disabled");
				
        const findBtn = document.getElementById('find');
				findBtn.disabled = false;
				findBtn.classList.remove("disabled");
			} catch (error) {
				console.log('play:error');
				console.log(error);
			}
		}

		pause() {
			const findBtn = document.getElementById('find');
      findBtn.disabled = true;
      findBtn.classList.add("disabled");

			try {
				socket.off(`stream-${this.state.streamId}-image`);
			
				const playBtn = document.getElementById('play');
				playBtn.disabled = false;
				playBtn.classList.remove("disabled");
			} catch (error) {
				console.log('pause:error');
				console.log(error);
			}
		}
		
		async predict() {
			// show loading spinner while work is being done
			this.setState({
				loading: true
			});
      
			const findBtn = document.getElementById('find');
      findBtn.disabled = true;
      findBtn.classList.add("disabled");

			const imageElm = document.getElementById('streamImage');
			const jsonData = {
				frame: {
					id: new Date().getTime(),
					height: 756,
					width: 1344,
					depth: 3,
					K: this.state.numClasses,
					data: imageElm.src
				},
				rect: this.state.rect,
        model: this.state.streamData.models.image_classification
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
				const response = await fetch(`${EXPRESS_SERVER_API}/predict/one`, config);
				const data = await response.json();

				this.setState({
					loading: false,
					predictOneResults: data,
					parentPredictOneDrawerVisible: true,

					// in case the user hasn't changed anything in the form, these still need reasonable default values
					predictOneResultsForm: {
						model_is_correct: true,
						user_choice: data.top_k_classes[0],
					  model_choice: this.state.predictOneResults.top_k_classes[0]
					}
				});
				
				const predictOneResultsBtn = document.getElementById('predictOneResults');
				predictOneResultsBtn.disabled = false;
				predictOneResultsBtn.classList.remove("disabled");
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
    
    async find() {
			// auto pause when drawing 
			this.pause();

			// show loading spinner while work is being done
			const imageElm = document.getElementById('streamImage');
			this.setState({
				loading: true,
				frame: imageElm.src
			});

			const playBtn = document.getElementById('play');
			playBtn.disabled = false;
			playBtn.classList.remove("disabled");
      
      const predictOneBtn = document.getElementById('predictOne');
      predictOneBtn.disabled = true;
      predictOneBtn.classList.add("disabled");
			
      const findBtn = document.getElementById('find');
      findBtn.disabled = true;
      findBtn.classList.add("disabled");

			const jsonData = {
				frame: {
					id: new Date().getTime(),
					height: 756,
					width: 1344,
					depth: 3,
					data: imageElm.src
				},
        model: this.state.streamData.models.object_detection,
				threshold: this.state.findThreshold
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
				const response = await fetch(`${EXPRESS_SERVER_API}/find`, config);
				const data = await response.json();

				this.setState({
					loading: false,
					findResult: data
				});
				
        // draw boxes/labels
        // box coordinates: [ymin, xmin, ymax, xmax]
        for (var i = 0; i < data.detection_boxes.length; i++) {
          var score = data.detection_scores[i];

          // only draw boxes that meet or exceed the threshold
          if (score >= this.state.findThreshold) {
            var box = data.detection_boxes[i];
            var label = data.detection_classes[i];
            label = data.category_index[label].name;

            // draw box
            this.ctx.lineWidth = 2.0;
            this.ctx.strokeStyle = 'rgb(102, 221, 170)';
            this.ctx.fillStyle = 'rgba(225, 225, 225, 0.125)';

            var ymin_b = box[0]; 
            var xmin_b = box[1]; 
            var ymax_b = box[2];
            var xmax_b = box[3];

            ymin_b = ymin_b * 756;
            xmin_b = xmin_b * 1344;
            ymax_b = ymax_b * 756;
            xmax_b = xmax_b * 1344;

            var w_b = xmax_b - xmin_b + 1;
            var h_b = ymax_b - ymin_b + 1;

            this.ctx.strokeRect(xmin_b, ymin_b, w_b, h_b);
            this.ctx.fillRect(xmin_b, ymin_b, w_b, h_b);

            // draw label
            var ymin_l = ymin_b - 3;
            var xmin_l = xmin_b;
            this.ctx.font = "10px Arial";
            this.ctx.fillStyle = "#FF634D";
            this.ctx.fillText(`${label}: ${(score*1e2).toFixed(1)}%`, xmin_l, ymin_l)
          }
        }
			} catch (error) {
				console.log(error);
			}
    }
		
		undo() {
			try {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

				const predictOneBtn = document.getElementById('predictOne');
				predictOneBtn.disabled = true;
				predictOneBtn.classList.add("disabled");
				
				const predictOneResultsBtn = document.getElementById('predictOneResults');
				predictOneResultsBtn.disabled = true;
				predictOneResultsBtn.classList.add("disabled");
      
				const findBtn = document.getElementById('find');
				findBtn.disabled = false;
				findBtn.classList.remove("disabled");
			} catch (error) {
				console.log('undo:error');
				console.log(error);
			}
		}

		hideShowPredictOneResultsFilters() {
			const predictOneResultsFilters = document.getElementById('predictOneResultsFilters');

			if (this.state.showPredictOneResultsFilters === true) {
      	predictOneResultsFilters.classList.add("hidden");
				
				this.setState({
					showPredictOneResultsFilters: false
				});
			} else {
      	predictOneResultsFilters.classList.remove("hidden");
				
				this.setState({
					showPredictOneResultsFilters: true
				});
			}
		}

		hideShowFindResultsFilters() {
			const findResultsFilters = document.getElementById('findResultsFilters');

			if (this.state.showFindResultsFilters === true) {
				findResultsFilters.classList.add("hidden")
				
				this.setState({
					showFindResultsFilters: false
				});
			} else {
				findResultsFilters.classList.remove("hidden")
				
				this.setState({
					showFindResultsFilters: true
				});
			}
		}

		handlePredictOneThreshold(e) {
			this.setState({
				predictOneThreshold: parseFloat(e.target.value).toFixed(2)
			});
		}
		
		handleFindThreshold(e) {
			this.setState({
				findThreshold: parseFloat(e.target.value).toFixed(2)
			});
		}
		
		handleK(e) {
			this.setState({
				K: parseFloat(e.target.value)
			});
		}
		
		renderQuickstartTooltip = (props) => (
			<Tooltip id="basic-usage-instructions-tooltip" {...props}>
				Show a simple step-by-step guide to help get you started using the app
			</Tooltip>
		);

		renderHideShowPredictOneResultsFiltersTooltip = (props) => (
			<Tooltip id="hide-show-predict-one-results-filters-tooltip" {...props}>
				{this.state.showPredictOneResultsFilters ? `Hide predict results filters` : `Show controls that filter predict results output`}
			</Tooltip>
		);
		
		renderHideShowFindResultsFiltersTooltip = (props) => (
			<Tooltip id="hide-show-find-results-filters-tooltip" {...props}>
				{this.state.showFindResultsFilters ? `Hide find results filters` : `Show controls that filter find results output`}
			</Tooltip>
		);

		renderPredictOneThresholdTooltip = (props) => (
			<Tooltip id="predict-one-threshold-tooltip" {...props}>
				Threshold that must be met before a given class prediction by model is asserted correct and shown in results panel
			</Tooltip>
		);
		
		renderFindThresholdTooltip = (props) => (
			<Tooltip id="find-threshold-tooltip" {...props}>
				Threshold that must be met before a bounding box is shown
			</Tooltip>
		);
		
		renderKTooltip = (props) => (
			<Tooltip id="k-tooltip" {...props}>
				Number of class predictions to return and show in results panel when class predictions are sorted in descending order based on their associated model confidence 
			</Tooltip>
		);
		
		renderPlayTooltip = (props) => (
			<Tooltip id="threshold-tooltip" {...props}>
				Play livestream
			</Tooltip>
		);
		
		renderPredictOneTooltip = (props) => (
			<Tooltip id="predict-tooltip" {...props}>
				Ask the AI what fish is in current selection
			</Tooltip>
		);
		
		renderPredictOneResultsTooltip = (props) => (
			<Tooltip id="predict-one-tooltip" {...props}>
				Show predict results 
			</Tooltip>
		);
		
		renderUndoTooltip = (props) => (
			<Tooltip id="undo-tooltip" {...props}>
				Remove selection and invalidate predict and find results
			</Tooltip>
		);
		
		renderFishGalleryTooltip = (props) => (
			<Tooltip id="fish-gallery-tooltip" {...props}>
				View gallery of fish species in this exhibit
			</Tooltip>
		);
		
    renderFindTooltip = (props) => (
			<Tooltip id="find-all-tooltip" {...props}>
				Find and label all fish currently in view
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
		
		showPredictOneResultsFeedbackDrawer() {
			this.setState({
				predictOneResultsFeedbackDrawerVisible: true
			});
		};
		
		onClosePredictOneResultsFeedbackDrawer() {
			/* We want the predictOneResultsFeedback form to reset after closing it */
			this.setState({
				predictOneResultsFeedbackDrawerVisible: false,
				predictOneResultsImageChoicesVisible: false,
				predictOneResultsForm: {
					model_is_correct: true,
					user_choice: this.state.predictOneResults.top_k_classes[0],
					model_choice: this.state.predictOneResults.top_k_classes[0]
				}
			});
				
			const submitBtn = document.getElementById('submitPredictOneResultsFeedback');
			submitBtn.disabled = false;
			submitBtn.classList.remove("disabled");
		};

		predictOneResultsFeedbackFormSelectChanged(e) {
			/* We want the predictOneResultsFeedback form to reset after closing it */
			const val = e.target.value;
			var show = false;

			if (val === "no") {
				show = true;
			} else {
				show = false;
			}

			this.setState({
				predictOneResultsImageChoicesVisible: show,
				predictOneResultsForm: {
					model_is_correct: !show,
					user_choice: this.state.predictOneResults.top_k_classes[0]
				}
			});
		
			if (show) {	
				const submitBtn = document.getElementById('submitPredictOneResultsFeedback');
				submitBtn.disabled = true;
				submitBtn.classList.add("disabled");
			} else {
				const submitBtn = document.getElementById('submitPredictOneResultsFeedback');
				submitBtn.disabled = false;
				submitBtn.classList.remove("disabled");
			}
		}
		
		predictOneResultsFeedbackFormImageChanged(e) {
			/* We want the predictOneResultsFeedback form to reset after closing it */

			// use currentTarget instead of target since we want the surrounding <a> and not the enclosed <img>
			const classList = Array.from(e.currentTarget.classList);
			const imgContainers = document.getElementsByClassName('img-link-container-feedback');
			const submitBtn = document.getElementById('submitPredictOneResultsFeedback');

			var user_choice = this.state.predictOneResults.top_k_classes[0]; 

			if (!classList.includes("selected")) {
				for (var i = 0; i < imgContainers.length; i++) {
					imgContainers[i].classList.remove("selected");
				}
				e.currentTarget.classList.add("selected");
				user_choice = e.currentTarget.getAttribute("data-id");
			
				submitBtn.disabled = false;
				submitBtn.classList.remove("disabled");
			} else {
				e.currentTarget.classList.remove("selected");

				submitBtn.disabled = true;
				submitBtn.classList.add("disabled");
			}

			const predictOneResultsFormState = this.state.predictOneResultsForm;

			this.setState({
				predictOneResultsForm: {
					model_is_correct: predictOneResultsFormState.model_is_correct,
					user_choice: user_choice,
					model_choice: this.state.predictOneResults.top_k_classes[0]
				}
			});
		}
			
		async sendPredictOneFeedback() {
			const imageElm = document.getElementById('streamImage');
			const jsonData = {
				frame: {
					timestamp: new Date().getTime(),
					height: 756,
					width: 1344,
					depth: 3,
					K: this.state.numClasses,
					data: imageElm.src
				},
				rect: this.state.rect,
				user: {
					name: this.state.userInfo.name,
					email: this.state.userInfo.email
				},
				feedback: this.state.predictOneResultsForm
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
				const response = await fetch(`${EXPRESS_SERVER_API}/predict/one/feedback`, config);
				const data = await response.json();
				console.log(data);
				
				const userFirstName = this.state.userInfo.name.split(' ')[0]
			
				/* close the drawers and show toast */
				this.setState({
					predictOneResultsFeedbackDrawerVisible: false,
					predictOneResultsImageChoicesVisible: false,

					// reset the form
					predictOneResultsForm:  {
						model_is_correct: true,
						user_choice: this.state.predictOneResults.top_k_classes[0],
					  model_choice: this.state.predictOneResults.top_k_classes[0]
					},
					toast: {
						show: true,
						header: "Feedback Submitted",
						body: `Thank you ${userFirstName}!` 
					}
				});
				
				//const predictOneResultsBtn = document.getElementById('predictOneResults');
				//predictOneResultsBtn.disabled = false;
				//predictOneResultsBtn.classList.remove("disabled");
			} catch (error) {
				console.log(error);
			}
		}

		setShowToast(val) {
			this.setState({
				toast: {
					show: val,
					header: this.state.toast.header,
					body: this.state.toast.body	
				}
			});
		}

		// hash function for strings: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
		hashStr(message) {
			var hash = 0, i, chr;
			for (i = 0; i < message.length; i++) {
				chr   = message.charCodeAt(i);
				hash  = ((hash << 5) - hash) + chr;
				hash |= 0; // Convert to 32bit integer
			}
			return hash;
		}

		getTimestamp() {
			const timestamp = new Date().getTime();
			return timestamp;
		}
		
		renderPredictOneChildrenDrawers = (gallery_info, unknown_fish_info) => {
			/* display predict-one results */
			let noMatches = true

			return (
				/* iterate through results */
				this.state.predictOneResults.top_k_classes.map((r_key, r_idx) => {
					let first = false
					let foundFirst = false

					return (
						/* search through database to find matching entrie(s) with scores above threshold 
						 * TODO: don't use loop; instead use dictionary indexing */
						Object.keys(gallery_info).map((key, idx) => {
							let fish = gallery_info[key]

							if (fish.common_group_name === r_key && this.state.predictOneResults.top_k_scores[r_idx] > this.state.predictOneThreshold && (r_idx+1) <= this.state.K) {
								noMatches = false

								if (foundFirst === true) {
									first = false
								} else {
									first = true
									foundFirst = true
								}

								/* NOTE: there are several 'child' elements returned in lists and React requires these elements to possess unique 
								 * 'key' attributes.  So, we do our best to provide unique 'key' attributes without collision. */
								return (
									<React.Fragment key={this.hashStr(`predict-one-results-parent-${fish.scientific_name}-not-empty`)}>
										{/* this trick works because in Javascript, 'true && expression' evaluates to 'expression' and 'false && expression' evaluates to 'false': https://reactjs.org/docs/conditional-rendering.html */} 
										{first === true &&
											<React.Fragment key={this.hashStr(`predict-one-results-parent-header-${fish.scientific_name}`)}>
												<h1>
													{Fmt.capFirstLetter(r_key)}
													{/* same trick as above */}
													{r_idx === 0 &&
														<p>
															Help us improve our model with your&nbsp;
															<a className="feedback-results-link" href="# " onClick={() => this.showPredictOneResultsFeedbackDrawer()}>
																feedback!  
																<FontAwesomeIcon icon={faReply} />
															</a> 
															<Drawer
																title="How did we do?"
																width={520}
																closable={false}
																onClose={this.onClosePredictOneResultsFeedbackDrawer}
																visible={this.state.predictOneResultsFeedbackDrawerVisible}
															>
																<Form>
																	<Form.Group controlId="predictOneResultsFeedbackForm">
																		<Form.Label>Top Result Correct?</Form.Label>
																		<Form.Control as="select" value={this.state.predictOneResultsForm.model_is_correct ? "yes" : "no"} onChange={this.predictOneResultsFeedbackFormSelectChanged} size="sm" custom>
																			<option value="yes">Yes</option>
																			<option value="no">No</option>
																		</Form.Control>
																		<Button id="submitPredictOneResultsFeedback" variant="primary" onClick={() => this.sendPredictOneFeedback()}>
																			Submit 
																			<FontAwesomeIcon icon={faCheck} />
																		</Button>
																	</Form.Group>
																</Form>
																{this.state.predictOneResultsImageChoicesVisible ? this.renderPredictOneResultsFeedbackDrawerContent(ReefLagoonDatabase, fish.common_group_name) : null}
															</Drawer>
														</p>
													}
												</h1>
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
														<Nav.Link href={info.url} target="_blank" key={this.hashStr(`predict-one-results-child-${idy}-${fish.scientific_name}-${r_idx}-${idx}-${idy}`)}>
															{idy}. {info.name}
															<FontAwesomeIcon icon={faExternalLinkAlt} />
														</Nav.Link>
													))
												}
											</Nav> 
										</Drawer>
									</React.Fragment>
								)
							} else if ((idx === Object.keys(gallery_info).length - 1) && (r_idx === this.state.predictOneResults.top_k_classes.length - 1) && noMatches === true) {
								let fish = unknown_fish_info
									
								return (
									<React.Fragment key={this.hashStr(`predict-one-results-parent-${fish.scientific_name}-not-empty`)}>
										<h1>Oops!</h1>
										<h2>The model couldn't find a match</h2>
										<div className="divider"></div>
										<h3>
											Try relaxing the model filters under <span className="highlight note">Results Filters</span> in the left 
											menu and then revisit these results by clicking <span className="highlight note">Predict Results</span> <br/> 
											e.g. lower the <span className="highlight note">Threshold</span> or 
											increase <span className="highlight note">K</span> to widen the set of possible matches</h3>
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
														<Nav.Link href={info.url} target="_blank" key={this.hashStr(`predict-one-results-child-${idy}-${fish.scientific_name}-${r_idx}-${idx}-${idy}`)}>
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
								return (<React.Fragment key={this.hashStr(`predict-one-results-parent-${fish.scientific_name}-empty`)}></React.Fragment>) 
							}
						})
					)  
				})
			)
		};
		
		renderPredictOneResultsFeedbackDrawerContent = (gallery_info, top_result_common_group_name) => (
			Object.keys(gallery_info).map((key, idx) => {
				let fish = gallery_info[key]

				/* NOTE: there are several 'child' elements returned in lists and React requires these elements to possess unique 
				 * 'key' attributes.  So, we do our best to provide unique 'key' attributes without collision. */
				return (
					<React.Fragment key={this.hashStr(`predict-one-results-feedback-${idx}-${fish.scientific_name}`)}>
						{idx === 0 &&
							<React.Fragment key={this.hashStr(`predict-one-results-feedback-header`)}>
								<h1>Which Fish Matches Your Selection?</h1>
							</React.Fragment>
						}
						<a data-id={fish.common_group_name} className="img-link-container-feedback" href="# " onClick={this.predictOneResultsFeedbackFormImageChanged}>
							<h2>{fish.common_name}</h2>
							<Image src={fish.thumbnail.url} fluid rounded/>
						</a>
						<p className="photo-credit">
							Photo credit: <a href={fish.thumbnail.credit.owner.url}>{fish.thumbnail.credit.owner.name}</a>,&nbsp;  
							<a href={fish.thumbnail.credit.license.url}>{fish.thumbnail.credit.license.name}</a> via Wikimedia Commons
						</p>
					</React.Fragment>
				)
			})
		);

		renderFishGalleryChildrenDrawers = (gallery_info) => (
			Object.keys(gallery_info).map((key, idx) => {
				let fish = gallery_info[key]

				/* NOTE: there are several 'child' elements returned in lists and React requires these elements to possess unique 
				 * 'key' attributes.  So, we do our best to provide unique 'key' attributes without collision. */
				return (
					<React.Fragment key={this.hashStr(`fish-gallery-parent-${idx}-${fish.scientific_name}`)}>
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
										<Nav.Link href={info.url} target="_blank" key={this.hashStr(`fish-gallery-child-url-${idx}-${idy}-${fish.scientific_name}`)}>
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
						<Toast 
							onClose={() => this.setShowToast(false)} 
							show={this.state.toast.show} 
							style={{
								position: 'absolute', 
								top: 0, 
								left: 20,
							}} 
							delay={3000} 
							autohide
						>
							<Toast.Header>
								<img
									src="holder.js/20x20?text=%20"
									className="rounded mr-2"
									alt=""
								/>
								<strong className="mr-auto">{this.state.toast.header}</strong>
								{/*<small>now</small>*/}
							</Toast.Header>
							<Toast.Body>{this.state.toast.body}</Toast.Body>
						</Toast>
						<Container fluid>
							<Row>
								<Col>
									<h1 className="stream-name">{this.state.streamData.name}</h1>
								</Col>
							</Row>
							<Row>
								<Col>
									<div className="video-controls">
										<ButtonGroup vertical className="controls">
											<OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderQuickstartTooltip}
											>
												<div className="btn-container">
													<Button id="quickstart" onClick={() => this.setQuickstartModalShow(true)}>
														Quickstart
														<FontAwesomeIcon icon={faInfo} />
													</Button>
												</div>
											</OverlayTrigger>
									
											{/* keep modal outside of OverlayTrigger, otherwise hoving over modal will trigger overlay */}	
											<QuickstartModal
												show={this.state.showQuickstartModal}
												onHide={() => this.setQuickstartModalShow(false)}
											/>

											<OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderPlayTooltip}
											>
												<div className="btn-container">
													<Button id="play" onClick={this.play}>
														Play
														<FontAwesomeIcon icon={faPlay} />
													</Button>
												</div>
											</OverlayTrigger>

											<OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderUndoTooltip}
											>
												<div className="btn-container">
													<Button id="undo" onClick={this.undo}>
														Reset
														<FontAwesomeIcon icon={faUndo} />
													</Button>
												</div>
											</OverlayTrigger>
											
											<OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderFishGalleryTooltip}
											>
												<div className="btn-container">
													<Button onClick={this.showParentFishGalleryDrawer}>
														Field Guide	
														<FontAwesomeIcon icon={faMap} />
													</Button>
												</div>
											</OverlayTrigger>
											
                      <OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderFindTooltip}
											>
												<div className="btn-container">
													<Button id="find" onClick={this.find}>
														Find
														<FontAwesomeIcon icon={faBinoculars} />
													</Button>
												</div>
											</OverlayTrigger>
											
											<OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderPredictOneTooltip}
											>
												<div className="btn-container">
													<Button id="predictOne" onClick={this.predict}>
														Predict
														<FontAwesomeIcon icon={faBrain} />
													</Button>
												</div>
											</OverlayTrigger>
											
											<OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderPredictOneResultsTooltip}
											>
												<div className="btn-container">
													<Button id="predictOneResults" onClick={this.showParentPredictOneResultsDrawer}>
														Predict Results	
														<FontAwesomeIcon icon={faPoll} />
													</Button>
												</div>
											</OverlayTrigger>
											
											<OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderHideShowPredictOneResultsFiltersTooltip}
											>
												<div className="btn-container">
													<Button id="hideShowPredictOneResultsFilters" onClick={this.hideShowPredictOneResultsFilters}>
														{this.state.showPredictOneResultsFilters ? `Hide Predict Filters` : `Show Predict Filters`}
														<FontAwesomeIcon icon={faFilter} />
													</Button>
												</div>
											</OverlayTrigger>
											
											<div id="predictOneResultsFilters" className="results-filters">
												<h1>Predict Results Filters</h1>

												<div className="slider-control">
													<OverlayTrigger
														placement="bottom"
														delay={{ show: 250, hide: 400 }}
														overlay={this.renderPredictOneThresholdTooltip}
													>
														<p>Prediction Threshold: {this.state.predictOneThreshold}</p>
													</OverlayTrigger>
													<input id="sliderPredictOneThreshold" type="range" value={this.state.predictOneThreshold} min="0" max="1" step="any" list="steplistThreshold" onChange={this.handlePredictOneThreshold} />
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
											</div>
											
											<OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderHideShowFindResultsFiltersTooltip}
											>
												<div className="btn-container">
													<Button id="hideShowFindResultsFilters" onClick={this.hideShowFindResultsFilters}>
														{this.state.showFindResultsFilters ? `Hide Find Filters` : `Show Find Filters`}
														<FontAwesomeIcon icon={faFilter} />
													</Button>
												</div>
											</OverlayTrigger>
											
											<div id="findResultsFilters" className="results-filters">
												<h1>Find Results Filters</h1>

												<div className="slider-control">
													<OverlayTrigger
														placement="bottom"
														delay={{ show: 250, hide: 400 }}
														overlay={this.renderFindThresholdTooltip}
													>
														<p>Prediction Threshold: {this.state.findThreshold}</p>
													</OverlayTrigger>
													<input id="sliderFindThreshold" type="range" value={this.state.findThreshold} min="0" max="1" step="any" list="steplistThreshold" onChange={this.handleFindThreshold} />
													<datalist id="steplistThreshold">
														<option value="0">0</option>
														<option value="1">1</option>
													</datalist>
												</div>

											</div>
										</ButtonGroup>
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
										title="Predict Results"
										width={520}
										closable={false}
										onClose={this.onCloseParentPredictOneDrawer}
										visible={this.state.parentPredictOneDrawerVisible}
									>
										{this.renderPredictOneChildrenDrawers(ReefLagoonDatabase, UnknownFish)}
									</Drawer>

								</Col>

								<Col xs={10}>
									<div className="stream-image-outer-container">
										<div className="stream-image-inner-container">
											<Image id="streamImage" alt="stream"/>
											<canvas id="streamCanvas"></canvas>
                     	{this.state.loading && <Spinner animation="border" role="status" variant="primary" className=""></Spinner>}
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
);

class QuickstartModal extends Component {
  constructor(props) {
		super();
	}
	
	renderMouseTooltip = (props) => (
    <Tooltip id="mouse-tooltip" {...props}>
   		While pressing left-click on mouse, move cursor over livestream to define bounding box 
    </Tooltip>
	);
	
	renderMousePointerTooltip = (props) => (
    <Tooltip id="mouse-pointer-tooltip" {...props}>
      Move cursor to point of interest in livestream 
    </Tooltip>
	);
	
	renderBoundingBoxTooltip = (props) => (
    <Tooltip id="bounding-box-tooltip" {...props}>
      Bounding box will expand from initial point-of-click on livestream
    </Tooltip>
	);
	
	renderFishTooltip = (props) => (
    <Tooltip id="fish-tooltip" {...props}>
   		Enclose one fish with bounding box.  NOTE: multiple fish within a bounding box will confuse the model  
    </Tooltip>
	);

	renderPredictOneTooltip = (props) => (
    <Tooltip id="predict-one-tooltip" {...props}>
   		Left-click button in left menu named "Predict".  
			This will send a request with a snapshot of your bounding box's contents to our model for prediction.
			NOTE: this button will only be active once a bounding-box has been drawn.
    </Tooltip>
	);
	
	renderWaitTooltip = (props) => (
    <Tooltip id="wait-tooltip" {...props}>
			Sit tight!  Your results are being crunched by the model
    </Tooltip>
	);

	renderPredictOneResultsTooltip = (props) => (
    <Tooltip id="predict-one-results-tooltip" {...props}>
			A right-pane drawer will automatically open with your results
    </Tooltip>
	);

	renderPredictOneResultsBtnTooltip = (props) => (
    <Tooltip id="predict-one-results-btn-tooltip" {...props}>
			You can revisit your last predict results by left-clicking this button in the left menu	
    </Tooltip>
	);

	render() {
		return (
			<Modal
				{...this.props}
				size="md"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Quickstart (hover over icons for detailed info)
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Container fluid>
						<Row>
							<Col xs={12}>
								<h4>Predict</h4>
							</Col>
						</Row>
						<Row>
							<Col xs={2}>
								<div className="row-header">
									Step 1
								</div>
							</Col>
							<Col xs={10}>
								<div className="icon-container">
									<OverlayTrigger
										placement="bottom"
										delay={{ show: 250, hide: 400 }}
										overlay={this.renderMousePointerTooltip}
									>
										<FontAwesomeIcon icon={faMousePointer} size="3x" className="space-l-r has-hover" />
									</OverlayTrigger>

									<FontAwesomeIcon icon={faArrowRight} className="space-l-r" />
									
									<OverlayTrigger
										placement="bottom"
										delay={{ show: 250, hide: 400 }}
										overlay={this.renderMouseTooltip}
									>
										<FontAwesomeIcon icon={faMouse} size="3x" className="space-l-r has-hover" />
									</OverlayTrigger>

									<FontAwesomeIcon icon={faArrowRight} className="space-l-r" />

									<div>
										<span className="fa-stack fa-2x">
											<OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderBoundingBoxTooltip}
											>
												<FontAwesomeIcon icon={faBorderStyle} className="fa-stack-2x has-hover" />
											</OverlayTrigger>

											<OverlayTrigger
												placement="bottom"
												delay={{ show: 250, hide: 400 }}
												overlay={this.renderFishTooltip}
											>
												<FontAwesomeIcon icon={faFish} className="fa-stack-1x has-hover" />
											</OverlayTrigger>
										</span>
									</div>
								</div>
							</Col>
						</Row>

						<Row>
							<Col xs={2}>
								<div className="row-header">
									Step 2
								</div>
							</Col>
							<Col xs={10}>
								<div className="icon-container">
									<OverlayTrigger
										placement="bottom"
										delay={{ show: 250, hide: 400 }}
										overlay={this.renderPredictOneTooltip}
									>
										<Button id="predictOne">
											Predict
											<FontAwesomeIcon icon={faBrain} className="space-l" />
										</Button>
									</OverlayTrigger>
								</div>
							</Col>
						</Row>
						
						<Row>
							<Col xs={2}>
								<div className="row-header">
									Step 3
								</div>
							</Col>
							<Col xs={10}>
								<div className="icon-container">
									<OverlayTrigger
										placement="bottom"
										delay={{ show: 250, hide: 400 }}
										overlay={this.renderWaitTooltip}
									>
										<FontAwesomeIcon icon={faHourglassHalf} size="3x" className="space-l-r has-hover" />
									</OverlayTrigger>
									
									<FontAwesomeIcon icon={faArrowRight} className="space-l-r" />
									
									<OverlayTrigger
										placement="bottom"
										delay={{ show: 250, hide: 400 }}
										overlay={this.renderPredictOneResultsTooltip}
									>
										<FontAwesomeIcon icon={faPoll} size="3x" className="space-l-r has-hover" />
									</OverlayTrigger>
								
									<FontAwesomeIcon icon={faArrowsAltH} className="space-l-r" />

									<OverlayTrigger
										placement="bottom"
										delay={{ show: 250, hide: 400 }}
										overlay={this.renderPredictOneResultsBtnTooltip}
									>
										<Button id="predictOneResults">
											Predict Results
											<FontAwesomeIcon icon={faPoll} className="space-l" />
										</Button>
									</OverlayTrigger>
								</div>
							</Col>
						</Row>
					</Container>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.props.onHide}>Close</Button>
				</Modal.Footer>
			</Modal>
		)
	}
}
