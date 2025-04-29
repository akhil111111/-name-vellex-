'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

type BoardTheme = {
  lightSquare: string;
  darkSquare: string;
};

type BoardThemes = {
  [key: string]: BoardTheme;
};

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });
  const [currentPlayer, setCurrentPlayer] = useState('w');
  const [gameStatus, setGameStatus] = useState('');
  const [selectedSquare, setSelectedSquare] = useState('');
  const [timer, setTimer] = useState({ w: 600, b: 600 }); // 10 minutes per player
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [boardTheme, setBoardTheme] = useState('default');

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          [currentPlayer]: Math.max(0, prev[currentPlayer as keyof typeof prev] - 1)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentPlayer]);

  // Sound effects
  const playMoveSound = useCallback(() => {
    const audio = new Audio('/move.mp3');
    audio.play().catch(() => {});
  }, []);

  // Update game status
  const updateGameStatus = useCallback(() => {
    if (game.isCheckmate()) {
      setGameStatus(`Checkmate! ${currentPlayer === 'w' ? 'Black' : 'White'} wins!`);
      setIsTimerRunning(false);
    } else if (game.isDraw()) {
      setGameStatus('Draw!');
      setIsTimerRunning(false);
    } else if (game.isCheck()) {
      setGameStatus('Check!');
    } else {
      setGameStatus(`${currentPlayer === 'w' ? 'White' : 'Black'}'s turn`);
    }
  }, [game, currentPlayer]);

  // Update captured pieces
  const updateCapturedPieces = useCallback((move: any) => {
    if (move.captured) {
      setCapturedPieces(prev => ({
        ...prev,
        [move.color === 'w' ? 'b' : 'w']: [...prev[move.color === 'w' ? 'b' : 'w'], move.captured]
      }));
    }
  }, []);

  function makeAMove(move: any) {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        setMoveHistory(prev => [...prev, result.san]);
        setCurrentPlayer(gameCopy.turn());
        updateCapturedPieces(result);
        updateGameStatus();
        playMoveSound();
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    return move;
  }

  function onSquareClick(square: string) {
    if (selectedSquare === '') {
      setSelectedSquare(square);
    } else {
      const move = makeAMove({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });
      setSelectedSquare('');
      return move;
    }
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const boardThemes: BoardThemes = {
    default: {
      lightSquare: '#f0d9b5',
      darkSquare: '#b58863',
    },
    blue: {
      lightSquare: '#dee3e6',
      darkSquare: '#8ca2ad',
    },
    green: {
      lightSquare: '#eeeed2',
      darkSquare: '#769656',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Info Panel */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Game Status</h2>
            <p className="text-lg text-blue-400">{gameStatus}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>White:</span>
                <span className={currentPlayer === 'w' ? 'text-blue-400' : ''}>{formatTime(timer.w)}</span>
              </div>
              <div className="flex justify-between">
                <span>Black:</span>
                <span className={currentPlayer === 'b' ? 'text-blue-400' : ''}>{formatTime(timer.b)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Captured Pieces</h2>
            <div className="space-y-2">
              <div>
                <span className="text-white">White: </span>
                <span className="font-chess">{capturedPieces.w.join(' ')}</span>
              </div>
              <div>
                <span className="text-white">Black: </span>
                <span className="font-chess">{capturedPieces.b.join(' ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Move History</h2>
            <div className="h-48 overflow-y-auto space-y-1">
              {moveHistory.map((move, index) => (
                <div key={index} className="flex">
                  <span className="w-8 text-gray-400">{Math.floor(index / 2) + 1}.</span>
                  <span className="flex-1">{move}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chessboard */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 p-6 rounded-lg">
            <Chessboard
              position={game.fen()}
              onPieceDrop={onDrop}
              onSquareClick={onSquareClick}
              customBoardStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              }}
              customSquareStyles={{
                ...(selectedSquare && {
                  [selectedSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
                }),
              }}
              customDarkSquareStyle={{ backgroundColor: boardThemes[boardTheme].darkSquare }}
              customLightSquareStyle={{ backgroundColor: boardThemes[boardTheme].lightSquare }}
            />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                onClick={() => {
                  setGame(new Chess());
                  setMoveHistory([]);
                  setCapturedPieces({ w: [], b: [] });
                  setCurrentPlayer('w');
                  setGameStatus('White\'s turn');
                  setTimer({ w: 600, b: 600 });
                  setIsTimerRunning(false);
                }}
              >
                New Game
              </button>
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => {
                  const moves = game.undo();
                  if (moves) {
                    setGame(new Chess(game.fen()));
                    setMoveHistory(prev => prev.slice(0, -1));
                    setCurrentPlayer(game.turn());
                    updateGameStatus();
                  }
                }}
              >
                Undo Move
              </button>
            </div>

            <div className="flex justify-center space-x-4">
              <select
                className="px-4 py-2 bg-gray-700 rounded-md"
                value={boardTheme}
                onChange={(e) => setBoardTheme(e.target.value)}
              >
                <option value="default">Classic Theme</option>
                <option value="blue">Blue Theme</option>
                <option value="green">Green Theme</option>
              </select>

              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => {
                  const fen = game.fen();
                  localStorage.setItem('savedGame', fen);
                }}
              >
                Save Position
              </button>
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => {
                  const savedFen = localStorage.getItem('savedGame');
                  if (savedFen) {
                    const newGame = new Chess(savedFen);
                    setGame(newGame);
                    setCurrentPlayer(newGame.turn());
                    updateGameStatus();
                  }
                }}
              >
                Load Position
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 