const socket = io();

const chat = $('#chat');
const chatul = $('#chatlog');
const timer = $('#timer');
const usersul = $('#users');
const promt_label = $('#promt');
const data_ul = $('#data_ul');
const second_panel = $('#second_panel');
second_panel.css("display", "none");
const game_fill = $('#game_fill');
game_fill.css("display", "none");
const game_draw = $('#game_draw');
game_draw.css("display", "none");
const game_pattern = $('#game_pattern');
game_pattern.css("display", "none");
const game_typeracer = $('#game_typeracer');
game_typeracer.css("display", "none");
const game_geomaster = $('#game_geomaster');
game_geomaster.css("display", "none");
const game_pickcard = $('#game_pickcard');
game_pickcard.css('display','none');
const cardbuttons = document.querySelectorAll('.pickcard_button');
const typeracer_ul = document.getElementById('typeracer_ul');
const typeracer_form = $('#typeracer_form');
const typeracer_input = document.getElementById("typeracer_input");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var painting = document.getElementById("canvas_div");
var painting_style = getComputedStyle(painting);

var clock_audio = new Audio('/sfx/clock.flac');
var bubble_audio = new Audio('/sfx/bubble.wav');
var hit_audio = new Audio('/sfx/hit.wav');
var laugh_audio = new Audio('/sfx/laugh.wav');
hit_audio.volume = 0.5;
clock_audio.volume = 0.5;
laugh_audio.volume = 0.5;

canvas.height = 656; 
canvas.width = 960; 


var mouse = {x: 0,y: 0};
ctx.lineWidth = 8;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
var drawing = false;
var canusechat = true;

var t; //timer
var current_game = 0; //very important
var query_array = [];
var result_array = [];
var myid = '';
var myusername = '';
var current_word = '';
var artistid = '';
var guesslocation = {lat: 256, lng: 256};
var querylocation;
var has_sent_results = false;
var votearray = [];
var cardpicked = 2;
var cardpoints = ['-200 points','-100 points','0 points','+200 points','+1000 points'];
var dodgeballplayer = {
    radius: 32,
    speed: 6,
    lives: 3,
    x: 480,
    y: 328
}

var dodgeballcontroller = {
    left: false,
    right: false,
    up: false,
    down: false
}

var dodgeballlives = 5;
var dodgeballframe = 0;
var dodgeballstop = false;
var bulletsarray = [];
class bullet{
    constructor(type){
        this.type = type;
        this.speed = Math.random() * 4 + 3;
        this.radius = 4;
        this.distance;
        if(type == 0 ){
            this.x = Math.random() * 960;
            this.y = 0;
        }
        else if(type == 1){
            this.x = 960;
            this.y = Math.random() * 656;
        }
        else{
            this.x = 0;
            this.y = Math.random() * 656;
        }
    }

    update(){
        if(this.type == 0){
            this.y += this.speed;
        }
        else if(this.type == 1){
            this.x -= this.speed;
        }
        else{
            this.x += this.speed;
        }
        const dx = this.x - dodgeballplayer.x;
        const dy = this.y - dodgeballplayer.y;
        this.distance = Math.sqrt(dx*dx + dy*dy);
    }

    draw(){
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
}

//in case someone leaves
var emitagain = '';

const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true,
})
myusername = username;

function outputMessage(data){
    const templi = document.createElement('li');
    templi.innerHTML = "<li class='chatli'><label>"+ data.username +":</label><span>" + data.msg + "</span></li>";
    if(data.color == 1){
        templi.classList.add('green');
    }else if(data.color == 2){
        templi.classList.add('red');
    }
    chatul.append(templi);
}

chat.submit((e)=>{
    e.preventDefault();
    if(canusechat){
        const msg = e.target.elements.msg.value;
        if( current_game == 5){
            if(msg == current_word){
                canusechat = false;
                socket.emit('guessed_correctly', {id: artistid, count: 1,data: ''})
                socket.emit('results', {id: myid, count:  1,data: ''});
                emitagain = 'results';
                e.target.elements.msg.value = '';
            }
            else{
                socket.emit('client_message', msg);
                e.target.elements.msg.value = '';
                e.target.elements.msg.focus();
            }
        }
        else{
            socket.emit('client_message', msg);
            e.target.elements.msg.value = '';
            e.target.elements.msg.focus();
        }
    }
})

