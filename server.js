const express = require('express');
const app = express();
const { ExpressPeerServer } = require("peer");
const http = require('http');

const server = http.Server(app)

const peerServer = ExpressPeerServer(server, {
    path: "/peerjs",
  });

  const { Server } = require("socket.io");
  const io = new Server(server);
   
const {v4 : uuidV4 } = require('uuid')
  
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/', peerServer);

app.get('/', (req, res) =>{
res.redirect(`/${uuidV4()}`)

})

app.get('/:room', (req, res) =>{
    res.render('room', {roomId: req.params.room})
})

io.on('connection',socket =>{
    socket.on('join-room', (roomId, userId)=>{
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)
        console.log('roomId: '+ roomId,'userId: '+ userId)
        socket.on('disconnect',()=>{
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
} )

server.listen(process.env.PORT || 3000)