import React, { useState, useEffect, useRef }   from 'react';

import { useNavigate }                          from 'react-router-dom';
import { useGameSetting }      from '../contexts/GameContext';

import ClientWebSocket                          from './ClientWebSocket';
import GameOverModal                            from '../GameOverModal';


const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 700;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 90;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 8;
const WINNING_SCORE = 1;
const PADDLE_MARGIN = 20; // Reduced from 50 to 20


const LocalGame = ({player1, player2, OnWinnerSelect}) => {
    const navigate = useNavigate();

    const[showself, setShowSelf] = useState(true)
    const { gameType, gameMode, getUsernameById} = useGameSetting();
       // If no player names provided via props, use context

    const resolvePlayerNames = () => {
        if (gameType === "tournament" && player1 && player2) 
        {
            return {left: getUsernameById(player1), right: getUsernameById(player2) };
        }
        return { left: localStorage.getItem('username'), right: "Guest" };
    };

    const [playerNames, setPlayerNames] = useState(resolvePlayerNames());
    const [ToggleGameOverModal, setToggleGameOverModal]= useState(false);
    const [gameState, setGameState] = useState({
        players: { 
            left: {
                x: PADDLE_MARGIN,
                y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                score: 0
            },
            right: {
                x: CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
                y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                score: 0
            }
        },
        ball: {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            radio: BALL_RADIUS,
            rx: INITIAL_BALL_SPEED,
            ry: INITIAL_BALL_SPEED
        },
        isPlaying: false,
        gameOver: false,
        winner: null,
        connectionError: null
    });

    const [pressedKeys, setPressedKeys] = useState(new Set());
    const canvasRef = useRef(null);
    const wsRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Add connection state tracking
    const [isConnected, setIsConnected] = useState(false);

    // Initialize WebSocket connection
    useEffect(() => {
        try {
            wsRef.current = new ClientWebSocket();
            
            // Add connection status handler
            wsRef.current.onConnectionStateChange = (state) => {
                console.log('WebSocket connection state:', state);
                setIsConnected(state === 'connected');
                
                // Send initial game state request when connected
                if (state === 'connected') {
                    wsRef.current.sendMessage({ type: 'get_game_state' });
                }
            };

            // Debug state tracking
            let lastState = null;
            const debugStateChanges = (data) => {
                if (data.type === 'game_update') {
                    //console.log('Raw game update received:', data);
                    if (JSON.stringify(data) !== JSON.stringify(lastState)) {
                        // console.log('Game state changed:', {
                        //     ball: {
                        //         x: data.ball.x,
                        //         y: data.ball.y,
                        //         rx: data.ball.rx,
                        //         ry: data.ball.ry
                        //     },
                        //     players: {
                        //         left: {
                        //             y: data.players.left.y,
                        //             score: data.players.left.score
                        //         },
                        //         right: {
                        //             y: data.players.right.y,
                        //             score: data.players.right.score
                        //         }
                        //     },
                        //     active: data.active
                        // });
                        lastState = data;
                    } else {
                        console.log('Game state unchanged');
                    }
                }
            };

            wsRef.current.listenForGameUpdates((data) => {
                // Call debug function
                debugStateChanges(data);

                if (data.type === 'error') {
                    console.error('Received error:', data.message);
                    setGameState(prevState => ({
                        ...prevState,
                        connectionError: data.message
                    }));
                    return;
                }

                if (data.type === 'game_update') {
                    console.log('Processing game update:', data);
                    
                    // Ensure we have all required properties
                    if (!data.players || !data.ball) {
                        console.error("Missing required game state properties:", data);
                        return;
                    }

                    setGameState(prevState => {
                        // Keep x positions from initial state
                        const leftX = PADDLE_MARGIN;
                        const rightX = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;
                        
                        const newState = {
                            ...prevState,
                            players: {
                                left: {
                                    ...prevState.players.left,
                                    ...data.players.left,
                                    x: leftX,
                                    width: PADDLE_WIDTH,
                                    height: PADDLE_HEIGHT
                                },
                                right: {
                                    ...prevState.players.right,
                                    ...data.players.right,
                                    x: rightX,
                                    width: PADDLE_WIDTH,
                                    height: PADDLE_HEIGHT
                                }
                            },
                            ball: {
                                x: data.ball.x,
                                y: data.ball.y,
                                radio: BALL_RADIUS,
                                rx: data.ball.rx || 0,
                                ry: data.ball.ry || 0
                            },
                            isPlaying: data.active,
                            connectionError: null
                        };
                        
                        console.log('New game state:', newState);
                        
                        // Log changes in ball position and velocity
                        if (newState.ball.x !== prevState.ball.x || newState.ball.y !== prevState.ball.y) {
                            console.log('Ball moved:', {
                                from: { x: prevState.ball.x, y: prevState.ball.y },
                                to: { x: newState.ball.x, y: newState.ball.y }
                            });
                        }
                        
                        return newState;
                    });

                    // Check for game over
                    if (data.players.left.score >= WINNING_SCORE || data.players.right.score >= WINNING_SCORE) {
                        setGameState(prev => ({
                            ...prev,
                            gameOver: true,
                            winner: data.players.left.score >= WINNING_SCORE ? 'left' : 'right',
                            isPlaying: false
                        }));
                        setToggleGameOverModal(true);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            setGameState(prevState => ({
                ...prevState,
                connectionError: 'Failed to connect to game server'
            }));
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const handleKeyDown = (e) => {
        setPressedKeys(prev => new Set([...prev, e.key]));
    };

    const handleKeyUp = (e) => {
        setPressedKeys(prev => {
            const newKeys = new Set(prev);
            newKeys.delete(e.key);
            return newKeys;
        });
    };

    // Send player movements to server
    useEffect(() => {
        if (gameState.isPlaying && !gameState.gameOver) {
            // Left paddle (W/S keys)
            if (pressedKeys.has('w')) {
                wsRef.current.sendPlayerMove('left', 'up');
            }
            if (pressedKeys.has('s')) {
                wsRef.current.sendPlayerMove('left', 'down');
            }

            // Right paddle (Arrow keys)
            if (pressedKeys.has('o')) {
                wsRef.current.sendPlayerMove('right', 'up');
            }
            if (pressedKeys.has('k')) {
                wsRef.current.sendPlayerMove('right', 'down');
            }
        }
    }, [pressedKeys, gameState.isPlaying, gameState.gameOver]);

    const toggleGame = async () => {
        try {
            console.log("Toggling game. Current state:", gameState);  // Debug log
            if (gameState.gameOver) {
                console.log("Resetting game after game over");  // Debug log
                await wsRef.current.sendMessage({
                    type: 'reset_game'
                });
                setGameState(prev => ({
                    ...prev,
                    gameOver: false,
                    winner: null,
                    isPlaying: true,
                    connectionError: null
                }));
            } else {
                const newIsPlaying = !gameState.isPlaying;
                console.log("Setting game active state to:", newIsPlaying);  // Debug log
                if (newIsPlaying) {
                    await wsRef.current.sendPlayGame();
                } else {
                    await wsRef.current.sendStopGame();
                }
                setGameState(prev => ({
                    ...prev,
                    isPlaying: newIsPlaying,
                    connectionError: null
                }));
            }
        } catch (error) {
            console.error('Failed to toggle game:', error);
            setGameState(prev => ({
                ...prev,
                connectionError: 'Failed to communicate with game server'
            }));
        }
    };

    const handleCloseModal= () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        if (gameType == 'tournament'){
            OnWinnerSelect(gameState.winner);
        }
        setToggleGameOverModal(false)
        if (gameType == 'tournament'){
            OnWinnerSelect(gameState.winner);
        }
        setShowSelf(false);
        
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Add frame counter for debugging
    const frameCounter = useRef(0);
    const lastUpdateTime = useRef(Date.now());

    // Modify the animation frame handler to track frames and ensure smooth updates
    useEffect(() => {
        let animationFrameId;
        
        const render = () => {
            if (wsRef.current && gameState.isPlaying && !gameState.gameOver) {
                frameCounter.current++;
                const currentTime = Date.now();
                
                // Log every second
                if (currentTime - lastUpdateTime.current >= 1000) {
                    console.log('FPS:', frameCounter.current);
                    console.log('Game State:', {
                        ball: {
                            x: Math.round(gameState.ball.x),
                            y: Math.round(gameState.ball.y),
                            rx: Math.round(gameState.ball.rx),
                            ry: Math.round(gameState.ball.ry)
                        },
                        leftPaddle: Math.round(gameState.players.left.y),
                        rightPaddle: Math.round(gameState.players.right.y),
                        isPlaying: gameState.isPlaying
                    });
                    frameCounter.current = 0;
                    lastUpdateTime.current = currentTime;
                }
                
                // Handle continuous paddle movement
                if (pressedKeys.size > 0) {
                    if (pressedKeys.has('w')) {
                        wsRef.current.sendPlayerMove('left', 'up');
                    }
                    if (pressedKeys.has('s')) {
                        wsRef.current.sendPlayerMove('left', 'down');
                    }
                    if (pressedKeys.has('o')) {
                        wsRef.current.sendPlayerMove('right', 'up');
                    }
                    if (pressedKeys.has('k')) {
                        wsRef.current.sendPlayerMove('right', 'down');
                    }
                }
            }
            animationFrameId = window.requestAnimationFrame(render);
        };
        
        if (gameState.isPlaying && !gameState.gameOver) {
            animationFrameId = window.requestAnimationFrame(render);
        }
        
        return () => {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, [gameState.isPlaying, gameState.gameOver, pressedKeys, gameState.ball, gameState.players]);

    // Update canvas rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw center line
        ctx.strokeStyle = 'white';
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw scores
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.players.left.score.toString(), CANVAS_WIDTH / 4, 50);
        ctx.fillText(gameState.players.right.score.toString(), (CANVAS_WIDTH * 3) / 4, 50);
        
        // Draw paddles
        ctx.fillStyle = 'white';
        // Left paddle
        ctx.fillRect(
            gameState.players.left.x,
            gameState.players.left.y,
            PADDLE_WIDTH,
            PADDLE_HEIGHT
        );
        // Right paddle
        ctx.fillRect(
            gameState.players.right.x,
            gameState.players.right.y,
            PADDLE_WIDTH,
            PADDLE_HEIGHT
        );

        // Draw ball
        if (gameState.ball) {
            ctx.beginPath();
            ctx.arc(
                gameState.ball.x,
                gameState.ball.y,
                gameState.ball.radio,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.closePath();
        }
        
        // Draw game over message
        if (gameState.gameOver) {
            ctx.font = '60px Arial';
            ctx.fillStyle = 'white';
            const winner = gameState.winner === 'left' ? 'Left' : 'Right';
            ctx.textAlign = 'center';
            ctx.fillText(`${winner} Player Wins!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
        }
    }, [gameState]);

    // Remove the duplicate WebSocket message handler
    // The one we added earlier is redundant and might cause issues
    useEffect(() => {
        if (!wsRef.current) return;
        return () => {
            if (wsRef.current) {
                wsRef.current.listenForGameUpdates(null);
            }
        };
    }, []);
    
    if (!showself) return null;
    return (

        <div className="gameplay-container" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '20px',
            backgroundColor: '#1a1a1a',
            minHeight: '100vh'
        }}>
            <div className="game-return" style={{ marginBottom: '20px' }}>
                {!gameState.gameOver && (
                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',}} onClick={toggleGame} disabled={!!gameState.connectionError}>
                        {gameState.isPlaying ? 'Pause' : 'Start'}
                    </button>
                )}
            </div>
            {gameState.connectionError && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                    {gameState.connectionError}
                </div>
            )}
            <div style={{ position: 'relative' }}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    style={{
                        border: '2px solid white',
                        backgroundColor: 'black',
                        display: 'block'
                    }}
                />
                {/* Debug overlay */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '10px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}>
                    Ball: ({Math.round(gameState.ball.x)}, {Math.round(gameState.ball.y)})<br/>
                    Velocity: ({Math.round(gameState.ball.rx)}, {Math.round(gameState.ball.ry)})<br/>
                    Left Paddle: {Math.round(gameState.players.left.y)}<br/>
                    Right Paddle: {Math.round(gameState.players.right.y)}<br/>
                    Playing: {gameState.isPlaying ? 'Yes' : 'No'}
                </div>
                {gameState.gameOver && (
                    <div style={{
                        position: 'absolute',
                        top: '60%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        zIndex: 1
                    }}>
                        <button 
                            onClick={()=>{navigate('/')}}
                            style={{
                                padding: '15px 30px',
                                fontSize: '20px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                marginTop: '20px'
                            }}
                        >
                            Return to Menu
                        </button>
                    </div>
                )}
            </div>
            <div className="game-controls" style={{ 
                marginTop: '20px', 
                color: 'white', 
                textAlign: 'center' 
            }}>
                <div className="controls-info">
                    <p>Left Player: W/S keys</p>
                    <p>Right Player: O/K keys</p>
                </div>
            </div>
            {console.log("Just before modal", gameMode, gameType)}
            {gameState.gameOver && ToggleGameOverModal &&(
                <GameOverModal 
                showModal={gameState.gameOver} 
                handleCloseModal={handleCloseModal} 
                player1={playerNames.left} 
                player2={playerNames.right} 
                score1={gameState.players.left.score} 
                score2={gameState.players.right.score} 
                />
                )}
        </div>
        
    );
};



export default LocalGame; 