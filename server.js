const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatmsg = require('./utils/messages');
const {user_join,get_user,user_leave,get_room_users,get_room_emits,increase_room_emits,zero_room_emits,get_room_user_count,add_room_data,get_room_data,get_rounds_left,delete_room,get_results,send_results} = require('./utils/users');
const random_promt = require('./utils/promts');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 4000;
var canvases_array = [];
const total_rounds = 5;

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', (socket) =>{

    socket.on('join_room', (data)=>{
        const user = user_join(socket.id, data.username, data.room);
        socket.join(user.room);
        socket.broadcast.to(user.room).emit('message', formatmsg('bot', 'User ' + user.username + ' has joined the room.'))
        io.to(user.room).emit('room_users', get_room_users(user.room));
    });

    socket.on('start_game', (data)=>{
        const user = get_user(socket.id);
        increase_room_emits(user.room);
        io.to(user.room).emit('message', formatmsg('bot', get_room_emits(user.room) +" out of "+ get_room_user_count(user.room) + " players are ready!" ));
        if(get_room_emits(user.room) == get_room_user_count(user.room)){
            if(get_rounds_left(user.room)){
                io.to(user.room).emit('start_round', random_promt(user.room));
            }
        }
    });

    socket.on('start_round', ()=>{
        const user = get_user(socket.id);
        increase_room_emits(user.room);
        if(get_room_emits(user.room) == get_room_user_count(user.room)){
            zero_room_emits(user.room);
            if(get_rounds_left(user.room)){
                io.to(user.room).emit('start_round', random_promt(user.room));
                io.to(user.room).emit('room_users', get_room_users(user.room));
            }else{
                io.to(user.room).emit('message', formatmsg('bot', 'Telos to paixnidi magkes, glipste mou ta ligma'));
            }
        }
    })

    socket.on('results', (data)=>{
        const user = get_user(socket.id);
        increase_room_emits(user.room);
        send_results(user.room,data);
        if(get_room_emits(user.room) == get_room_user_count(user.room)){
            zero_room_emits(user.room);
            io.to(user.room).emit('results', {players: get_room_user_count(user.room), results: get_results(user.room)});
            io.to(user.room).emit('room_users', get_room_users(user.room));   
        }
    })

    socket.on('guessed_correctly', (data)=>{
        const user = get_user(data.id);
        const socketuser = get_user(socket.id);
        send_results(user.room, data);
        io.to(user.room).emit('message', formatmsg('bot', 'Player ' +socketuser.username + ' has correctly guessed the word!'));
    })

    socket.on('end_phase_one', (datavar)=>{
        const user = get_user(socket.id);
        var temp = {
            user: socket.id,
            data: datavar
        };
        add_room_data(temp,user.room)
        increase_room_emits(user.room);
        if(get_room_emits(user.room) == get_room_user_count(user.room)){
            zero_room_emits(user.room);
            io.to(user.room).emit('start_second_phase', get_room_data(user.room));
        }
    })

    socket.on('client_message',(msg)=>{
        const user = get_user(socket.id);
        io.to(user.room).emit('message', formatmsg(user.username,msg));
    });

    socket.on('canvasctx', (data)=>{
        const user = get_user(socket.id);
        socket.broadcast.to(user.room).emit('canvasctx', data);
    })

    socket.on('canvasctxcolor', (data)=>{
        const user = get_user(socket.id);
        socket.broadcast.to(user.room).emit('canvasctxcolor', data);
    })

    socket.on('canvasctxwidth', (data)=>{
        const user = get_user(socket.id);
        socket.broadcast.to(user.room).emit('canvasctxwidth', data);
    })

    socket.on('canvasctxclear', ()=>{
        const user = get_user(socket.id);
        socket.broadcast.to(user.room).emit('canvasctxclear');
    })

    socket.on('canvasctxstop', ()=>{
        const user = get_user(socket.id);
        socket.broadcast.to(user.room).emit('canvasctxstop');
    })

    socket.on('canvasctxdot', (data)=>{
        const user = get_user(socket.id);
        socket.broadcast.to(user.room).emit('canvasctxdot', data);
    })

    socket.on('disconnect', () =>{
        const user = user_leave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatmsg('bot', 'User ' + user.username + ' has left the room.'));
            io.to(user.room).emit('room_users', get_room_users(user.room));
            delete_room(user.room);
        }
    });
})



server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
})