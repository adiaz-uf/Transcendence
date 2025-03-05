import React, { useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';
import NavBar from '../components/Routing/Navbar';
import '../styles/App.css';
import { joinGame, sendPlayerMove, listenForGameUpdates } from '../websocket';

import '../styles/gamestyle.css';
import '../components/Routing/Menu';
import GameManager from '../components/Routing/GameManager';

function Home() {
  return (
    <div tabIndex="0">
      <NavBar />
      <GameManager></GameManager>
    </div>
  );
}

export default Home;
