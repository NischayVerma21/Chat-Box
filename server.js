const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./message.js');
const {userJoin,getCurrentUser,userLeave,getRoomUsers } = require('./user.js');
const botName = 'Chat Bot';



const app = express();
const PORT = 80;
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname,'public')));

server.listen(PORT ,()=> {console.log(`Server is running on ${PORT}`)});




io.on('connection', socket =>{
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id, username ,room);
        socket.join(user.room);
        


        socket.emit('message',formatMessage( botName,'Welcome to ChatBox'));

        socket.broadcast.to(user.room).emit('message', formatMessage( botName,` ${user.username} has Joined the Chat`));

        io.to(user.room).emit('roomUsers',{
            room : user.room,
            users : getRoomUsers(user.room)
        });
    });
   
    
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage( user.username, msg));
    } );
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage( botName,` ${user.username} has left the Chat`));
            io.to(user.room).emit('roomUsers',{
                room : user.room,
                users : getRoomUsers(user.room)
            })

        }


        
    })

    
})






