const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (roomId) => {
    // Leave previous room if any
    const prevRoom = [...socket.rooms].find(room => room !== socket.id);
    if (prevRoom) {
      socket.leave(prevRoom);
    }

    // Join new room
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { white: socket.id });
      socket.emit('color', 'w');
    } else {
      const room = rooms.get(roomId);
      if (!room.black) {
        room.black = socket.id;
        socket.emit('color', 'b');
      }
    }

    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    io.to(roomId).emit('players', roomSize);
  });

  socket.on('move', ({ move, roomId }) => {
    socket.to(roomId).emit('move', move);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up rooms
    for (const [roomId, room] of rooms.entries()) {
      if (room.white === socket.id || room.black === socket.id) {
        if (room.white === socket.id) delete room.white;
        if (room.black === socket.id) delete room.black;
        if (!room.white && !room.black) rooms.delete(roomId);
        io.to(roomId).emit('players', io.sockets.adapter.rooms.get(roomId)?.size || 0);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 