socket.on('emit_again', ()=>{
    socket.emit(emitagain, null);
})

typeracer_form.submit((e)=>{
    e.preventDefault();
    const word = e.target.elements.typeracer_input.value;
    if(query_array.includes(word) && !result_array.includes(word)){
        e.target.elements.typeracer_input.value = '';
        e.target.elements.typeracer_input.focus();
        result_array.push(word);
        var removeli = document.getElementById(word+'_r');
        typeracer_ul.removeChild(removeli);
    }
})

function start_timer(seconds,callfunction){
    clearInterval(t)
    timer.html(seconds);
    t = setInterval(function(){
        timer.html(timer.html() - 1);
        if (timer.html() < 0){
            clearInterval(t);
            timer.html(0);
            callfunction();
        }
        else if(timer.html() < 3){
            clock_audio.play();
        }
    }, 1000);
}

socket.on('room_users', (users) =>{
    usersul.html('');
    var pointsimg = '/imgs/omegalul.png';
    for (let i = 0; i < users.length; i++) {    
        const user = document.createElement("li");
        user.innerHTML = "<li class='usersli'><div><label>"+ users[i].username +"</label><p>"+users[i].points +" Points</p></div><img src="+pointsimg+"></li>";
        usersul.append(user);
    }
})

socket.on('message', (data)=>{
    outputMessage(data);
    chatul.scrollTop = chatul.scrollHeight;
})

socket.emit('join_room', {username,room});

socket.on('final_results', (users)=>{
    promt_label.html('The winner is');
    users.sort(function(a, b){
        return b.points - a.points;
    });
    for(let i = 0 ; i < users.length; i ++){
        var tempuserli = document.createElement('li');
        if(i == 0){
            tempuserli.classList.add('winner');
        }
        tempuserli.classList.add('finalresultsli');
        tempuserli.innerHTML = '<label><b>' + users[i].username + '</b> ' + users[i].points +'</label>';
        data_ul.append(tempuserli);
    }
    laugh_audio.play();
})

function start_game(){
    $('#ready').css('visibility','hidden')
    socket.emit('start_game');
    emitagain = 'start_game';
}

socket.on('removeready',(data)=>{
    $('#ready').css('visibility','hidden');
    current_game = data.type;
    if(current_game == 5){
        artistid = data.query.user.id;
        current_word = data.query.word;
    }
    else if(current_game == 6){
        querylocation = data.query;
    }
    else if(current_game == 3){
        query_array = data.query;
    }
})

socket.on('results', (data) =>{
    clearInterval(t);
    canusechat = true;
    data_ul.html('');
    promt_label.html('Results of the previous round');
    set_visibility(second_panel);
    data_ul.css('flexDirection','column');
    for(let i = 0; i < data.results.length; i++){
        var temp_li = document.createElement('li');
        if(data.results[i].points.bonus != 0 && data.results[i].points.minus != 0){
            temp_li.innerHTML = "<li class='resultsli'><label><b>"+ data.results[i].user.username +"</b> +"+ data.results[i].points.plus +" +"+ data.results[i].points.bonus +" -"+  data.results[i].points.minus+"</label></li>"; 
        }else if(data.results[i].points.bonus != 0){
            temp_li.innerHTML = "<li class='resultsli'><label><b>"+ data.results[i].user.username +"</b> +"+ data.results[i].points.plus +" +"+ data.results[i].points.bonus +"</label></li>";
        }else if(data.results[i].points.minus != 0){
            temp_li.innerHTML = "<li class='resultsli'><label><b>"+ data.results[i].user.username +"</b> +"+ data.results[i].points.plus +" -"+  data.results[i].points.minus+"</label></li>"; 
        }
        else{
            temp_li.innerHTML = "<li class='resultsli'><label><b>"+ data.results[i].user.username +"</b> +"+ data.results[i].points.plus +"</label></li>";
        }
        data_ul.append(temp_li);
    }
    if(current_game == 1 || current_game == 2){
        create_vote_div(data);
    }
    else if(current_game == 5){
        var templabel = document.createElement('label');
        templabel.classList.add('templabel');
        templabel.innerHTML = 'The word was: <b>'+ current_word+'</b>';
        data_ul.append(templabel);
    }
    else if(current_game == 3){
        fill_mini_pattern_table();
        fill_mini_pattern_tables(data);
    }
    else if(current_game == 6){
        create_results_map(data);
    }
    else if(current_game == 7){
        show_cards_picked(data);
    }
    else if(current_game == 4){
        var tempimg = document.createElement('img');
        tempimg.src = '/imgs/goku.gif';
        data_ul.append(tempimg);
    }
    start_timer(15, ()=>{
        data_ul.html('');
        socket.emit('start_round');
        emitagain = 'start_round';
    });
})

