const express = require("express");
const app = express();

const port = 5000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

let Idlesockets = [];
let activeSockets = []
io.sockets.on("connection", socket => {
  console.log('new connection')
  Idlesockets.push(socket.id)
  activeSockets.push(socket.id)
  socket.on("call-user", data => {
    if (Idlesockets.length <= 1) {
      socket.emit('no-idle');
      return;
    }

    let filteredUsers = Idlesockets.filter(users => users !== socket.id)
    randomUser = filteredUsers[Math.floor(Math.random() * filteredUsers.length)];

    Idlesockets = Idlesockets.filter(existingSocket => existingSocket !== socket.id)
    Idlesockets = Idlesockets.filter(existingSocket => existingSocket !== randomUser)
    socket.emit('new-connections', {
      idle: Idlesockets.length,
      online: activeSockets.length
    })
    var randomUser;



    socket.to(randomUser).emit("call-made", {
      peerId: data.peerId,
      user: socket.id
    });
  });

  socket.emit('new-connections', {
    idle: Idlesockets.length,
    online: activeSockets.length
  })
  socket.on("make-answer", data => {
    // Idlesockets =  Idlesockets.filter(existingSocket => existingSocket !== socket.id) 
    // Idlesockets =  Idlesockets.filter(existingSocket => existingSocket !== data.to) 
    console.log(Idlesockets, activeSockets)
    socket.to(data.to).emit("answer-made", {
      user: socket.id,
      answer: data.answer
    });
  });

  socket.on("disconnect", () => {
    console.log('discconected')
    Idlesockets = Idlesockets.filter(existingSocket => existingSocket !== socket.id)
    activeSockets = activeSockets.filter(existingSocket => existingSocket !== socket.id)
    socket.emit('new-connections', {
      idle: Idlesockets.length,
      online: activeSockets.length
    })
  });
});



io.sockets.on("error", e => console.log(e));
server.listen(process.env.PORT || port, () => console.log(`Server is running on port ${port}`));