import React, { useState } from "react";
import { Button } from 'react-bootstrap';
import '../../styles/game.css'



const Menu = ({ onGameModeSelect }) => {
  const [showOnlineButtons, setShowOnlineButtons] = useState(false); // Controls the Buttons state
  const [showTournamentButtons, setShowTournamentButtons] = useState(false); // Controls the Buttons state
  
  const HandleOnlineSelect = (mode) => {
    if (mode === "online") {
      setShowOnlineButtons(true)
    }
    if (mode === "tournament") {
      setShowTournamentButtons(true)
    }
  };

  return (
    <div className="menu-container">
          <h1>Select GamePlay mode</h1>
          {!showOnlineButtons && !showTournamentButtons && (
          <div>
          <Button className='m-3 mt-4' onClick={() => onGameModeSelect("local")}>
            Local Game (2P)
          </Button>
          <Button className='m-3 mt-4' onClick={() => HandleOnlineSelect("online")}>
            Online Game
          </Button>
          <Button className='m-3 mt-4' onClick={() => HandleOnlineSelect("tournament")}>
            Tournament
          </Button>
          </div>
          )}
          
          
          {showOnlineButtons && (
          <div>
            <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("online-create")}>
              Create Game
            </Button>
            <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("online-join")}>
              Join Game
            </Button>
          </div>
          )}

          {showTournamentButtons && (
          <div>
            <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("tournament-create")}>
              Create Tournament - Do not press
            </Button>
            <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("tournament-join")}>
              Join Tournament - Do not press
            </Button>
          </div>
          )}

    </div>
  );
};
export default Menu;


