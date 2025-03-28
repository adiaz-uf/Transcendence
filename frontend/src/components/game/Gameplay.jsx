import React, { useRef, useState, useEffect } from "react";
import webSocketClient from "./websocket";

//TODO: Upgrade to a play or stop game but not closing conection by returning to menu
const ReturnToMenu = ({InitGame}) => {

  const handleClick = () => {
    if (webSocketClient.socket?.readyState === WebSocket.OPEN) {
      InitGame(null)
    }
  };

  return (
    <button onClick={handleClick}>
      Menu
    </button>
  );
};

const Gameplay = ({ gameState, InitGame }) => {
  // html ref for canvas
  const canvasRef = useRef(null);
  const GameFrameRef = useRef(null);
  const PlayerOneFrameRef = useRef(null);
  const SecondPlayerFrameRef = useRef(null);


  // Key stroke for each player
  const [pressedKeysPlayerOne, setPressedKeysPlayerOne] = useState(null);
  const [pressedKeysSecondPlayer, setPressedKeysSecondPlayer] = useState(null);

  // Key event handlers
  const handleKeyDownPlayers = (e) => {
    if (e.key === "w" || e.key === "s") {
      setPressedKeysPlayerOne(e.key);
    }
    else if (e.key === "ArrowUp" || e.key === "ArrowDown"){
      setPressedKeysSecondPlayer(e.key);
    }
  };
  const handleKeyUpPlayers = (e) => {
    if (e.key === "w" || e.key === "s") {
      setPressedKeysPlayerOne(null);
    }
    else if (e.key === "ArrowUp" || e.key === "ArrowDown"){
      setPressedKeysSecondPlayer(null);}
  };
  // What to do for when key of player one is pressed
  const sendPlayerMovesPlayerOne = () => {
    if (pressedKeysPlayerOne) {
      webSocketClient.sendPlayerMove({
        left: pressedKeysPlayerOne === "w" ? "up" : "down",
      });
    }
    PlayerOneFrameRef.current = requestAnimationFrame(sendPlayerMovesPlayerOne);
  };
  // What to do for when key of player 2 is pressed
  const sendPlayerMovesSecondPlayer = () => {
    if (pressedKeysSecondPlayer) {
      webSocketClient.sendPlayerMove({
        right: pressedKeysSecondPlayer === "ArrowUp" ? "up" : "down",
      });
    }
    SecondPlayerFrameRef.current = requestAnimationFrame(sendPlayerMovesSecondPlayer);
  };
  
  // Reload frame when key is pressed and clean when destroyed
  useEffect(() => {
    /* if (pressedKeysPlayerOne) { */
      PlayerOneFrameRef.current = requestAnimationFrame(sendPlayerMovesPlayerOne);
/*     } else {
      cancelAnimationFrame(PlayerOneFrameRef.current);} */
    return () => {
      cancelAnimationFrame(PlayerOneFrameRef.current);
    };
  }, [pressedKeysPlayerOne]);

  useEffect(() => {
    if (pressedKeysSecondPlayer) {
      SecondPlayerFrameRef.current = requestAnimationFrame(sendPlayerMovesSecondPlayer);
    } else {
      cancelAnimationFrame(SecondPlayerFrameRef.current);
    }
    return () => {
      cancelAnimationFrame(SecondPlayerFrameRef.current);
    };
  }, [pressedKeysSecondPlayer]);

  // Canvas initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 900;
      canvas.height = 700;
    }

    // add event function handlers for key presses
    window.addEventListener("keydown", handleKeyDownPlayers);
    window.addEventListener("keyup", handleKeyUpPlayers);

    // Cleanup on unmount or when dependencies change
    return () => {
      window.removeEventListener("keydown", handleKeyDownPlayers);
      window.removeEventListener("keyup", handleKeyUpPlayers);
    };
  }, []);

//   useEffect(() => {
//     // Escucha de eventos de WebSocket para goles
//     webSocketClient.socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);

//       // Cuando se recibe el mensaje de un gol
//       if (data.type === "goal") {
//         const updatedGameState = { ...gameState };
//         updatedGameState.players.left.score = data.left_score;  // Actualiza puntaje de la leftuierda
//         updatedGameState.players.right.score = data.der_score;  // Actualiza puntaje de la derecha
//         InitGame(updatedGameState);  // Actualiza el estado del juego
//       }
//     };

//     return () => {
//       // Cleanup cuando el componente se desmonte
//       if (webSocketClient.socket) {
//         webSocketClient.socket.onmessage = null;
//       }
//     };
//   }, [gameState, InitGame]);

  // Handle game drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const renderPlayerOne = (ctx) => {
      if (gameState && gameState.players && gameState.players.left) {
        ctx.fillStyle = "white";
        ctx.fillRect(
          gameState.players.left.x,
          gameState.players.left.y,
          gameState.players.left.width,
          gameState.players.left.height,
        );
      }
    };
    
    const renderPlayerTwo = (ctx) => {
      if (gameState && gameState.players && gameState.players.right) {
        ctx.fillStyle = "white";
        ctx.fillRect(
          gameState.players.right.x,
          gameState.players.right.y,
          gameState.players.right.width,
          gameState.players.right.height,
        );
      }
    };

    const render = () => {
      // board
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center line
      ctx.strokeStyle = "white";
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      renderPlayerOne(ctx);
      renderPlayerTwo(ctx);

      if (gameState && gameState.ball) {
        ctx.beginPath();
        ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radio, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "24px Arial";
        ctx.fillText(`${gameState.players.right.score || 0}`, canvas.width / 4, 50);
        ctx.fillText(`${gameState.players.left.score || 0}`, (3 * canvas.width) / 4, 50);
      }

    };

    GameFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(GameFrameRef.current);
  }, [gameState]);

  // <PlayOrStopBtn/>
  //<button onClick={() => {setGameMode(null)}}>Return to menu </button>
  //<span className='m-4'>Game Mode: {gameMode}</span>
  //<p>Game State: {gameState ? JSON.stringify(gameState) : "Waiting for game data..."}</p>
  return (
    <div className="gameplay-container">
      <div className="game-header">
        <ReturnToMenu InitGame={InitGame}/>
      </div>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
};

export default Gameplay;