import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from './Home';
import Dashboard from './Dashboard';
import Canvas from './Canvas';

const Main = () => {
  return (
    <Switch>
      <Route exact path='/' component={Home}></Route>
      <Route exact path='/dashboard' component={Dashboard}></Route>
      <Route path='/game/:id'> <Canvas /> </Route>
    </Switch>
  );
}

export default Main;
