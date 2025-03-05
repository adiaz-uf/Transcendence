import React from "react";

const ScoreBoard = ({ score }) => {
  return (
    <div className="scoreboard">
      <span>Player 1: {score.player1}</span>
      <span>Player 2: {score.player2}</span>
    </div>
  );
};

export default ScoreBoard;
