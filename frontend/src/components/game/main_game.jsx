import React, { useState, useEffect, useRef } from "react";
import Ball from "./Ball";
import ScoreBoard from "./Scoreboard";
import GameBoard  from "./Gameboard";
import '../../styles/gamestyle.css';
const Game = () => {
const [score, setScore] = useState({ player1: 0, player2: 0 });
const [gameRunning, setGameRunning] = useState(false);

// Paddle & Ball Refs
const leftPaddleRef = useRef(null);
const rightPaddleRef = useRef(null);
const ballRef = useRef(null);

console.log("Localll gamee");
// Function to start/reset the game
const startGame = () => {
    setGameRunning(true);
    setScore({ player1: 0, player2: 0 }); // Reset scores
};

return (
    <div>
    <ScoreBoard score={score} />
    <div className="game-area">
        <GameBoard />
        {gameRunning && <Ball gameRunning={gameRunning} />}
    </div>
    <button onClick={startGame}>Start Game</button>
    </div>
);
};

export default Game;