import React, { useState, useEffect} from "react";
import '../../styles/menustyle.css'

const Menu = ({ gameMode, setGameMode }) => {
<<<<<<< HEAD

=======
>>>>>>> 3160b9b (Componentes UI  Pong Local && Navegacion)
  useEffect(() => {
    console.log("GameManager re-rendered, gameMode:", gameMode);
  }, [gameMode]);
  
  return (
    <div className="menu-container">
<<<<<<< HEAD
          <h1>🎮 Pong Game</h1>
          <button onClick={() => setGameMode("local")}>Local Game (2P)</button>
          <button onClick={() => setGameMode("online")}>Online Game</button>
=======
      {(gameMode === "menu") && (
        <>
          <h1>🎮 Pong Game</h1>
          <button onClick={() => setGameMode("local")}>Local Game (2P)</button>
          <button onClick={() => setGameMode("online")}>Online Game</button>
        </>
      )}
>>>>>>> 3160b9b (Componentes UI  Pong Local && Navegacion)
    </div>
  );
};

export default Menu;
<<<<<<< HEAD


=======
>>>>>>> 3160b9b (Componentes UI  Pong Local && Navegacion)