socket.on('start_second_phase', (res)=>{
    clearInterval(t);
    timer.html('');
    has_sent_results = false;
    second_phase_data(res);
})

socket.on('start_round',(promt)=>{
    second_panel.css("display", "none");
    has_sent_results = false;
    current_game = promt.type;
    if(promt.type == 1){
        promt_label.html("Next Round: Draw my thing!");
        start_timer(5,()=>{
            bubble_audio.play();
            start_round_draw(promt);
        });
    }
    else if(promt.type == 2){
        promt_label.html("Next Round: Fill the blank!");
        start_timer(5,()=>{
            bubble_audio.play();
            start_round_fill(promt);
        });
    }
    else if(promt.type == 3){
        promt_label.html("Next Round: Memorize the pattern!");
        start_timer(5,()=>{
            bubble_audio.play();
            start_round_pattern(promt);
        });
    }
    else if(promt.type == 4){
        promt_label.html("Next Round: Typeracer!");
        start_timer(5,()=>{
            bubble_audio.play();
            start_round_typeracer(promt);
        });
    }
    else if(promt.type == 5){
        promt_label.html("Next Round: Guess the drawing! Player <b>" + promt.query.user.username + "</b> is drawing.");
        start_timer(5,()=>{
            bubble_audio.play();
            start_round_guessdraw(promt);
        });
    }
    else if(promt.type == 6){
        promt_label.html("Next Round: Geomaster!");
        start_timer(5,()=>{
            bubble_audio.play();
            start_round_geomaster(promt);
        });
    }
    else if(promt.type == 7){
        promt_label.html("Next Round: Pick a card!");
        start_timer(5,()=>{
            bubble_audio.play();
            start_round_pickcard();
        });
    }
    else if(promt.type == 8){
        promt_label.html("Next Round: Dodgeball!");
        start_timer(5,()=>{
            bubble_audio.play();
            start_round_dodgeball();
        });
    }
})

function second_phase_data(res){
    set_visibility(second_panel);
    data_ul.html('');
    if(current_game == 1){
        votearray = res;
        second_phase_draw_data(res);
    }
    else if(current_game == 2){
        votearray = res;
        second_phase_fill_data(res);
    }
    else if(current_game == 3){
        second_phase_pattern_data(res);
    }
}

function end_phase_one(){
    has_sent_results = true;
    if(current_game == 1){
        $('#done').css('visibility','hidden');
        drawing = false;   
        const canvas_data = canvas.toDataURL();
        socket.emit('end_phase_one', canvas_data);
        emitagain = 'end_phase_one';
    }
    else if(current_game == 2){
        $('#done2').css('visibility','hidden');
        var inputel = document.getElementById("fill_input");
        const fill_data = inputel.value;
        inputel.style.visibility = 'hidden';
        socket.emit('end_phase_one', fill_data);
        emitagain = 'end_phase_one';
    }
    else if(current_game == 3){
        socket.emit('end_phase_one', '');
        emitagain = 'end_phase_one';
    }
    else if(current_game == 4){
        send_results_typeracer(myid);
    }
    else if(current_game == 5){
        send_results_guessdraw(myid);
    }
    else if(current_game == 6){
        send_results_geomaster(myid);
    }
    else if(current_game == 7){
        send_results_pickcard(myid);
    }
    else if(current_game == 8){
        send_results_dodgeball(myid);
    }
}

function send_res(userid){
    if(!has_sent_results){
        has_sent_results = true;
        if(current_game == 1){
            send_results_draw(userid);
        }
        else if(current_game == 2){
            send_results_fill(userid);
        }
        else if(current_game == 3){
            send_results_pattern(userid);  
        }
    }
}

function pickcard(num){
    cardpicked = num;
    end_phase_one();
}

function fill_pattern_table(){
    var cells = document.querySelectorAll('td');
    for(let i = 0; i < cells.length; i++){
        if( query_array.includes(i)){
            cells[i].classList.remove('white');
            cells[i].classList.add('black');
        }
        else{
            cells[i].classList.add('white');
            cells[i].classList.remove('black');
        }
    }
}

