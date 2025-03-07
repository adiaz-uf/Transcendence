import React, { useState } from "react";
import GameBoard from "./Gameboard";
import ScoreBoard from "./Scoreboard.jsx";
import "../../styles/gamestyle.css";

const Game = () => {
  const [score, setScore] = useState({ player1: 0, player2: 0 });

  return (
    <div>
      <ScoreBoard score={score} />
      <GameBoard updateScore={setScore} />
    </div>
  );
};
export default Game;
