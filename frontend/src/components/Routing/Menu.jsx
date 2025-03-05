import React, { useState, useEffect} from "react";
import '../../styles/menustyle.css'

const Menu = ({ gameMode, setGameMode }) => {
  useEffect(() => {
    console.log("GameManager re-rendered, gameMode:", gameMode);
  }, [gameMode]);
  
  return (
    <div className="menu-container">
      {(gameMode === "menu") && (
        <>
          <h1>🎮 Pong Game</h1>
          <button onClick={() => setGameMode("local")}>Local Game (2P)</button>
          <button onClick={() => setGameMode("online")}>Online Game</button>
        </>
      )}
    </div>
  );
};

export default Menu;
