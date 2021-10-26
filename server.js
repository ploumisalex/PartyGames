const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatmsg = require('./utils/messages');
const {user_join,get_user,user_leave,get_room_users,get_room_emits,increase_room_emits,zero_room_emits,get_room_user_count,add_room_data,get_room_data,get_rounds_left,delete_room,get_results,send_results,decrease_room_emits,user_emitted,users_emitted_false,startgame,is_game_running,get_round_type,set_round_type} = require('./utils/users');
const random_promt = require('./utils/promts');
const { off } = require('process');

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
        if(is_game_running(user.room)){
            io.to(socket.id).emit('removeready', get_round_type(user.room));
        }
        socket.broadcast.to(user.room).emit('message', formatmsg('bot', 'User ' + user.username + ' has joined the room.',1))
        io.to(user.room).emit('room_users', get_room_users(user.room));
    });

    socket.on('start_game', ()=>{
        const user = get_user(socket.id);
        user_emitted(user.id);
        increase_room_emits(user.room);
        io.to(user.room).emit('message', formatmsg('bot', get_room_emits(user.room) +" out of "+ get_room_user_count(user.room) + " players are ready!" ,0));
        if(get_room_emits(user.room) >= get_room_user_count(user.room)){
            users_emitted_false(user.room);
            startgame(user.room,true);
            if(get_rounds_left(user.room)){
                var randomround = random_promt(user.room);
                io.to(user.room).emit('start_round', randomround);
                set_round_type(user.room,randomround);
            }
        }
    });

    socket.on('start_round', ()=>{
        const user = get_user(socket.id);
        increase_room_emits(user.room);
        user_emitted(user.id);
        if(get_room_emits(user.room) >= get_room_user_count(user.room)){
            zero_room_emits(user.room);
            users_emitted_false(user.room);
            if(get_rounds_left(user.room)){
                var randomround = random_promt(user.room);
                io.to(user.room).emit('start_round', randomround);
                set_round_type(user.room,randomround);
            }else{
                startgame(user.room,false);
                io.to(user.room).emit('final_results', get_room_users(user.room));
            }
        }
    })

    socket.on('results', (data)=>{
        const user = get_user(socket.id);
        increase_room_emits(user.room);
        if(data != null){
            send_results(user.room,data);
        }
        user_emitted(user.id);
        if(get_room_emits(user.room) >= get_room_user_count(user.room)){
            zero_room_emits(user.room);
            users_emitted_false(user.room);
            io.to(user.room).emit('results', {players: get_room_user_count(user.room), results: get_results(user.room)});
            io.to(user.room).emit('room_users', get_room_users(user.room));   
        }
    })

    socket.on('guessed_correctly', (data)=>{
        const user = get_user(data.id);
        const socketuser = get_user(socket.id);
        send_results(user.room, data);
        io.to(user.room).emit('message', formatmsg('bot', 'Player <b>' +socketuser.username + '</b> has correctly guessed the word!',1));
    })

    socket.on('end_phase_one', (datavar)=>{
        const user = get_user(socket.id);
        if(datavar != null){
            var temp = {
                user: socket.id,
                data: datavar
            };
            add_room_data(temp,user.room);
        }
        user_emitted(user.id);
        increase_room_emits(user.room);
        if(get_room_emits(user.room) >= get_room_user_count(user.room)){
            zero_room_emits(user.room);
            users_emitted_false(user.room);
            io.to(user.room).emit('start_second_phase', get_room_data(user.room));
        }
    })

    socket.on('client_message',(msg)=>{
        const user = get_user(socket.id);
        io.to(user.room).emit('message', formatmsg(user.username,msg,0));
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
            if(user.alreadyemitted){
                decrease_room_emits(user.room,user);
            }else{
                if((get_room_emits(user.room) == get_room_user_count(user.room)) && get_room_user_count(user.room) != 0){
                    io.to(get_room_users(user.room)[0].id).emit('emit_again');
                }
            }
            io.to(user.room).emit('message', formatmsg('bot', 'User ' + user.username + ' has left the room.',2));
            io.to(user.room).emit('room_users', get_room_users(user.room));
            delete_room(user.room);
        }
    });
})



server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
})
