const users = [];
const rooms = [];

function user_join(idvar,usernamevar,roomid){
    const user = {
        id: idvar,
        username: usernamevar,
        room: roomid,
        points: 0
    }
    var room_exists = false;
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == roomid){
            room_exists = true;
            break;
        }
    }
    if(!room_exists){
        const temp = {
            room_id: roomid,
            emits: 0,
            data: [],
            results: [],
            rounds: 10,
            rounds_left: 10,
            round_type: 0
        }
        rooms.push(temp);
    }
    users.push(user);
    return user;
}

function get_user(id){
    return users.find( user => user.id === id);
}

function user_points(user,points){
    user.points += points;
}

function user_leave(id){
    const index = users.findIndex(user => user.id === id);
    if(index !== -1){
        return users.splice(index,1)[0];
    }
}

function get_room_users(roomid){
    return {room: roomid, users: users.filter(user => user.room === roomid)};
}

function increase_room_emits(room){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == room){
            rooms[i].emits += 1;
            break;
        }
    }
}

//room.results = {user:userid, count: votes or anything}
//may neeed type of game
function send_results(room,data){
    var temp_room = get_room_by_id(room);
    temp_room.round_type = data.type;
    if(temp_room.results.length > 0){
        for(let i = 0; i < temp_room.results.length; i++){
            if( temp_room.results[i].user.id == data.id){
                temp_room.results[i].count += 1;
                break;
            }
            else{
                temp_room.results.push({user: get_user(data.id),count: data.count , data: data.data})
                break;
            }
        }
    }
    else{
        temp_room.results.push({user: get_user(data.id),count: data.count, data: data.data })
    }  
}

function empty_results(id){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == id){
            rooms[i].results = [];    
        }
    }
}

function get_results(id){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == id){   
            var temp = allocate_points(rooms[i].results, rooms[i].round_type,id);
            empty_results(id);
            return temp;
        }
    }
}

function allocate_points(array,type,roomid){
    var return_array = [];
    if(type == 6){
        array.sort(function(a,b){
            return a.count - b.count;
        });
        var temppoints = 900;
        for(let i = 0; i < array.length; i++){
            user_points(array[i].user, temppoints);
            return_array.push({user: array[i].user, points: {plus: temppoints, minus: 0, bonus: 0},data: array[i].data})
            temppoints -= 160;
        }
    }
    for(let i = 0; i < array.length; i++){
        if(type == 1 || type == 2){
            if(array[i].count == get_room_user_count(roomid)){
                user_points(array[i].user, array[i].count * 800 + 400);
                return_array.push({user: array[i].user, points: {plus: array[i].count * 800, minus: 0, bonus: 400}})
            }
            else if(array[i].count >= 2){
                user_points(array[i].user, array[i].count * 800 + 100)
                return_array.push({user: array[i].user, points: {plus: array[i].count * 800, minus: 0, bonus: 100}})
            }
            else{
                user_points(array[i].user, array[i].count * 800)
                return_array.push({user: array[i].user, points: {plus: array[i].count * 800, minus: 0, bonus: 0}})
            }
        }
        else if(type == 3){
            user_points(array[i].user, array[i].count.correct * 100 - (array[i].count.selected - array[i].count.correct) * 80);
            return_array.push({user: array[i].user, points: {plus: array[i].count.correct * 100, minus: (array[i].count.selected - array[i].count.correct) * 80, bonus: 0},data: array[i].data})
        }
        else if(type == 4){
            user_points(array[i].user, array[i].count.typed * 100 - (array[i].count.total - array[i].count.typed) * 40);
            return_array.push({user: array[i].user, points: {plus: array[i].count.typed * 100, minus: (array[i].count.total - array[i].count.typed) * 40, bonus: 0}})
        }
        else if(type == 5){
            if(array[i].count >= 1){
                user_points(array[i].user, 600 + (array[i].count - 1) * 100);
                return_array.push({user: array[i].user, points: {plus: 600 + (array[i].count - 1) * 100, minus: 0, bonus: 0}})
            }
        }
    }
    return return_array;
}

function get_room_by_id(id){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == id){
            return rooms[i];      
        }
    }
}

function get_room_emits(room){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == room){
            return rooms[i].emits;
        }
    }
}

function zero_room_emits(room){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == room){
            rooms[i].emits = 0;
            break;
        }
    }

}

function get_room_user_count(room){
    return users.filter(user => user.room === room).length;
}

function add_room_data(data,roomid){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == roomid){
            rooms[i].data.push(data);
            break;
        }
    }
}

function get_room_data(roomid){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == roomid){
            var res = rooms[i].data;
            empty_room_data(roomid);
            return res;
        }
    }
}

function empty_room_data(roomid){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == roomid){
            rooms[i].data = [];
        }
    }
}

function get_rounds_left(roomid){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == roomid){
            if(rooms[i].rounds_left > 0){
                minus_one_round(roomid);
                zero_room_emits(roomid);
                return true;
            }
            else{
                return false;
            }
        }
    }
}

function minus_one_round(roomid){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == roomid){
            rooms[i].rounds_left -= 1;
        }
    }
}

function delete_room(roomid){
    if(get_room_user_count(roomid) == 0){
        const index = rooms.findIndex(room => room.room_id === roomid);
        if(index !== -1){
            rooms.splice(index,1)[0];
        }
    }
}

function random_user_from_room(roomid){
    var userindex = Math.floor(Math.random() * get_room_user_count(roomid));
    return get_room_users(roomid).users[userindex];
}


module.exports = {
    user_join,
    get_user,
    user_leave,
    get_room_users,
    get_room_emits,
    increase_room_emits,
    zero_room_emits,
    get_room_user_count,
    add_room_data,
    get_room_data,
    get_rounds_left,
    delete_room,
    get_results,
    send_results,
    random_user_from_room
}