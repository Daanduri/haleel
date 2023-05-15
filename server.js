const path = require('path');
const express = require('express')
const http = require('http')
const moment = require('moment');
const socketio = require('socket.io');
require('./mongo connect/index')
const Users = require('./model/users')
const Message = require('./model/messege')
const PORT = process.env.PORT || 5000;

const app = express();

// app.use(express.static(path.join(__dirname,'./public/')))
const server = http.createServer(app);

const io = socketio(server);


app.use(express.static(path.join(__dirname, './public')));

let rooms = {};
let socketroom = {};
let socketname = {};
let micSocket = {};
let videoSocket = {};
let roomBoard = {};



io.on('connect', socket => {

    socket.on("join room", (roomid, username) => {
        // console.log('user name', username)
        // console.log('room id', roomid)
       

       
        socket.join(roomid);
        socketroom[socket.id] = roomid;
        socketname[socket.id] = username;
        micSocket[socket.id] = 'on';
        videoSocket[socket.id] = 'on';

    

        let current_participants = Object.values(socketname)
        // console.log('socketname',socketname)

        if(current_participants.includes(username)){
            let count =1
            socket.emit('user-exist', count)
            // return;
        }
        
       

        if (rooms[roomid] && rooms[roomid].length > 0) {
            rooms[roomid].push(socket.id);
            socket.to(roomid).emit('message', `${username} joined the room.`, 'user', moment().format(
                "h:mm a"
            ), socketname, username);
            io.to(socket.id).emit('join room', rooms[roomid].filter(pid => pid != socket.id), socketname, micSocket, videoSocket, username);
           
        }
        else {
            rooms[roomid] = [socket.id];
            io.to(socket.id).emit('join room', null, null, null, null,null);
        }

        io.to(roomid).emit('user count', rooms[roomid].length);

    });

    socket.on('action', msg => {
        if (msg == 'mute')
            micSocket[socket.id] = 'off';
        else if (msg == 'unmute')
            micSocket[socket.id] = 'on';
        else if (msg == 'videoon')
            videoSocket[socket.id] = 'on';
        else if (msg == 'videooff')
            videoSocket[socket.id] = 'off';

        socket.to(socketroom[socket.id]).emit('action', msg, socket.id);
    })

    socket.on('video-offer', (offer, sid) => {
        socket.to(sid).emit('video-offer', offer, socket.id, socketname[socket.id], micSocket[socket.id], videoSocket[socket.id]);
    })

    socket.on('video-answer', (answer, sid) => {
        socket.to(sid).emit('video-answer', answer, socket.id);
    })

    socket.on('new icecandidate', (candidate, sid) => {
        socket.to(sid).emit('new icecandidate', candidate, socket.id);
    })

    socket.on('message', (msg, username, roomid) => {
        io.to(roomid).emit('message', msg, username, moment().format(
            "h:mm a"
        ));
    })

    socket.on('cut-call', (username,roomid)=>{
      /* socketname.filter(client=> { console.log('client', client) }) */
      for (var key in socketname) {
        if (socketname[key] == username) delete socketname[key];
    }

    console.log('socket', socketname)
    io.to(roomid).emit('disconnectUser',socketname)
        // socketname = {};
    })

    socket.on('getCanvas', () => {
        if (roomBoard[socketroom[socket.id]])
            socket.emit('getCanvas', roomBoard[socketroom[socket.id]]);
    });

    socket.on('draw', (newx, newy, prevx, prevy, color, size) => {
        socket.to(socketroom[socket.id]).emit('draw', newx, newy, prevx, prevy, color, size);
    })

    socket.on('clearBoard', () => {
        socket.to(socketroom[socket.id]).emit('clearBoard');
    });

    socket.on('store canvas', url => {
        roomBoard[socketroom[socket.id]] = url;
    })

   

    socket.on('disconnect', () => {
        if (!socketroom[socket.id]) return;
        console.log('socketroom[socket.id]',socketroom[socket.id])
        // socket.to(socketroom[socket.id]).emit('message', `${socketname[socket.id]} left the chat.`, 'user', moment().format(
        //     "h:mm a"
        // ));

       
          
          
        socket.to(socketroom[socket.id]).emit('remove peer', socket.id);
        var index = rooms[socketroom[socket.id]].indexOf(socket.id);
        rooms[socketroom[socket.id]].splice(index, 1);
        io.to(socketroom[socket.id]).emit('user count', rooms[socketroom[socket.id]].length);
        delete socketroom[socket.id];
        console.log('--------------------', socketname);

        // socket.emit('disconnectUser',socketname)
        console.log('room',rooms[socketroom[socket.id]]);

        //toDo: push socket.id out of rooms
    });
})


server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));