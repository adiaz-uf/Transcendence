import React, { useEffect, useState, useRef } from "react";

const Ball = ({ gameRunning }) => {
  const ballRef = useRef(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });

//   useEffect(() => {
//     if (!gameRunning) return;

//     let dx = 2, dy = 2; // Ball speed
//     const moveBall = () => {
//       setPosition(prev => ({
//         x: prev.x + dx,
//         y: prev.y + dy
//       }));

//       requestAnimationFrame(moveBall);
// //     };

//     moveBall();
//   }, [gameRunning]);

  return <div ref={ballRef} className="ball" style={{ left: position.x, top: position.y }} />;
};

export default Ball;
