import React, { useRef, useEffect, useState } from "react";

const GameBoard = () => {
  const canvasRef = useRef(null);
  const [paddlePositions, setPaddlePositions] = useState({
    left: { x: 10, y: 150 },
    right: { x: 780, y: 150 }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Configurar tamano mesa
    canvas.width = 800;
    canvas.height = 400;

    // Funcion de dibujo
    const drawBoard = () => {
      // limpiar pantalla
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // dibujar lineas
      ctx.strokeStyle = "white";
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      // dibujar jugadaores
      ctx.fillStyle = "white";
      
      // izq
      ctx.fillRect(
        paddlePositions.left.x, 
        paddlePositions.left.y, 
        10, 
        100
      );

      // derecha
      ctx.fillRect(
        paddlePositions.right.x, 
        paddlePositions.right.y, 
        10, 
        100
      );
    };

    drawBoard();
  }, [paddlePositions]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'w':
          setPaddlePositions(prev => ({
            ...prev, 
            left: { ...prev.left, y: Math.max(0, prev.left.y - 10) }
          }));
          break;
        case 's':
          setPaddlePositions(prev => ({
            ...prev, 
            left: { ...prev.left, y: Math.min(300, prev.left.y + 10) }
          }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        display: 'block', 
        margin: '0 auto',
        border: '2px solid white'
      }} 
    />
  );
};

export default GameBoard;
