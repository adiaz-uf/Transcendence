import React, { useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';
import NavBar from '../Routing/Navbar';
import '../../styles/App.css';
import { joinGame, sendPlayerMove, listenForGameUpdates } from '../../websocket';

import Game from '../game/main_game';
import '../../styles/gamestyle.css';

function PongWebsocket() {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // Join game room when component mounts
    joinGame("Pong");

    // Listen for game updates from WebSocket server
    listenForGameUpdates((data) => {
      setGameState(data);
    });

    return () => {
      console.log("Cleaning up WebSocket listeners");
    };
  }, []);

  // Handle key events for player movement
  const handleKeyDown = (event) => {
    sendPlayerMove(event.key);
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <div className='app-body'>
        <div className='pong-container'>
          <h1>Real-Time Pong</h1>
          <Image src="ping-pong-table.jpg" width={'100%'} />
          <p>Game State: {gameState ? JSON.stringify(gameState) : "Waiting for game data..."}</p>
        </div>
      </div>
    </div>
  );
}

export default PongWebsocket;
