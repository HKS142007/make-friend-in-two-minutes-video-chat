const express = require("express");
const app = express();

const port = 5000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));
let code = "AYA"
let Idlesockets = [];
let activeSockets = []
io.sockets.on("connection", async socket => {
  console.log('connect-before',Idlesockets.length,activeSockets.length)
  Idlesockets = await [...Idlesockets,socket]
  activeSockets = await [...activeSockets,socket];
  console.log('connect-after',Idlesockets.length,activeSockets.length)

  socket.emit('new-connections', {
    idle: Idlesockets.length,
    online: activeSockets.length
  })

  console.log('new connection')
 
  socket.on("call-user", data => {
    console.log('call-user',data)
    if (Idlesockets.length <= 1) {
      socket.emit('no-idle');
      return;
    }

    let filteredUsers = Idlesockets.filter(users => users.id !== socket.id)
    var randomUser;
    randomUser = filteredUsers[Math.floor(Math.random() * filteredUsers.length)];

    Idlesockets = Idlesockets.filter(existingSocket => existingSocket.id !== socket.id)
    Idlesockets = Idlesockets.filter(existingSocket => existingSocket.id !== randomUser.id)
    
    socket.emit('new-connections', {
      idle: Idlesockets.length,
      online: activeSockets.length
    })

      io.to(socket.id).emit('set-camera',randomUser.hasCamera)
      io.to(randomUser.id).emit('set-camera',socket.hasCamera)

    socket.to(randomUser.id).emit("call-made", {
      peerId: data.peerId,
      user: socket.id,
    });
  });

  socket.on('camera',(hasCamera)=>{
    socket.hasCamera = hasCamera
    console.log(socket.id,socket.hasCamera)
  })

  


  socket.on("disconnect", async () => {
    console.log('discconected')
    console.log('disc-before',Idlesockets.length,activeSockets.length)
    Idlesockets = await Idlesockets.filter(Idlesocket => Idlesocket.id !== socket.id)
    activeSockets = await activeSockets.filter(activeSocket => activeSocket.id !== socket.id)
    console.log('connect-after',Idlesockets.length,activeSockets.length)

    socket.emit('new-connections', {
      idle: Idlesockets.length,
      online: activeSockets.length
    })
  });
});


app.get('/checkCode',(req,res)=>{
  let givenCode = req.query.code;
  if(code == givenCode)
    res.end('true')
  else
    res.end('false');  

})

io.sockets.on("error", e => console.log(e));
server.listen(process.env.PORT || port, () => console.log(`Server is running on port ${port}`));