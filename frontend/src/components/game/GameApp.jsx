import React, { useCallback, useState } from "react";
import Gameplay from "./Gameplay";
import webSocketClient from "./websocket";
import api from "../../api";
import Menu from "./Menu";
import InvitePlayer from "./InvitePlayerModal";
import LoginForm from "../../components/LoginForm";

// Parent component that holds game mode selection and WebSocket connection state
const GameApp = () => {
  const [gameMode, setGameMode] = useState(null);
  const [showModal, setShowModal] = useState(false); // Controls the modal state
  const [selectedMode, setSelectedMode] = useState(null); // Stores the selected mode (local or online)
  const [showLogin, setShowLogin] = useState(false); // Controls the visibility of the Login
  const [gameState, setGameState] = useState({
    game_active: true,
    // Players state
    players: {
      'left': { 'x': 10, 'y': 150, 'width': 15, 'height': 115, 'speed': 5, 'score': 0 },
      'right': { 'x': 880, 'y': 150, 'width': 15, 'height': 115, 'speed': 5, 'score': 0 }
    },
    // Ball state
    ball: { 'x': 400, 'y': 200, 'radio': 5, 'rx': 11, 'ry': -11 }
  });

  // WebSocket update listener
  const StateLinkerGameWebSocket = useCallback((setGameState) => {
    webSocketClient.listenForGameUpdates((gameUpdate) => {
      console.log("Received game update:", gameUpdate);
      setGameState((prevState) => ({
        ...prevState,
        ...gameUpdate,
        players: {
          ...prevState.players,
          ...gameUpdate.players, // Merge players if updated
          left: { ...prevState.players.left, ...(gameUpdate.players?.left || {}) },
          right: { ...prevState.players.right, ...(gameUpdate.players?.right || {}) }
        },
        pelota: { ...prevState.pelota, ...(gameUpdate.pelota || {}) } // Merge pelota if updated
      }));
    });
  });

  // Initialize game based on mode
  const InitGame = (mode) => {
    setGameMode(mode);
    if (mode === null) {
      webSocketClient.sendMessage({ type: 'game_active', game_active: false });
      webSocketClient.close();
    } else {
      webSocketClient.connect();
      StateLinkerGameWebSocket(setGameState);
    }
  };

  // Close modal and start the game
  const handleCloseModal = () => {
    setShowModal(false);
    InitGame(selectedMode); // Start the game with the selected mode
  };

  // Handle game mode selection
  const handleGameModeSelect = (mode) => {
    setSelectedMode(mode); 
    setShowModal(true); 
  };

  // Handle login success
  const handleLoginSuccess = () => {
    setShowLogin(false);
    InitGame(selectedMode); // Start the game after login
  };

  return (
    <div className="game-container">
      {/* Show Login Form before Gameplay */}
      {showLogin ? (
        <div>
        <h1>Login Player 2 to play</h1>
        <LoginForm route="/api/login" navigateTo="/" onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        gameMode === null ? (
          <Menu onGameModeSelect={handleGameModeSelect} />
        ) : (
          <Gameplay gameState={gameState} InitGame={InitGame} />
        )
      )}
      <InvitePlayer
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        gameMode={selectedMode}
        setShowLogin={setShowLogin}
      />
    </div>
  );
};

export default GameApp;
