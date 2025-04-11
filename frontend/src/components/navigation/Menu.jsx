import React, { useState } from "react";
import {useNavigate, useLocation} from "react-router-dom";
import { Button } from 'react-bootstrap';
import {useGameSetting} from '../contexts/GameContext'
import '../../styles/game.css'
import {InvitePlayer} from '../game/InvitePlayerModal';
import GameOverModal from "../GameOverModal";
import MessageBox from '../MessageBox';

export const Menu = () => {
  const { setGameMode, setIsMultiplayer} = useGameSetting();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [InvitationModal, setInvationBool] = useState(false);
  const [gameType, setGameType] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);
  const [messageType, setMessageType] = useState(location.state?.type || 'info');

  const handleSelectMode = async (mode) => {
    if (mode === "local") {
        setGameType("match");
        setIsMultiplayer(false);
        setInvationBool(true);
        setGameMode("local");
        /* navigate("/local"); */
      // let response = await POSTcreateMatch({
      //   'is_multiplayer':Ismultiplayer,
      //   'is_started':IsStarted,
      //   'left_score':left_score,
      //   'right_score':right_score, 
      //   'player_left_username':localStorage.getItem('userId'),
      //   'player_right_username': right_username
      // });//temporal 
      // console.log(response);
      //setMatchId(response['id']);
      // Pasar por Invite Modal
      // Pasar por send.msg(connectToMatch) Y send.msg(game_active)
      //navigate("/game");
    } else if (mode === "tournament") { 
      setGameMode("local"); // TODO
      setIsMultiplayer(false); // TODO
      setGameType("tournament");
      setInvationBool(true);
    }
  };

  return (
    <div className="menu-container">
      {message && (
        <MessageBox
          message={message}
          type={messageType}
          onClose={() => setMessage(null)}
        />
      )}
      <h1>Play Single Game</h1>
      <Button className="m-5" onClick={() => handleSelectMode("local")}>Start Game (2P)</Button>
      <h1>Or start a Tournament!</h1>
      <Button className="m-5 btn-info" onClick={() => handleSelectMode("tournament")}>Start Tournament</Button>
      <h5 className="tournament-info">
        Our 4-player tournaments are designed for players to compete in a series of matches, 
        with the top two advancing to a final. The inviter must enter three usernames to set up the tournament.
      </h5>
      { InvitationModal && (
        <InvitePlayer showModal={InvitationModal} handleCloseModal={()=>{setInvationBool(false)}} gameType={gameType}/>
      )}
    </div>
  );
};





// const Menu = ({ onGameModeSelect }) => {
//   const [showButtons, setShowButtons] = useState(false); // Controls the Buttons state
  
//   const HandleOnlineSelect = (mode) => {
//     if (mode === "online") {
//       setShowButtons(true)
//     }
//   };

//   return (
//     <div className="menu-container">
//           <h1>Select GamePlay mode</h1>
//           {!showButtons && (
//           <div>
//           <Button className='m-3 mt-4' onClick={() => onGameModeSelect("local")}>
//             Local Game (2P)
//           </Button>
//           <Button className='m-3 mt-4' onClick={() => HandleOnlineSelect("online")}>
//             Online Game
//           </Button>
//           </div>
//           )}
//           {showButtons && (
//           <div>
//             <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("online-create")}>
//               Create Game
//             </Button>
//             <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("online-join")}>
//               Join Game
//             </Button>
//           </div>
//           )}
//     </div>
//   );
// };
export default Menu;


