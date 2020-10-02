import React from 'react';
import './App.css';
import {
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";
import Home from './Home';
import Player from './Player';

function App() {
  return (
    <Router>
      <Switch>
      <Route exact path="/" component={Home}></Route>
      <Route path="/player/:id" component={Player}></Route>
      </Switch>
    </Router>
  );
}

export default App;
