import {GETCheckUsernameExists, POSTcreateMatch, POSTcreateTournament, PATCHAddMatchToTournament, GETTournamentDetails, PATCHAddWinnerToTournament, PATCHMatchScore} from "../api-consumer/fetch";
import { useGameSetting } from '../contexts/GameContext';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import {useNavigate, useLocation} from "react-router-dom";
import LocalGame from "../game/LocalGame";
import myImage from '../navigation/bright-neon-colors-shining-wild-chameleon_23-2151682784.jpg';
import Marvin from './Marvin.jpg';
import MessageBox from '../MessageBox';
import { ACCESS_TOKEN } from "../../constants";
import '../../styles/tournament.css';


export default function Tournament () {
    const {TournamentSettings, getUsernameById, gameSettings} = useGameSetting();
    const location = useLocation();
    
    // General state of tournament only on frontend
    const [matches, setMatches] = useState({
      semifinal1: { id: null, winner: null, player1: TournamentSettings.Player1, player2: TournamentSettings.Player2},
      semifinal2: { id: null, winner: null, player1: TournamentSettings.Player3, player2: TournamentSettings.Player4},
      final: { id: null, winner: null, player1: null, player2: null }
    });
    
    const [currentStage, setCurrentStage] = useState('semifinals'); // Progression of the Tourna
    const [tournamentComplete, setTournamentComplete] = useState(false); // End >(
    const navigate = useNavigate();// to the stars
    const [message, setMessage] = useState(location.state?.message || null);
    const [messageType, setMessageType] = useState(location.state?.type || 'info');
    const [isBlockchainLoading, setIsBlockchainLoading] = useState(false);
  
    // Add state to track match start times
    const [matchStartTimes, setMatchStartTimes] = useState({
      semifinal1: null,
      semifinal2: null,
      final: null
    });
  
    // Create a match and get its ID
    const createMatch = async (player1, player2) => {
      console.log(`Creating match between ${player1} and ${player2}`);
      try {
          const payload = {
            player_left: player1,
            player_right: player2,
            is_multiplayer: true,
            left_score: 0,
            right_score: 0,
            is_started: false,
          };
        const response = await POSTcreateMatch(payload);
        return response.id;
      } catch (error) {
        console.error("Error creating match:", error);
        return null;
      }
    };
  
    // Handle winner selection for a match
    const handleWinnerSelected = async (matchKey, winnerId) => {
      console.log("WINNER ID: ", winnerId); // Check what's being received
      console.log("Matchk ID: ", matchKey); // Check what's being received

      if (matchKey === "final") {
        setTournamentComplete(true);
        console.log("Tournament complete, winner:", winnerId);
        
        // Set the congratulation message immediately after the final match
        const championUsername = getUsernameById(winnerId);
        setMessage(`Congratulations to ${championUsername} for winning the tournament! 🏆`);
        setMessageType('success');
        
        // Update the database for the final match
        await updateMatchInDatabase(matchKey, winnerId);
      }
      
      setMatches(prev => {
        const match = prev[matchKey];
        const winner =
          winnerId === 'left' ? match.player1 :
          winnerId === 'right' ? match.player2 :
          null;

        return {
          ...prev,
          [matchKey]: {
            ...match,
            winner,
          }
        };
      });

    // Update match scores in the database
    try {
      const matchId = matches[matchKey].id;
      if (matchId) {
        // Get the actual scores from the game state
        const leftScore = winnerId === 'left' ? gameSettings.WINNING_SCORE : 0;
        const rightScore = winnerId === 'right' ? gameSettings.WINNING_SCORE : 0;
        
        // Calculate match duration
        const startTime = matchStartTimes[matchKey];
        const currentTime = Date.now();
        const durationMs = startTime ? currentTime - startTime : 0;
        
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((durationMs % 1000) / 10);
        
        const formattedDuration = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        
        // Update the match score in the database
        await PATCHMatchScore(
          matchId,
          rightScore,
          leftScore,
          formattedDuration
        );
        console.log(`✅ Match score updated for ${matchKey} with ID ${matchId}`);
      }
    } catch (error) {
      console.error(`❌ Error updating match score for ${matchKey}:`, error);
    }

    // If both semifinals have winners, set up the final
    if (matchKey.startsWith('semifinal')) {
      const updatedMatches = {
        ...matches,
        [matchKey]: {
          ...matches[matchKey],
          winner: winnerId === 'left' ? matches[matchKey].player1 : matches[matchKey].player2
        }
      };

      if (updatedMatches.semifinal1.winner && updatedMatches.semifinal2.winner && !matches.final.id) {
        console.log('Setting up final match with winners:', {
          player1: updatedMatches.semifinal1.winner,
          player2: updatedMatches.semifinal2.winner
        });
        setCurrentStage('final');

        const finalMatchId = await createMatch(updatedMatches.semifinal1.winner, updatedMatches.semifinal2.winner);
        console.log('Created final match:', finalMatchId);
        
        setMatches(prev => ({
          ...prev,
          final: {
            ...prev.final,
            id: finalMatchId,
            player1: updatedMatches.semifinal1.winner,
            player2: updatedMatches.semifinal2.winner
          }
        }));
      }
    }
  };

  // Function to update match in database
  const updateMatchInDatabase = async (matchKey, winnerId) => {
    try {
      // Add match to tournament
      if (matches[matchKey].id) {
        await PATCHAddMatchToTournament(TournamentSettings.tournamentId, matches[matchKey].id);
        console.log(`✅ ${matchKey} added to tournament`);
      }
      
      // If this is the final match, add the winner to the tournament
      if (matchKey === "final") {
        await PATCHAddWinnerToTournament(TournamentSettings.tournamentId, winnerId);
        console.log("✅ Winner added to tournament");
      }
    } catch (error) {
      console.error(`❌ Error updating ${matchKey} in database:`, error);
    }
  };

  // Function to send tournament scores to blockchain
  const sendTournamentScoresToBlockchain = async () => {
    setIsBlockchainLoading(true);
    try {
      // Get the tournament ID as an integer (first 8 characters of hex)
      const tournamentId = TournamentSettings.tournamentId;
      const tournamentIdInt = parseInt(tournamentId.substring(0, 8), 16);
      
      // Prepare all match data
      const matchData = [];
      
      // Add semifinal 1 scores
      if (matches.semifinal1.id && matches.semifinal1.winner) {
        matchData.push({
          matchType: 'Semifinal 1',
          leftScore: matches.semifinal1.winner === matches.semifinal1.player1 ? gameSettings.WINNING_SCORE : 0,
          rightScore: matches.semifinal1.winner === matches.semifinal1.player2 ? gameSettings.WINNING_SCORE : 0
        });
      }
      
      // Add semifinal 2 scores
      if (matches.semifinal2.id && matches.semifinal2.winner) {
        matchData.push({
          matchType: 'Semifinal 2',
          leftScore: matches.semifinal2.winner === matches.semifinal2.player1 ? gameSettings.WINNING_SCORE : 0,
          rightScore: matches.semifinal2.winner === matches.semifinal2.player2 ? gameSettings.WINNING_SCORE : 0
        });
      }
      
      // Add final match scores
      if (matches.final.id && matches.final.winner) {
        matchData.push({
          matchType: 'Final',
          leftScore: matches.final.winner === matches.final.player1 ? gameSettings.WINNING_SCORE : 0,
          rightScore: matches.final.winner === matches.final.player2 ? gameSettings.WINNING_SCORE : 0
        });
      }

      // Send scores sequentially
      for (const match of matchData) {
        console.log(`Sending ${match.matchType} scores to blockchain...`);
        const response = await fetch('/api/blockchain/score/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
          },
          body: JSON.stringify({
            tournament_id: tournamentIdInt,
            score_left: match.leftScore,
            score_right: match.rightScore
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to send ${match.matchType} scores to blockchain`);
        }
        console.log(`✅ ${match.matchType} scores sent successfully`);
      }
      
      console.log("✅ All tournament scores sent to blockchain");
      setMessage("Tournament scores successfully uploaded to blockchain! 🚀");
      setMessageType('success');
    } catch (error) {
      console.error("❌ Error sending tournament scores to blockchain:", error);
      setMessage("Failed to upload scores to blockchain. Please try again.");
      setMessageType('error');
    } finally {
      setIsBlockchainLoading(false);
    }
  };

  // Function to return to menu without blockchain updates
  const returnToMenu = () => {
    navigate("/");
  };

  useEffect(() => {
    if (matches.final.winner) {
      setTournamentComplete(true);
    }
  }, [matches.final.winner]);

  // Initialize semifinals when component mounts
  useEffect(() => {
    const initTournament = async () => {
      const semifinal1Id = await createMatch(TournamentSettings.Player1, TournamentSettings.Player2);
      const semifinal2Id = await createMatch(TournamentSettings.Player3, TournamentSettings.Player4);
      
      setMatches(prev => ({
        ...prev,
        semifinal1: { ...prev.semifinal1, id: semifinal1Id },
        semifinal2: { ...prev.semifinal2, id: semifinal2Id }
      }));
      
      // Initialize match start times
      setMatchStartTimes({
        semifinal1: Date.now(),
        semifinal2: null,
        final: null
      });
    };
    
    initTournament();
  }, [TournamentSettings]);

  // Update match start time when a new match begins
  useEffect(() => {
    if (currentStage === 'semifinals' && matches.semifinal1.winner && !matches.semifinal2.winner) {
      setMatchStartTimes(prev => ({
        ...prev,
        semifinal2: Date.now()
      }));
    } else if (currentStage === 'final' && matches.final.id && !matches.final.winner) {
      setMatchStartTimes(prev => ({
        ...prev,
        final: Date.now()
      }));
    }
  }, [currentStage, matches.semifinal1.winner, matches.semifinal2.winner, matches.final.id, matches.final.winner]);

  console.log('Tournament Complete: ', tournamentComplete);
  console.log('Current Stage: ', currentStage);
  console.log('TournamentSettings: ', TournamentSettings);
  return (
    <div className="tournament-container p-4 max-w-4xl mx-auto">
      {message && (
        <MessageBox
          message={message}
          type={messageType}
          onClose={() => setMessage(null)}
        />
      )}
      <h1 className="text-2xl font-bold mb-6 text-center">Tournament</h1>
      
      {/* Tournament Bracket Visualization */}
      {(<div className="tournament-bracket flex flex-col items-center mb-8">
        {/* Visualization of the tournament bracket */}
        <div className="bracket-visualization w-full flex flex-col items-center">
          {/* Semifinals */}

          {/* Semifinal 1 */}
          <div className="card mb-3" style={{ backgroundColor: 'transparent', border: 'none' }}>
              <div className="row g-0 align-items-center">
                {/* Left Image */}
                <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <img 
                    src={myImage} 
                    alt="..." 
                    style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                  />
                </div>

                {/* Text in the center */}
                <div className="col-md-4 text-center">
                  <div className="card-body" style={{ backgroundColor: 'transparent' }}>
                    <h5 className="card-title">Semifinal 1</h5>
                    <p className="card-text">
                    {getUsernameById(matches.semifinal1.player1)} vs {getUsernameById(matches.semifinal1.player2)}
                    </p>
                    {matches.semifinal1.winner && (<p>
                    Winner: {getUsernameById(matches.semifinal1.winner)}
                    </p>)}
                  </div>
                </div>

                {/* Right Image */}
                <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <img 
                    src={myImage} 
                    alt="..." 
                    style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>

            {/* Semifinal 2 */}
            <div className="card mb-3" style={{ backgroundColor: 'transparent', border: 'none' }}>
              <div className="row g-0 align-items-center">
                {/* Left Image */}
                <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <img 
                    src={myImage} 
                    alt="..." 
                    style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                  />
                </div>

                {/* Text in the center */}
                <div className="col-md-4 text-center">
                  <div className="card-body" style={{ backgroundColor: 'transparent' }}>
                    <h5 className="card-title">Semifinal 2</h5>
                    <p className="card-text">
                    {getUsernameById(matches.semifinal2.player1)} vs {getUsernameById(matches.semifinal2.player2)}
                    </p>
                    {matches.semifinal2.winner && (<p>
                    Winner: {getUsernameById(matches.semifinal2.winner)}
                    </p>)}
                  </div>
                </div>

                {/* Right Image */}
                <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <img 
                    src={myImage} 
                    alt="..." 
                    style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>

          {/* Final */}
          <div className="card mb-3" style={{ backgroundColor: 'transparent', border: 'none' }}>
            <div className="row g-0 align-items-center">
              {/* Left Image */}
            
              <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              {((matches.semifinal1.winner  || matches.final.winner) && !(matches.semifinal1.winner  && matches.final.winner))&& (matches.final.winner === matches.semifinal1.winner || !matches.final.winner) &&( <img 
                  src={myImage}
                  alt="..." 
                  style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                />)}
              </div>

              {/* Text in the center */}
              <div className="col-md-4 text-center">
                <div className="card-body" style={{ backgroundColor: 'transparent' }}>
                  <h5 className="card-title">Final Match</h5>
                  <p className="card-text">
                  {matches.final.player1 ? getUsernameById(matches.final.player1) : "To Be Determined"} vs {matches.final.player2 ? getUsernameById(matches.final.player2) : "To Be Determined"}
                  </p>
                  {matches.final.winner && (<p>
                  Winner: {getUsernameById(matches.final.winner)}
                  </p>)}
                </div>
              </div>

              {/* Right Image TODO LOGIC TO FIX*/}
              <div className="col-md-4" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  {((matches.semifinal2.winner  || matches.final.winner) && !(matches.semifinal2.winner  && matches.final.winner))
                  && (matches.final.winner === matches.semifinal2.winner || !matches.final.winner) 
                  &&(
                    <img 
                  src={Marvin}
                  alt="..." 
                  style={{ borderRadius: '80%',width: '250px', height: '250px', objectFit: 'cover' }}
                />)}
              </div>
            </div>
          </div>

          
        </div>
      </div>)}
      





      {/* Current Match */}
      <div className="current-match-container">
        
        {!tournamentComplete && currentStage === 'semifinals' && (
          <div className="semifinals-container">
            {!matches.semifinal1.winner && matches.semifinal1.id && (
              <div className="mb-8" >
                <h3 className="text-lg font-medium mb-2" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>SEMIFINAL ONE</h3>
                <LocalGame 
                  player1={matches.semifinal1.player1}
                  player2={matches.semifinal1.player2}
                  OnWinnerSelect={(winnerId) => handleWinnerSelected('semifinal1', winnerId)}
                />
              </div>
            )}
            
            {matches.semifinal1.winner && !matches.semifinal2.winner && matches.semifinal2.id && (
              <div>
                <h3 className="text-lg font-medium mb-2" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>SEMIFINAL TWO</h3>
                <LocalGame 
                  player1={matches.semifinal2.player1}
                  player2={matches.semifinal2.player2}
                  OnWinnerSelect={(winnerId) => handleWinnerSelected('semifinal2', winnerId)}
                />
              </div>
            )}
          </div>
        )}
        
        {currentStage === 'final' && !tournamentComplete && matches.final.id && (
          <div className="final-container">
            <h3 className="text-lg font-medium mb-2" style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>FINAL MATCH</h3>
            <LocalGame 
              player1={matches.final.player1}
              player2={matches.final.player2}
              OnWinnerSelect={(winnerId) => handleWinnerSelected('final', winnerId)}
            />
          </div>
        )}
        {console.log("TournamentComplete", tournamentComplete)}
        {tournamentComplete && (
          <div className="tournament-results text-center p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Tournament Complete!</h3>
            <p className="text-xl mb-6"> Congratulations to {getUsernameById(matches.final.winner)}, our champion! </p>
            
            {/* Buttons Container */}
            <div className="tournament-buttons">
              <button 
                className="blockchain-button py-2 px-6 rounded"
                onClick={sendTournamentScoresToBlockchain}
                disabled={isBlockchainLoading}
              >
                {isBlockchainLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden mr-3">
                      <div 
                        className="h-full bg-white rounded-full"
                        style={{
                          width: '100%',
                          animation: 'progress 2s ease-in-out infinite'
                        }}
                      ></div>
                    </div>
                    <span>Uploading to Blockchain...</span>
                  </div>
                ) : (
                  "Push to Blockchain"
                )}
              </button>
              
              <button 
                className="return-button py-2 px-6 rounded"
                onClick={returnToMenu}
              >
                Return to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};