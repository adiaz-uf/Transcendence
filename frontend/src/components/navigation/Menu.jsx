import React, { useState } from "react";
import { Button } from 'react-bootstrap';
import '../../styles/game.css'
import {useNavigate} from "react-router-dom";
import {useGameSetting} from '../contexts/GameContext'
import {InvitePlayer} from '../game/InvitePlayerModal';

export const Menu = ({ onGameModeSelect }) => {
  const [OnlineButtons, setOnlineButtons] = useState(false);
  const [TournamentButtons, setTournamentButtons] = useState(false);

  return (
    <div className="menu-container">
      <h1>Select Game Mode</h1>
      {!OnlineButtons && !TournamentButtons && (
        <>
          <Button className="m-3" onClick={() => onGameModeSelect("local")}>Local Game (2P)</Button>
          <Button className="m-3" onClick={() => setOnlineButtons(true)}>Online Game</Button>
          <Button className="m-3" onClick={() => setTournamentButtons(true)}>Tournament</Button>
        </>
      )}
      {OnlineButtons && (
        <>
          <Button className="m-3 btn-success" onClick={() => onGameModeSelect("online-create")}>Create Game</Button>
          <Button className="m-3 btn-success" onClick={() => onGameModeSelect("online-join")}>Join Game</Button>
          <Button className="m-3 btn-success" onClick={() => setOnlineButtons(false)}>Back</Button>
        </>
      )}
      {TournamentButtons && (
        <>
          <Button className="m-3 btn-success" onClick={() => onGameModeSelect("tournament-create")}>Create Tournament</Button>
          <Button className="m-3 btn-success" onClick={() => onGameModeSelect("tournament-join")}>Join Tournament</Button>
          <Button className="m-3 btn-success" onClick={() => setTournamentButtons(false)}>Back</Button>
        </>
      )}
    </div>
  );
};


//import React, { useState } from "react";
//import {useNavigate} from "react-router-dom";
//import { Button } from 'react-bootstrap';
//import {useGameSetting} from '../contexts/MenuContext'
//import '../../styles/game.css'
//import {InvitePlayer} from '../game/InvitePlayerModal';
//
//export const Menu = ({ onGameModeSelect }) => {
//  const { setGameMode, setIsMultiplayer, setPlayerType } = useGameSetting();
//
//  const [OnlineButtons, setOnlineButtons] = useState(false);
//  const [TournamentButtons, setTournamentButtons] = useState(false);
//  const [InvitationModal, setInvationBool] = useState(false);
//
//  const navigate = useNavigate();
//
//  const handleSelectMode = async (mode) => {
//    if (mode === "local") {
//      setGameMode("local");
//      setIsMultiplayer(false);
//
//      setInvationBool(true);
//      // let response = await POSTcreateMatch({
//      //   'is_multiplayer':Ismultiplayer,
//      //   'is_started':IsStarted,
//      //   'left_score':left_score,
//      //   'right_score':right_score, 
//      //   'player_left_username':localStorage.getItem('userId'),
//      //   'player_right_username': right_username
//      // });//temporal 
//      // console.log(response);
//      //setMatchId(response['id']);
//
//      // Pasar por Invite Modal
//
//      // Pasar por send.msg(connectToMatch) Y send.msg(game_active)
//
//
//
//      //navigate("/game");
//    } else if (mode === "online" && !OnlineButtons) {
//      setOnlineButtons(true);
//    } else if (mode === "online") {
//      setOnlineButtons(false);
//    } else if (mode === "tournament" && !TournamentButtons) {
//      setTournamentButtons(true);
//    } else if (mode === "tournament") {
//      setTournamentButtons(false);
//    }  else if (mode === "tournament-create") {
//      //TODO
//      onGameModeSelect("online-create");
//      setIsMultiplayer(true);
//      setPlayerType("host");
//      navigate("/invite");
//    }  else if (mode === "tournament-join") {
//      //TODO
//      setGameMode("online-join");
//      setIsMultiplayer(true);
//      setPlayerType("guest");
//      navigate("/join");
//    } else if (mode === "online-create") {
//      setGameMode("online-create");
//      setIsMultiplayer(true);
//      setPlayerType("host");
//      navigate("/invite");
//    } else if (mode === "online-join") {
//      setGameMode("online-join");
//      setIsMultiplayer(true);
//      setPlayerType("guest");
//      navigate("/join");
//    }
//  };
//
//
//// const Menu = ({ onGameModeSelect }) => {
////   const [showButtons, setShowButtons] = useState(false); // Controls the Buttons state
//  
////   const HandleOnlineSelect = (mode) => {
////     if (mode === "online") {
////       setShowButtons(true)
////     }
////   };
//
////   return (
////     <div className="menu-container">
////           <h1>Select GamePlay mode</h1>
////           {!showButtons && (
////           <div>
////           <Button className='m-3 mt-4' onClick={() => onGameModeSelect("local")}>
////             Local Game (2P)
////           </Button>
////           <Button className='m-3 mt-4' onClick={() => HandleOnlineSelect("online")}>
////             Online Game
////           </Button>
////           </div>
////           )}
////           {showButtons && (
////           <div>
////             <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("online-create")}>
////               Create Game
////             </Button>
////             <Button className='m-3 mt-4 btn-success' onClick={() => onGameModeSelect("online-join")}>
////               Join Game
////             </Button>
////           </div>
////           )}
////     </div>
////   );
//// };
//export default Menu;
//
//
//