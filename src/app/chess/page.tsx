'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chess, Move, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import io from 'socket.io-client';

type GameMode = 'local' | 'bot' | 'online';
type BotDifficulty = 'easy' | 'medium' | 'hard';

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
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<{ [square: string]: boolean }>({});
  const [timer, setTimer] = useState({ w: 600, b: 600 }); // 10 minutes per player
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [boardTheme, setBoardTheme] = useState('default');
  const [isShaking, setIsShaking] = useState(false);
  
  // New state for features
  const [gameMode, setGameMode] = useState<GameMode>('local');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [showHints, setShowHints] = useState(false);
  const [bestMove, setBestMove] = useState<{ from: Square; to: Square } | null>(null);
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [engineReady, setEngineReady] = useState(false);

  // Add new state for bot initialization
  const [isBotInitialized, setIsBotInitialized] = useState(false);

  // Initialize stockfish
  useEffect(() => {
    if (typeof window !== 'undefined' && gameMode === 'bot' && !isBotInitialized) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/stockfish.js@10.0.2/stockfish.js';
      script.onload = () => {
        setIsBotInitialized(true);
        // Start a new game when bot is initialized
        if (!isBotInitialized) {
          setGame(new Chess());
          setMoveHistory([]);
          setCapturedPieces({ w: [], b: [] });
          setCurrentPlayer('w');
          setGameStatus('White\'s turn');
          setTimer({ w: 600, b: 600 });
          setIsTimerRunning(false);
          setSelectedSquare(null);
          setPossibleMoves({});
          setBestMove(null);
        }
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [gameMode, isBotInitialized]);

  // Initialize socket for multiplayer
  useEffect(() => {
    if (gameMode === 'online' && !socket) {
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('move', (move: any) => {
        makeMove(move);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [gameMode]);

  // Bot move logic - Updated to ensure bot plays
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (gameMode === 'bot' && currentPlayer === 'b' && !isWaitingForBot && isBotInitialized && typeof window !== 'undefined') {
      setIsWaitingForBot(true);
      timeoutId = setTimeout(() => {
        // @ts-ignore
        const engine = new window.Stockfish();
        engine.onmessage = (event: { data: string }) => {
          if (event.data.includes('bestmove')) {
            const move = event.data.split(' ')[1];
            if (move && move !== '(none)') {
              const from = move.slice(0, 2) as Square;
              const to = move.slice(2, 4) as Square;
              makeMove({ from, to });
            }
            setIsWaitingForBot(false);
          }
        };
        engine.postMessage('position fen ' + game.fen());
        engine.postMessage('go depth ' + getBotDepth());
      }, 500);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [gameMode, currentPlayer, game, isBotInitialized]);

  function getBotSkillLevel() {
    switch (botDifficulty) {
      case 'easy': return 5;
      case 'medium': return 10;
      case 'hard': return 20;
      default: return 10;
    }
  }

  function getBotDepth() {
    switch (botDifficulty) {
      case 'easy': return 2;
      case 'medium': return 4;
      case 'hard': return 8;
      default: return 4;
    }
  }

  // Get hint from engine
  const getHint = useCallback(() => {
    if (!showHints || typeof window === 'undefined') return;
    
    // @ts-ignore
    const engine = new window.Stockfish();
    engine.onmessage = (event: { data: string }) => {
      if (event.data.includes('bestmove')) {
        const move = event.data.split(' ')[1];
        if (move && move !== '(none)') {
          const from = move.slice(0, 2) as Square;
          const to = move.slice(2, 4) as Square;
          setBestMove({ from, to });
        }
      }
    };
    engine.postMessage('position fen ' + game.fen());
    engine.postMessage('go depth 12');
  }, [game, showHints]);

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

  // Play error sound for illegal moves
  const playErrorSound = useCallback(() => {
    const audio = new Audio('/error.mp3');
    audio.play().catch(() => {});
  }, []);

  // Shake animation for illegal moves
  const shakeBoard = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    playErrorSound();
  }, [playErrorSound]);

  // Update game status
  const updateGameStatus = useCallback(() => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      setGameStatus(`Checkmate! ${winner} wins!`);
      setIsTimerRunning(false);
    } else if (game.isDraw()) {
      setGameStatus('Draw!');
      setIsTimerRunning(false);
    } else if (game.isCheck()) {
      setGameStatus(`${game.turn() === 'w' ? 'White' : 'Black'} is in check!`);
    } else if (game.isStalemate()) {
      setGameStatus('Stalemate!');
      setIsTimerRunning(false);
    } else if (game.isThreefoldRepetition()) {
      setGameStatus('Draw by repetition!');
      setIsTimerRunning(false);
    } else if (game.isInsufficientMaterial()) {
      setGameStatus('Draw by insufficient material!');
      setIsTimerRunning(false);
    } else {
      setGameStatus(`${game.turn() === 'w' ? 'White' : 'Black'}'s turn`);
    }
  }, [game]);

  // Get possible moves for a piece
  const getPossibleMoves = useCallback((square: Square) => {
    const moves = game.moves({ square, verbose: true }) as Move[];
    const possibleSquares: { [square: string]: boolean } = {};
    moves.forEach(move => {
      possibleSquares[move.to] = true;
    });
    return possibleSquares;
  }, [game]);

  // Update captured pieces
  const updateCapturedPieces = useCallback((move: any) => {
    if (move.captured) {
      setCapturedPieces(prev => ({
        ...prev,
        [move.color === 'w' ? 'b' : 'w']: [...prev[move.color === 'w' ? 'b' : 'w'], move.captured]
      }));
    }
  }, []);

  function isValidSquare(square: string): square is Square {
    return /^[a-h][1-8]$/.test(square);
  }

  // Update makeMove function to handle multiplayer
  function makeMove(move: { from: Square; to: Square; promotion?: string }) {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      if (result) {
        if (gameMode === 'online') {
          socket?.emit('move', { move, roomId });
        }
        setGame(gameCopy);
        setMoveHistory(prev => [...prev, result.san]);
        setCurrentPlayer(gameCopy.turn());
        updateCapturedPieces(result);
        updateGameStatus();
        playMoveSound();
        setPossibleMoves({});
        setSelectedSquare(null);
        setBestMove(null);
        return true;
      }
    } catch (e) {
      shakeBoard();
      return false;
    }
    shakeBoard();
    return false;
  }

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    return move;
  }

  function onSquareClick(square: Square) {
    if (!selectedSquare || selectedSquare === square) {
      setSelectedSquare(square);
      setPossibleMoves(getPossibleMoves(square));
    } else if (selectedSquare) {
      const move = makeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });
      setSelectedSquare(null);
      setPossibleMoves({});
      return move;
    }
  }

  function onPieceDragBegin(_piece: string, sourceSquare: string) {
    if (!isValidSquare(sourceSquare)) return;
    
    const moves = game.moves({ square: sourceSquare, verbose: true }) as Move[];
    const piece = game.get(sourceSquare);
    
    if (piece && piece.color === game.turn()) {
      setPossibleMoves(moves.reduce((obj, move) => ({
        ...obj,
        [move.to]: true
      }), {} as { [square: string]: boolean }));
    }
  }

  function onPieceDragEnd() {
    setPossibleMoves({});
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

  // Function to get current theme colors
  const getCurrentTheme = () => boardThemes[boardTheme] || boardThemes.default;

  // Function to handle bot difficulty change
  const handleBotDifficultyChange = (newDifficulty: BotDifficulty) => {
    if (moveHistory.length > 0) {
      const confirmChange = window.confirm('Changing difficulty will start a new game. Are you sure?');
      if (confirmChange) {
        setBotDifficulty(newDifficulty);
        // Reset the game
        setGame(new Chess());
        setMoveHistory([]);
        setCapturedPieces({ w: [], b: [] });
        setCurrentPlayer('w');
        setGameStatus('White\'s turn');
        setTimer({ w: 600, b: 600 });
        setIsTimerRunning(false);
        setSelectedSquare(null);
        setPossibleMoves({});
        setBestMove(null);
      }
    } else {
      setBotDifficulty(newDifficulty);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#1b1b1b] text-white">
        <div className="max-w-8xl mx-auto px-4 py-6">
          {/* Game Mode Selection */}
          <div className="mb-8 flex justify-center space-x-4">
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                gameMode === 'local' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setGameMode('local')}
            >
              Local Game
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                gameMode === 'bot' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setGameMode('bot')}
            >
              Play vs Bot
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                gameMode === 'online' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setGameMode('online')}
            >
              Multiplayer
            </button>
          </div>

          {/* Bot Difficulty Selection */}
          {gameMode === 'bot' && (
            <div className="mb-8 flex justify-center space-x-4">
              {['easy', 'medium', 'hard'].map((difficulty) => (
                <button
                  key={difficulty}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    botDifficulty === difficulty ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handleBotDifficultyChange(difficulty as BotDifficulty)}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Multiplayer Room */}
          {gameMode === 'online' && (
            <div className="mb-8 flex flex-col items-center space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Enter room ID"
                  className="px-4 py-2 bg-gray-700 rounded-lg"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
                <button
                  className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    if (roomId.trim()) {
                      socket?.emit('join', roomId);
                    }
                  }}
                >
                  Join Room
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">or</span>
                <button
                  className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() => {
                    const newRoomId = Math.random().toString(36).substring(2, 8);
                    setRoomId(newRoomId);
                    socket?.emit('create', newRoomId);
                  }}
                >
                  Create New Room
                </button>
              </div>
              {roomId && (
                <div className="text-gray-300">
                  Room ID: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{roomId}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-7 gap-6">
            {/* Left Panel - Game Info */}
            <div className="xl:col-span-2 space-y-4">
              <div className="bg-[#2b2b2b] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-full" />
                    <div>
                      <div className="text-lg font-semibold">White</div>
                      <div className={`text-sm ${currentPlayer === 'w' ? 'text-[#4a9eed]' : 'text-gray-400'}`}>
                        {formatTime(timer.w)}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-chess text-gray-300">
                    {capturedPieces.w.join(' ')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black border border-white/20 rounded-full" />
                    <div>
                      <div className="text-lg font-semibold">Black</div>
                      <div className={`text-sm ${currentPlayer === 'b' ? 'text-[#4a9eed]' : 'text-gray-400'}`}>
                        {formatTime(timer.b)}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-chess text-gray-300">
                    {capturedPieces.b.join(' ')}
                  </div>
                </div>
              </div>

              <div className="bg-[#2b2b2b] rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 text-[#4a9eed]">Game Status</h2>
                <p className="text-base text-gray-200">{gameStatus}</p>
              </div>

              <div className="bg-[#2b2b2b] rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 text-[#4a9eed]">Move History</h2>
                <div className="h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-2 gap-2">
                    {moveHistory.map((move, index) => (
                      <div key={index} className={`py-2 px-3 ${index % 2 === 0 ? 'bg-[#232323]' : ''} rounded`}>
                        <span className="text-gray-400 mr-2">{Math.floor(index / 2) + 1}.</span>
                        <span className="text-gray-200">{move}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hints Toggle */}
              <div className="bg-[#2b2b2b] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Show Hints</span>
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showHints ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                    onClick={() => {
                      setShowHints(!showHints);
                      if (!showHints) getHint();
                    }}
                  >
                    {showHints ? 'Hide Hints' : 'Show Hints'}
                  </button>
                </div>
              </div>
            </div>

            {/* Center Panel - Chessboard */}
            <div className="xl:col-span-3">
              <div className={`bg-[#2b2b2b] p-4 rounded-lg ${isShaking ? 'animate-shake' : ''}`}>
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={onDrop}
                  onSquareClick={onSquareClick}
                  onPieceDragBegin={onPieceDragBegin}
                  onPieceDragEnd={onPieceDragEnd}
                  customBoardStyle={{
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  }}
                  customSquareStyles={{
                    ...(selectedSquare && {
                      [selectedSquare]: { 
                        background: 'rgba(74, 158, 237, 0.15)',
                        borderRadius: '0',
                      },
                    }),
                    ...Object.keys(possibleMoves).reduce((obj, square) => ({
                      ...obj,
                      [square]: {
                        background: isValidSquare(square) && game.get(square)
                          ? 'radial-gradient(circle at center, transparent 25%, rgba(74, 158, 237, 0.4) 25%)'
                          : 'radial-gradient(circle at center, rgba(74, 158, 237, 0.4) 25%, transparent 25%)',
                        borderRadius: '50%',
                      },
                    }), {}),
                    ...(showHints && bestMove && {
                      [bestMove.from]: {
                        background: 'rgba(75, 215, 100, 0.3)',
                      },
                      [bestMove.to]: {
                        background: 'rgba(75, 215, 100, 0.3)',
                      },
                    }),
                  }}
                  customDarkSquareStyle={{ backgroundColor: getCurrentTheme().darkSquare }}
                  customLightSquareStyle={{ backgroundColor: getCurrentTheme().lightSquare }}
                />
              </div>

              <div className="mt-4 flex justify-between">
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 bg-[#2b2b2b] hover:bg-[#323232] text-white rounded flex items-center space-x-2"
                    onClick={() => {
                      setGame(new Chess());
                      setMoveHistory([]);
                      setCapturedPieces({ w: [], b: [] });
                      setCurrentPlayer('w');
                      setGameStatus('White\'s turn');
                      setTimer({ w: 600, b: 600 });
                      setIsTimerRunning(false);
                      setSelectedSquare(null);
                      setPossibleMoves({});
                      setBestMove(null);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span>New Game</span>
                  </button>
                  {(gameMode === 'local' || (gameMode === 'online' && socket?.connected)) && (
                    <button
                      className="px-4 py-2 bg-[#2b2b2b] hover:bg-[#323232] text-white rounded flex items-center space-x-2"
                      onClick={() => {
                        const gameCopy = new Chess(game.fen());
                        const undoneMove = gameCopy.undo();
                        if (undoneMove) {
                          setGame(gameCopy);
                          setMoveHistory(prev => prev.slice(0, -1));
                          setCurrentPlayer(gameCopy.turn());
                          updateGameStatus();
                          setPossibleMoves({});
                          setBestMove(null);
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Undo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Analysis and Settings */}
            <div className="xl:col-span-2 space-y-4">
              <div className="bg-[#2b2b2b] rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 text-[#4a9eed]">Settings</h2>
                <div className="space-y-3">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm text-gray-300">Board Theme</label>
                    <select
                      className="w-full px-3 py-2 bg-[#232323] text-white rounded border border-gray-700 focus:outline-none focus:border-[#4a9eed]"
                      value={boardTheme}
                      onChange={(e) => setBoardTheme(e.target.value)}
                    >
                      <option value="default">Classic Theme</option>
                      <option value="blue">Blue Theme</option>
                      <option value="green">Green Theme</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="px-3 py-2 bg-[#232323] hover:bg-[#2b2b2b] text-white rounded border border-gray-700"
                      onClick={() => {
                        const fen = game.fen();
                        localStorage.setItem('savedGame', fen);
                      }}
                    >
                      Save Position
                    </button>
                    <button
                      className="px-3 py-2 bg-[#232323] hover:bg-[#2b2b2b] text-white rounded border border-gray-700"
                      onClick={() => {
                        const savedFen = localStorage.getItem('savedGame');
                        if (savedFen) {
                          const newGame = new Chess(savedFen);
                          setGame(newGame);
                          setCurrentPlayer(newGame.turn());
                          updateGameStatus();
                          setPossibleMoves({});
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
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #232323;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a9eed;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b8bda;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.15s ease-in-out 0s 2;
        }
      `}</style>
    </>
  );
} 