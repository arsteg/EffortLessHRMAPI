// socket.js
const { connectedUser } = require('../models/commons/connectedUser')

const disconnectClient = (client, io) => {
  client.on('disconnect', () => {
    connectedUser.removeUser(client.id);
    io.emit('users-online', connectedUser.getUserList());
  });
};

const addUserOnline = (client, io) => {
  client.on('add-user', (user) => {
    connectedUser.addUser({ id: client.id, ...user });
    io.emit('users-online', connectedUser.getUserList());
  });
};

const removeUserOnline = (client, io) => {
  client.on('remove-user', () => {
    connectedUser.removeUser(client.id);
    io.emit('users-online', connectedUser.getUserList());
  });
};

module.exports = { disconnectClient, addUserOnline, removeUserOnline };