function fill_mini_pattern_table(){
    var temptable = document.createElement('table');
    temptable.classList.add('minitable');
    for(let i = 0; i < 6; i++){
        var temptr = document.createElement('tr');
        temptable.appendChild(temptr);
        for(let j = 0; j < 6; j++){
            var temptd = document.createElement('td');
            if(query_array.includes(i * 6 + j)){
                temptd.classList.add('black');
            }
            temptable.appendChild(temptd);
        }
    }
    data_ul.append(temptable);
}

function fill_mini_pattern_tables(array){
    var tempul = document.createElement('ul');
    tempul.classList.add('tempul');
    for(let k = 0; k < array.results.length; k++){
        var tempdiv = document.createElement('div');
        tempdiv.classList.add('tempdiv');
        var temptable2 = document.createElement('table');
        temptable2.classList.add('minitable');
        for(let i = 0; i < 6; i++){
            var temptr = document.createElement('tr');
            temptable2.appendChild(temptr);
            for(let j = 0; j < 6; j++){
                var temptd = document.createElement('td');
                if(array.results[k].data.includes(i * 6 + j)){
                    temptd.classList.add('black');
                }
                temptable2.appendChild(temptd);
            }
        }
        tempdiv.appendChild(temptable2);
        var templabel = document.createElement('label');
        templabel.innerHTML = '<b>' + array.results[k].user.username + '</b>';
        tempdiv.appendChild(templabel);
        tempul.appendChild(tempdiv);
    }
    data_ul.append(tempul);
}


function push_cell(num){
    var temp = document.querySelectorAll('.patternbutton');
    temp[num].classList.toggle('black');
    if(result_array.includes(num)){
        const index = result_array.indexOf(num);
        if (index > -1) {
            result_array.splice(index, 1);
        }
    }else{
        result_array.push(num);
    }
}

function calculate_points(){
    var count = 0;
    for(let i = 0; i < result_array.length; i++){
        if(query_array.includes(result_array[i])){
            count += 1;
        }
    }
    return {correct: count, selected: result_array.length};
}

function create_vote_div(data){
    var tempul = document.createElement('ul');
    tempul.classList.add('votesul');
    for(let i = 0; i < data.results.length; i++){
        var tempdiv = document.createElement('div');
        var voted = document.createElement('p');
        voted.innerHTML = '<b>'+ data.results[i].user.username + '</b>';
        tempdiv.appendChild(voted);
        var tempitem = votearray.find(item => item.user === data.results[i].user.id)
        if(current_game == 1){
            var tempimg = document.createElement('img');
            if(tempitem){
                tempimg.src = tempitem.data;
                tempdiv.appendChild(tempimg)
            }
        }
        else{
            var templabel = document.createElement('label');
            if(tempitem){
                templabel.innerHTML = tempitem.data;
                tempdiv.appendChild(templabel);
            } 
        }
        for(let j = 0; j < data.results[i].data.length; j++){
            var voter = document.createElement('p');
            voter.innerHTML = '<b>'+ data.results[i].data[j] + '</b>';
            tempdiv.appendChild(voter);
        }
        tempul.appendChild(tempdiv);
    }
    data_ul.append(tempul);
}

function show_cards_picked(data){
    var tempul = document.createElement('ul');
    tempul.classList.add('showcardsul');
    for(let i = 0 ; i < cardpoints.length; i++){
        var tempdiv = document.createElement('div');
        var tempp = document.createElement('label');
        tempp.innerHTML = cardpoints[i];
        tempdiv.appendChild(tempp);
        for(let j = 0 ; j < data.results.length; j ++){
            if(data.results[j].data == i){
                var voter = document.createElement('p');
                voter.innerHTML = '<b>'+ data.results[j].user.username + '</b>';
                tempdiv.appendChild(voter);
            }
        }
        tempul.appendChild(tempdiv);
    }
    data_ul.append(tempul);
    var tempimg = document.createElement('img');
    tempimg.classList.add('gif');
    tempimg.src = '/imgs/skele.gif';
    data_ul.append(tempimg);
}

//drawing stuff
function change_color(color){
    ctx.strokeStyle = color;
    if(current_game ==5){
        socket.emit('canvasctxcolor', color);
    }
}

