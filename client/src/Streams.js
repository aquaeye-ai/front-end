import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  faVideo
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import './Streams.scss'

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      streams: []
    };
  }
  async componentDidMount() {
    try {
      const EXPRESS_SERVER_API = process.env.REACT_APP_HOST_ENV === "PROD" ? process.env.REACT_APP_EXPRESS_SERVER_API_PROD : process.env.REACT_APP_EXPRESS_SERVER_API_DEV;
      const response = await fetch(`${EXPRESS_SERVER_API}/streams`);
      const data = await response.json();
      this.setState({ streams: [...data] });
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    return (
      <div className="App">
        <Header />
        <Body>
          <div className="container">
            <div className="row">
              {this.state.streams.map(stream =>
              <div className="col-md-4" key={stream.id}>
                <Link to={`/player/${stream.id}`}>
                  <div className="card border-0">
                    <img id={"poster-"+stream.id} className="poster" src={`data:image/jpeg;base64,${stream.poster}`} alt={stream.name} />
                    <div className="card-body">
                      <p>{stream.name}</p>
                      <FontAwesomeIcon icon={faVideo} />
                    </div>
                  </div>
                </Link>
              </div>
              )}
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    )
  }
}
