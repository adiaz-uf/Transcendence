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

  // Handle game drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let lastFrameTime = performance.now();
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

        const currentTime = performance.now();
        const delta = currentTime - lastFrameTime;
        lastFrameTime = currentTime;
    
        // Clear old frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw playing field and players
        drawField(ctx, canvas);
        renderPlayerOne(ctx);
        renderPlayerTwo(ctx);

        if (gameState && gameState.ball) {
            const fraction = 1 - Math.exp(-0.01 * delta);
            // Update ball position directly
            gameState.ball.prevX ??= gameState.ball.x;
            gameState.ball.prevY ??= gameState.ball.y;

            // Interpolate from the previous position to the target position
            gameState.ball.prevX = lerp(gameState.ball.prevX, gameState.ball.x, fraction);
            gameState.ball.prevY = lerp(gameState.ball.prevY, gameState.ball.y, fraction);

            drawBall({ ball: {
                x: gameState.ball.prevX,
                y: gameState.ball.prevY,
                radio: gameState.ball.radio
              } }, ctx);
            drawScores(gameState, ctx, canvas);
        }
    }

    GameFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(GameFrameRef.current);
}, [gameState]);


  function update(gameState, ctx, canvas) {
    ctx.clearRect(gameState.ball.x -5, gameState.ball.y -5,10,10);
    drawBall(gameState.ball.x, gameState.ball.y, 30);
    gameState.ball.x = lerp(gameState.ball.x, canvas.width, 0.1);
    gameState.ball.y = lerp(gameState.ball.y, canvas.height, 0.1);
   requestAnimationFrame(update);
  }

  function drawField(ctx, canvas){
    // Draw Field
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = "white";
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
  }

  function drawScores(gameState, ctx, canvas){
    ctx.font = "24px Arial";
    ctx.fillText(`${gameState.players.right.score || 0}`, canvas.width / 4, 50);
    ctx.fillText(`${gameState.players.left.score || 0}`, (3 * canvas.width) / 4, 50);
  }

  function drawBall(gameState, ctx) {
    console.log("drawBall function called")
    ctx.fillStyle = '#66DA79';
    ctx.beginPath(); 
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radio, 0, 2 * Math.PI, false);
    ctx.fill();
  }

  function lerp(min, max, fraction) {
    console.log("lerp function called")
    return (max - min) * fraction + min;
  };

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