socket.on('canvasctxcolor',(data)=>{
    ctx.strokeStyle = data;
    ctx.beginPath();
})

function change_line_width(width){
    ctx.lineWidth = width;
    if(current_game == 5){
        socket.emit('canvasctxwidth', width);
    }
}

socket.on('canvasctxwidth',(data)=>{
    ctx.lineWidth = data;
    ctx.beginPath();
})

canvas.addEventListener('mousemove',mouse_cords,false);
canvas.addEventListener('mousedown',start_drawing,false);
canvas.addEventListener('mouseup',stop_drawing,false);
canvas.addEventListener('mouseleave',leave_canvas,false);

function mouse_cords(e){
	mouse.x = e.pageX - this.offsetLeft;
	mouse.y = e.pageY - this.offsetTop;
}

function start_drawing(e){
    if(drawing){
        ctx.beginPath();
        ctx.lineTo(mouse.x,mouse.y);
        ctx.stroke();
        canvas.addEventListener('mousemove',draw, false);
        if(current_game == 5){
          socket.emit('canvasctxdot', {x: mouse.x, y:mouse.y});
        }
    }
}

socket.on('canvasctxdot', (data)=>{
    ctx.beginPath();
    ctx.lineTo(data.x,data.y);
    ctx.stroke();
})

socket.on('canvasctx', (data)=>{
    ctx.lineTo(data.x,data.y);
    ctx.stroke();
})

function stop_drawing(){
	canvas.removeEventListener('mousemove',draw,false);
    if(current_game == 5){
        socket.emit('canvasctxstop');
    }
}

socket.on('canvasctxstop', ()=>{
    ctx.beginPath();
})

function leave_canvas(){
	canvas.removeEventListener('mousemove',draw,false);
}

function draw(e){
	if(drawing){
		ctx.lineTo(mouse.x,mouse.y);
		ctx.stroke();
        if(current_game == 5){
            socket.emit('canvasctx' , {x: mouse.x, y: mouse.y});
        }
	}
};

function clear_canvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(current_game == 5){
        socket.emit('canvasctxclear')
    }
}

socket.on('canvasctxclear', ()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
})

socket.on('connect', () => {
    myid = socket.id;
 });


 function set_visibility(panel){
     if( panel == second_panel){
        game_draw.css("display", "none");
        game_fill.css("display", "none");
        game_pattern.css("display", "none");
        game_typeracer.css("display", "none");
        game_geomaster.css("display", "none");
        game_pickcard.css("display", "none");
        second_panel.css("display", "flex");
     }
     else if(panel == game_draw){
        game_draw.css("display", "flex");
        $('#done').css('visibility','visible');
        game_fill.css("display", "none");
        game_pattern.css("display", "none");
        game_typeracer.css("display", "none");
        game_geomaster.css("display", "none");
        game_pickcard.css("display", "none");
        second_panel.css("display", "none");
     }
     else if( panel == game_fill){
        game_draw.css("display", "none");
        game_fill.css("display", "flex");
        $('#done2').css('visibility','visible');
        $('#fill_input').css('visibility','visible');
        game_pattern.css("display", "none");
        game_typeracer.css("display", "none");
        game_geomaster.css("display", "none");
        game_pickcard.css("display", "none");
        second_panel.css("display", "none");
     }
     else if(panel == game_pattern){
        game_draw.css("display", "none");
        game_fill.css("display", "none");
        game_pattern.css("display", "flex");
        game_typeracer.css("display", "none");
        game_geomaster.css("display", "none");
        game_pickcard.css("display", "none");
        second_panel.css("display", "none");
     }
     else if(panel == game_typeracer){
        game_draw.css("display", "none");
        game_fill.css("display", "none");
        game_pattern.css("display", "none");
        game_typeracer.css("display", "flex");
        game_geomaster.css("display", "none");
        game_pickcard.css("display", "none");
        second_panel.css("display", "none");
     }
     else if(panel == game_geomaster){
        game_draw.css("display", "none");
        game_fill.css("display", "none");
        game_pattern.css("display", "none");
        game_typeracer.css("display", "none");
        game_geomaster.css("display", "flex");
        $('#done4').css('visibility', 'visible');
        game_pickcard.css("display", "none");
        second_panel.css("display", "none");
     }
     else if(panel == game_pickcard){
        game_draw.css("display", "none");
        game_fill.css("display", "none");
        game_pattern.css("display", "none");
        game_typeracer.css("display", "none");
        game_geomaster.css("display", "none");
        game_pickcard.css("display", "flex");
        second_panel.css("display", "none");

     }
 }

