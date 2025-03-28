import React, { useCallback, useState } from "react";
import Gameplay from "./Gameplay";
import webSocketClient from "./websocket";
import api from "../../api";
import Menu from "./Menu";
import InvitePlayer from "./InvitePlayerModal";
import Login from "../../pages/Login";  // Asegúrate de importar el componente Login

// Componente Padre, guarda estado de selección de juego y conexión websocket
const GameApp = () => {
  const [gameMode, setGameMode] = useState(null); // Guardará el modo seleccionado (local o online)
  const [showModal, setShowModal] = useState(false); // Controla el estado del modal
  const [showLogin, setShowLogin] = useState(false); // Controla la visibilidad del Login
  const [gameState, setGameState] = useState({
    game_active: true,
    // Estado players
    players: {
        'left': {
            'x': 10,
            'y': 150,
            'width': 15,
            'height': 115,
            'speed': 5,
            'score': 0
        },
        'right': {
            'x': 880,
            'y': 150,
            'width': 15,
            'height': 115,
            'speed': 5,
            'score': 0
        }
    },
    // Estado ball
    ball: {
        'x': 450,
        'y': 350,
        'radio': 5,
        'rx': 11,
        'ry': -11
    }
  });

  /* const lerp = (start, end, t) => start + (end - start) * t;

  const StateLinkerGameWebSocket = useCallback((setGameState) => {
    webSocketClient.listenForGameUpdates((gameUpdate) => {
      console.log("Received game update:", gameUpdate);
  
      if (gameUpdate.pelota) {
        const animationDuration = 30; // in milliseconds
        const startTime = performance.now();
        
        const animate = () => {
          const currentTime = performance.now();
          const elapsedTime = currentTime - startTime;
          const t = Math.min(elapsedTime / animationDuration, 1); // Value from 0 to 1
  
          setGameState((prevState) => {
            const newPelota = {
              x: lerp(prevState.pelota.x, gameUpdate.pelota.x, t),
              y: lerp(prevState.pelota.y, gameUpdate.pelota.y, t),
            };
  
            if (t < 1) {
              requestAnimationFrame(animate);
            }
  
            return {
              ...prevState,
              pelota: newPelota,
              players: {
                ...prevState.players,
                ...gameUpdate.players,
                left: {
                  ...prevState.players.left,
                  ...(gameUpdate.players?.left || {}),
                },
                right: {
                  ...prevState.players.right,
                  ...(gameUpdate.players?.right || {}),
                },
              },
            };
          });
        };
  
        requestAnimationFrame(animate); // Start the animation
        
      } else { // When there's no `pelota` update, just update players
        setGameState((prevState) => ({
          ...prevState,
          players: {
            ...prevState.players,
            ...gameUpdate.players,
            left: {
              ...prevState.players.left,
              ...(gameUpdate.players?.left || {}),
            },
            right: {
              ...prevState.players.right,
              ...(gameUpdate.players?.right || {}),
            },
          }
        }));
      }
    });
  }, []); */
  
  const StateLinkerGameWebSocket = useCallback((setGameState) => {
    webSocketClient.listenForGameUpdates((gameUpdate) => {
      console.log("Received game update:", gameUpdate);
      setGameState((prevState) => ({
        ...prevState,
        ...gameUpdate,
        players: {
          ...prevState.players,
          ...gameUpdate.players, // Merge players if updated
          left: {
            ...prevState.players.left,
            ...(gameUpdate.players?.left || {}), // Merge left if updated
          },
          right: {
            ...prevState.players.right,
            ...(gameUpdate.players?.right || {}), // Merge right if updated
          },
        },
        pelota: {
          ...prevState.pelota,
          ...(gameUpdate.pelota || {}), // Merge pelota if updated
        },
      }));
    });
  });

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

  const handleCloseModal = () => {
    setShowModal(false); // Cierra el modal
    InitGame(gameMode); // Inicia el juego con el modo seleccionado
  };

  const handleGameModeSelect = (mode) => {
    setGameMode(mode); // Guarda el modo seleccionado (local o online)
    setShowModal(true); // Muestra el modal
  };

  const handleLoginSuccess = () => {
    setShowLogin(false); // Oculta el login después de un inicio de sesión exitoso
    InitGame(gameMode); // Inicia el juego después del login
  };

  return (
    <div className="game-container">
      {gameMode === null ? (
        <Menu onGameModeSelect={handleGameModeSelect} />
      ) : (
        <Gameplay gameState={gameState} InitGame={InitGame} />
        
      )}

      {/* Componente InvitePlayer */}
      <InvitePlayer 
        showModal={showModal} 
        handleCloseModal={handleCloseModal}
        gameMode={gameMode} // Pasa el modo de juego al modal
        setShowLogin={setShowLogin} // Pasa la función para mostrar el login
      />

      {/* Mostrar el componente Login solo si showLogin es true */}
      {showLogin && <Login route="/api/login" onLoginSuccess={handleLoginSuccess} />} 
    </div>
  );
};

export default GameApp;

