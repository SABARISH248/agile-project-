const { Server } = require('socket.io');
const logger = require('./logger');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    // Join room based on user role and user id
    socket.on('join_room', ({ userId, role }) => {
      if (role) {
        socket.join(`role:${role}`);
        logger.info(`Socket ${socket.id} joined role room: role:${role}`);
      }
      if (userId) {
        socket.join(`user:${userId}`);
        logger.info(`Socket ${socket.id} joined user room: user:${userId}`);
      }
    });

    socket.on('leave_room', ({ userId, role }) => {
      if (role) socket.leave(`role:${role}`);
      if (userId) socket.leave(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};

const emitToAll = (event, data) => {
  if (io) io.emit(event, data);
};

const emitToRole = (role, event, data) => {
  if (io) io.to(`role:${role}`).emit(event, data);
};

const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};

module.exports = {
  initSocket,
  getIO,
  emitToAll,
  emitToRole,
  emitToUser,
};