function start_round_draw(promt){
    promt_label.html(promt.query);
    clear_canvas();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    set_visibility(game_draw);
    document.getElementById("buttons").style.visibility = 'visible';
    drawing = true;
    start_timer(90,()=>{
        if(!has_sent_results){
            end_phase_one();
        }
    });
}

function start_round_fill(promt){
    promt_label.html(promt.query);
    document.getElementById('fill_input').value = '';
    set_visibility(game_fill);
    start_timer(20,()=>{
        if(!has_sent_results){
            end_phase_one();
        }
    });
}

function start_round_pattern(promt){
    query_array = promt.query;
    result_array = [];
    promt_label.html('Try to remember the pattern shown bellow!');
    set_visibility(game_pattern);
    fill_pattern_table();
    start_timer(10,()=>{
        if(!has_sent_results){
            end_phase_one();
        }
    });
}

function start_round_typeracer(promt){
    typeracer_ul.innerHTML = '';
    typeracer_input.value = '';
    result_array = [];
    promt_label.html('Type as many words from the list below as possible!');
    set_visibility(game_typeracer);
    typeracer_input.focus();
    start_timer(20,()=>{
        if(!has_sent_results){
            end_phase_one();
        }
    });
    query_array = promt.query;
    for(let i = 0 ; i < promt.query.length; i++){
        var templi = document.createElement('li');
        templi.classList.add('wordsli');
        templi.id = promt.query[i]+'_r';
        templi.innerText = promt.query[i];
        typeracer_ul.appendChild(templi);
    }
}

function start_round_guessdraw(promt){
    clear_canvas();
    document.getElementById("buttons").style.visibility = 'visible';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    current_word = promt.query.word;
    artistid = promt.query.user.id;
    set_visibility(game_draw);
    start_timer(90,()=>{
        if(!has_sent_results){
            end_phase_one();
        }
    });
    if(myid == artistid){
        promt_label.html(promt.query.word);
        drawing = true;
        canusechat = false;
        document.getElementById("buttons").style.visibility = 'visible';
        socket.emit('results', {id: myid, count: 0,data: ''});
        has_sent_results = true;
        emitagain = 'results';
    }
    else{
        var tempword = [];
        for(let i = 0; i< promt.query.word.length ;i ++){
            tempword.push('_');
        }
        promt_label.html(tempword.join(' '));
        drawing = false;
        document.getElementById("buttons").style.visibility = 'hidden';
        ctx.beginPath();
    }
    $('#done').css('visibility','hidden');
}

function start_round_geomaster(promt){
    set_visibility(game_geomaster);
    guesslocation = {lat: 256, lng: 256};
    querylocation = promt.query;
    promt_label.html('Guess where in the world is the current location!');
    initialize_map_pano(promt);
    start_timer(60,()=>{
        if(!has_sent_results){
            end_phase_one();
        }
    });
}

function start_round_pickcard(){
    set_visibility(game_pickcard);
    for (let i = 0; i < cardbuttons.length; i++) {
        cardbuttons[i].disabled = false;
    }
    promt_label.html('Pick a card of your liking!');
    start_timer(40,()=>{
        if(!has_sent_results){
            end_phase_one();
        }
    });

}

function start_round_dodgeball(){
    dodgeballlives = 5;
    ctx.lineWidth = 8;
    dodgeballstop = false;
    bulletsarray = [];
    clear_canvas();
    set_visibility(game_draw);
    document.getElementById("buttons").style.visibility = 'hidden';
    $('#done').css('visibility','hidden');
    add_events();
    game8_loop();
    start_timer(30,()=>{
        if(!has_sent_results){
            dodgeballstop = true;
            end_phase_one();
        }
    });
}


function second_phase_draw_data(res){
    data_ul.css('flexDirection','row');
    for(let i = 0; i < res.length; i++){
        let temp_li = document.createElement('li');
        let temp_button_onclick = "send_res('"+ res[i].user +"')";
        temp_li.innerHTML = "<li class='canvasli'><button class='canvasbutton' onclick="+temp_button_onclick+"><img src='"+res[i].data+"'></button></li>"
        data_ul.append(temp_li);

    }
}

