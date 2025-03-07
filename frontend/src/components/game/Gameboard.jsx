import React, { useRef, useEffect } from "react";

const GameBoard = ({ updateScore }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ajustar tamano mapa 
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.8; // 80% del tamano de la pantalla horizantalmte
      canvas.height = window.innerHeight * 0.6; // 60% en vertical
    };

    resizeCanvas(); // explicitamente declarar el tamano
    window.addEventListener("resize", resizeCanvas); // anadir setter al evento de resize pantalla

    // Variables del juego en funcion del tamano del canvas dynamicamente !! A contrario de los componentes que teniamos que usar state ahora centralizo todo la logica del juego usando canvas
    let paddleWidth = 10, paddleHeight = canvas.height / 5;
    let ballSize = 10;

    let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
    let rightPaddleY = leftPaddleY; // centrar raquetas en medio

    let ballX = canvas.width / 2, ballY = canvas.height / 2;
    let ballDX = 4, ballDY = 4; // velocidad bola

    let player1Score = 0, player2Score = 0;


    // Funcion de dibujo
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Mapa
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Linea separadora
      ctx.strokeStyle = "white";
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();// dibujar

      // Raquetas
      ctx.fillStyle = "white";
      ctx.fillRect(20, leftPaddleY, paddleWidth, paddleHeight);
      ctx.fillRect(canvas.width - 30, rightPaddleY, paddleWidth, paddleHeight);

      // Bola
      ctx.fillRect(ballX, ballY, ballSize, ballSize);
    };

    const update = () => {
      ballX += ballDX;
      ballY += ballDY;

      // Collision top bottom
      if (ballY <= 0 || ballY + ballSize >= canvas.height) ballDY *= -1;

      // Collision raquetas
      if (
        (ballX <= 30 && ballY >= leftPaddleY && ballY <= leftPaddleY + paddleHeight) ||
        (ballX >= canvas.width - 40 && ballY >= rightPaddleY && ballY <= rightPaddleY + paddleHeight)
      ) {
        ballDX *= -1;
      }

      // Score
      if (ballX < 0) {
        player2Score++;
        updateScore({ player1: player1Score, player2: player2Score });
        resetBall();
      } else if (ballX > canvas.width) {
        player1Score++;
        updateScore({ player1: player1Score, player2: player2Score });
        resetBall();
      }

      draw();
      requestAnimationFrame(update);
    };

    const resetBall = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      //ballDX *= -1; // Cambiar direccion ?
    };

    // trigger de eventos del teclado
    window.addEventListener("keydown", (e) => {
      if (e.key === "w") leftPaddleY = Math.max(0, leftPaddleY - 20);
      if (e.key === "s") leftPaddleY = Math.min(canvas.height - paddleHeight, leftPaddleY + 20);
      if (e.key === "ArrowUp") rightPaddleY = Math.max(0, rightPaddleY - 20);
      if (e.key === "ArrowDown") rightPaddleY = Math.min(canvas.height - paddleHeight, rightPaddleY + 20);
    });


    update(); // Empezar loop

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block", margin: "auto", border: "2px solid white" }} />;
};

export default GameBoard;
