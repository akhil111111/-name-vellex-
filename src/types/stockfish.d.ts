declare module 'stockfish.js' {
  export default class Stockfish {
    constructor();
    postMessage(message: string): void;
    onmessage: (event: { data: string }) => void;
    terminate(): void;
  }
} 