function second_phase_fill_data(res){
    data_ul.css('flexDirection','column');
    for(let i = 0; i < res.length; i++){
        let temp_li = document.createElement('li');
        let temp_button_onclick = "send_res('"+ res[i].user +"')";
        temp_li.innerHTML = "<li class='fillli'><button class='fillbutton' onclick="+temp_button_onclick+"><p>"+res[i].data+"</p></button></li>"
        data_ul.append(temp_li);
    }
}

function second_phase_pattern_data(res){
    data_ul.css('flexDirection','column');
    let table = document.createElement('ul');
    table.classList.add('table_js');
    for(let i = 0; i < 36; i++){
        let temp_b = document.createElement('button');
        temp_b.classList.add('patternbutton');
        temp_b.onclick = ()=>{push_cell(i)};
        table.appendChild(temp_b);
    }
    data_ul.append(table);
    let done3 = document.createElement('button');
    done3.id = 'done3';
    done3.textContent = 'Done';
    done3.onclick = ()=>{send_res(myid)};
    data_ul.append(done3);
}

function send_results_draw(userid){
    var buttons = document.querySelectorAll('.canvasbutton');
    socket.emit('results', {id: userid, count: 1, data: myusername});
    emitagain = 'results';
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
}


function send_results_fill(userid){
    var buttons = document.querySelectorAll('.fillbutton');
    socket.emit('results', {id: userid, count: 1, data: myusername});
    emitagain = 'results';
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }

}

function send_results_pattern(userid){
    $('#done3').css('visibility','hidden');
    var buttons = document.querySelectorAll('.patternbutton');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
    socket.emit('results', {id: userid, count: calculate_points(),data: result_array});
    emitagain = 'results';
}

function send_results_typeracer(userid){
    socket.emit('results', {id: userid, count: {total: query_array.length, typed: result_array.length}, data: ''});
    emitagain = 'results';

}

function send_results_guessdraw(userid){
    socket.emit('results', {id: userid, count: 0,data: ''});
    emitagain = 'results';
    
}

function send_results_geomaster(userid){
    $('#done4').css('visibility', 'hidden');
    socket.emit('results', {id: userid, count: calculate_points_geomaster(),data: guesslocation});
    emitagain = 'results';
}

function send_results_pickcard(userid){
    for (let i = 0; i < cardbuttons.length; i++) {
        cardbuttons[i].disabled = true;
    }
    socket.emit('results', {id: userid, count: '',data: cardpicked});
    emitagain = 'results';
}

function send_results_dodgeball(userid){
    socket.emit('results', {id: userid, count: dodgeballlives,data: ''});
    emitagain = 'results';
}

function initialize(lat,long) {
    var location = {lat: lat, lng: long};
    const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano"),
    {
      position: location,
      pov: {
        heading: 34,
        pitch: 10,
      },
      addressControl: false,
      fullscreenControl: false,
      scrollwheel: false,
      zoomControl: false,
      showRoadLabels: false
    }
  );
}
function test(){
    var precision = 10000; // 5 decimals
    var x = Math.floor(Math.random() * (110 * precision) - 40 * precision) / (1*precision);
    var y = Math.floor(Math.random() * (280 * precision) - 130 * precision) / (1*precision);
    console.log( x + "  " + y);
    var streetViewService = new google.maps.StreetViewService();
    var STREETVIEW_MAX_DISTANCE = 100;
    var latLng = new google.maps.LatLng(x, y);
    streetViewService.getPanoramaByLocation(latLng, STREETVIEW_MAX_DISTANCE, function (streetViewPanoramaData, status) {
        if (status === google.maps.StreetViewStatus.OK) {
            initialize(x,y)
            console.log( '{lat: '+ x+',lng: ' + y + '}');
        } else {
            test(); 
        }
    });  
}

let markers = [];
function initialize_map_pano(promt){
    var map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,});
    map.addListener("click", (mapsMouseEvent) => {
        if(!has_sent_results){
            addMarker(mapsMouseEvent.latLng,map);
            guesslocation = JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2);
        }
    });
    
    var location = {lat: promt.query.lat, lng: promt.query.lng};
    panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"),{
        position: location,
        pov: {
            heading: 34,
            pitch: 10,
        },
        addressControl: false,
        fullscreenControl: false,
        scrollwheel: false,
        zoomControl: false,
        showRoadLabels: false
    });
}

