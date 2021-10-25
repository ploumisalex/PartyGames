const users = [];
const rooms = [];

function user_join(idvar,usernamevar,roomid){
    const user = {
        id: idvar,
        username: usernamevar,
        room: roomid,
        points: 0,
        alreadyemitted: false
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
            rounds: 1,
            rounds_left: 1,
            round_type: null,
            gamestarted: false
        }
        rooms.push(temp);
    }
    else{
        const roomvar = get_room_by_id(roomid);
        if(roomvar.gamestarted){
            increase_room_emits(roomvar.room_id);
        }
    }
    users.push(user);
    return user;
}

function get_user(id){
    return users.find( user => user.id === id);
}

function user_points(user,points){
    if(user){
        user.points += points;
    }
}

function user_leave(id){
    const index = users.findIndex(user => user.id === id);
    if(index !== -1){
        return users.splice(index,1)[0];
    }
}

function get_room_users(roomid){
    return users.filter(user => user.room === roomid);
}

function increase_room_emits(room){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == room){
            rooms[i].emits += 1;
            break;
        }
    }
}

function decrease_room_emits(roomid,user){
    for(let i = 0; i< rooms.length; i++){
        if(rooms[i].room_id == roomid){
            rooms[i].emits -= 1;
            break;
        }
    }
}

function user_emitted(userid){
    const user = get_user(userid);
    user.alreadyemitted = true;
}

function users_emitted_false(roomid){
    const users = get_room_users(roomid);
    for(let i = 0; i < users.length; i++){
        users[i].alreadyemitted = false;
    }
}

//room.results = {user:userid, count: votes or anything}
//may neeed type of game
function send_results(room,data){
    if(get_user(data.id)){
        var temp_room = get_room_by_id(room);
        var tempitem = temp_room.results.find(item => item.user.id === data.id);
        if(tempitem){
            if(temp_room.round_type.type == 5){
                tempitem.count += 1;
            }
            else{
                tempitem.count += 1;
                tempitem.data.push(data.data);
            }
            var tempuser = get_user(data.data);
        }
        else{
            if(temp_room.round_type.type == 1 || temp_room.round_type.type == 2){
                temp_room.results.push({user: get_user(data.id),count: data.count, data: [data.data] })
            }
            else{
                temp_room.results.push({user: get_user(data.id),count: data.count, data: data.data })
            }
        }
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
            var temp = allocate_points(rooms[i].results, rooms[i].round_type.type,id);
            empty_results(id);
            return temp;
        }
    }
}

//game 7 points
var cardpoints = [-200,-100,0,200,1000];

function allocate_points(array,type,roomid){
    var return_array = [];
    if(type == 6){
        array.sort(function(a,b){
            return a.count - b.count;
        });
        var temppoints = 900;
        for(let i = 0; i < array.length; i++){
            if(get_user(array[i].user.id)){
                user_points(array[i].user, temppoints);
                return_array.push({user: array[i].user, points: {plus: temppoints, minus: 0, bonus: 0},data: array[i].data})
                temppoints -= 160;
            }
        }
    }
    if(type == 7){
        for(let j = 0; j < array.length; j ++){
            var voted = array[j].data;
            var num = array.filter(item => item.data === voted).length;
            if(num == 1){
                user_points(array[j].user, cardpoints[array[j].data]);
                if(cardpoints[array[j].data] >= 0){
                    return_array.push({user: array[j].user, points: {plus: cardpoints[array[j].data],minus: 0, bonus: 0},data: array[j].data});
                }
                else{
                    return_array.push({user: array[j].user, points: {plus: 0,minus: -cardpoints[array[j].data], bonus: 0},data: array[j].data});
                }
            }else{
                user_points(array[j].user, num * (- 500));
                return_array.push({user: array[j].user, points: {plus: 0,minus: num * ( 500), bonus: 0},data: array[j].data});
            }
        }
    }
    for(let i = 0; i < array.length; i++){
        if(get_user(array[i].user.id)){
            if(type == 1 || type == 2){
                if(array[i].count == get_room_user_count(roomid)){
                    user_points(array[i].user, array[i].count * 800 + 400);
                    return_array.push({user: array[i].user, points: {plus: array[i].count * 800, minus: 0, bonus: 400},data:array[i].data})
                }
                else if(array[i].count >= 2){
                    user_points(array[i].user, array[i].count * 800 + 100)
                    return_array.push({user: array[i].user, points: {plus: array[i].count * 800, minus: 0, bonus: 100},data:array[i].data})
                }
                else{
                    user_points(array[i].user, array[i].count * 800)
                    return_array.push({user: array[i].user, points: {plus: array[i].count * 800, minus: 0, bonus: 0},data:array[i].data})
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
            var tempres = rooms[i].data;
            empty_room_data(roomid);
            return tempres;
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
    return get_room_users(roomid)[userindex];
}

function startgame(roomid){
    const room = get_room_by_id(roomid);
    room.gamestarted = true;
}

function is_game_running(roomid){
    const room = get_room_by_id(roomid);
    return room.gamestarted;
}

function get_round_type(roomid){
    const room = get_room_by_id(roomid);
    return room.round_type;
}

function set_round_type(roomid,data){
    const room = get_room_by_id(roomid);
    room.round_type = data;
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
    random_user_from_room,
    decrease_room_emits,
    user_emitted,
    users_emitted_false,
    startgame,
    is_game_running,
    get_round_type,
    set_round_type
}