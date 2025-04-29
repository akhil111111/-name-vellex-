'use client';

import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());

  function makeAMove(move: any) {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to a queen for example simplicity
    });
    return move;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Chess</h1>
        <p className="text-gray-300">Play against a friend or practice your skills</p>
      </div>

      <div className="max-w-[600px] mx-auto">
        <Chessboard 
          position={game.fen()} 
          onPieceDrop={onDrop}
          boardWidth={600}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
        />
      </div>

      <div className="flex justify-center space-x-4">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          onClick={() => {
            setGame(new Chess());
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
            }
          }}
        >
          Undo Move
        </button>
      </div>
    </div>
  );
} 