function calculate_points_geomaster(){
    quesslocation = JSON.parse(guesslocation);
    return (Math.abs(querylocation.lat - guesslocation.lat) + Math.abs(querylocation.lng - guesslocation.lng));
}

function addMarker(position,map) {
    for(let i = 0 ; i < markers.length; i++){
        markers[0].setMap(null);
    }
    markers = [];
    const marker = new google.maps.Marker({
      position,
      map,
    });
    markers.push(marker);
    markers[0].setMap(map);
  }


function create_results_map(array){
    var mapdiv = document.createElement('div');
    mapdiv.id = 'mapdiv';
    var map = new google.maps.Map(mapdiv, {
        center: { lat: querylocation.lat, lng: querylocation.lng },
        zoom: 2,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,});
    
        addMarkerStyle(querylocation,map,'true');
    for(let i=0;i < array.results.length; i ++){
        addMarkerStyle(JSON.parse(array.results[i].data),map,array.results[i].user.username.substring(0,2));
    }
    data_ul.append(mapdiv);

}

function addMarkerStyle(location,map,style){
    if(style == 'true'){
        const marker = new google.maps.Marker({
            position: location,
            icon: '../imgs/target.png',
            map: map,
          });
    }else{
        const marker = new google.maps.Marker({
            position: location,
            label: style,
            map: map,
          });
    }
}


function game8_loop(){
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0,960,656);
    dodgeballframe++;
    if(dodgeballcontroller.right && dodgeballplayer.x + dodgeballplayer.radius< 960){
        dodgeballplayer.x += dodgeballplayer.speed;
    }
    if(dodgeballcontroller.left && dodgeballplayer.x - dodgeballplayer.radius > 0){
        dodgeballplayer.x -= dodgeballplayer.speed;
    }
    if(dodgeballcontroller.up && dodgeballplayer.y - dodgeballplayer.radius > 0){
        dodgeballplayer.y -= dodgeballplayer.speed;
    }
    if(dodgeballcontroller.down && dodgeballplayer.y + dodgeballplayer.radius< 656){
        dodgeballplayer.y += dodgeballplayer.speed;
    }
    ctx.fillStyle = '#000000';
    handle_bullets();
    ctx.font = "16px Georgia";
    ctx.fillText('lives left: ' + dodgeballlives,8,16);
    ctx.fillStyle = "#EC6969";
    ctx.beginPath();
    ctx.arc(Math.floor(dodgeballplayer.x),Math.floor(dodgeballplayer.y),dodgeballplayer.radius,0,2*Math.PI);
    ctx.fill();
    if(dodgeballlives <= 0 || dodgeballstop){
        window.cancelAnimationFrame(game8_loop);
        remove_events();
        end_phase_one();
    }
    else{
        window.requestAnimationFrame(game8_loop);
    }
}

function add_events(){
    window.addEventListener('keydown',key_listener);
    window.addEventListener('keyup', key_listener);
}

function remove_events(){
    window.removeEventListener('keydown',key_listener);
    window.removeEventListener('keyup',key_listener);
    dodgeballcontroller.left = false;
    dodgeballcontroller.right = false;
    dodgeballcontroller.up = false;
    dodgeballcontroller.down = false;
}

function key_listener(e){
    var key_state = (e.type == 'keydown')?true:false;
        switch(e.keyCode){
            case 87: //w
            dodgeballcontroller.up = key_state;
            break;
            case 83: //s
            dodgeballcontroller.down= key_state;
            break;
            case 68: //d
            dodgeballcontroller.right = key_state;
            break;
            case 65: //a
            dodgeballcontroller.left = key_state;
            break;
        }
}

function handle_bullets(){
    if(dodgeballframe % 10 == 0){
        bulletsarray.push(new bullet(Math.floor(Math.random()*3)));
    }
    for(let i = 0; i < bulletsarray.length; i ++){
        if(bulletsarray[i].y < 0 || bulletsarray[i].x > 960 || bulletsarray[i].x < 0){
            bulletsarray.splice(i,1);
        }
        else{
            bulletsarray[i].update();
            bulletsarray[i].draw();
        }
        if(bulletsarray[i].distance < 36){
            hit_audio.play();
            dodgeballlives -= 1;
            bulletsarray.splice(i,1);
        }
    }
}