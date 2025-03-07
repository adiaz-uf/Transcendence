import React, { useState, useEffect} from "react";
import Menu from "./Menu";
import Game from "../game/main_game";

const GameManager = () => {
  const [gameMode, setGameMode] = useState("menu"); // "menu", "local", o "online"

  useEffect(() => {
    console.log("GameManager re-rendered, gameMode:", gameMode);
  }, [gameMode]);
  
  return (
    <div className="game-manager">
      {gameMode === "menu" && (
            <Menu gameMode={gameMode} setGameMode={setGameMode} />)}
      {gameMode === "local" && <Game />}
      {/* {gameMode === "online" && <GameOnline />} */}
      {gameMode !== "menu" && (
        <button onClick={() => setGameMode("menu")} className="return-select-mode">🏠 Back to Menu</button>
      )}
    </div>
  );
};

export default GameManager;



