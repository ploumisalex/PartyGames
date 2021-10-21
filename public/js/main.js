const socket = io();

const chat = document.getElementById("chat");
const chatul = document.getElementById("chatlog");
const timer = document.getElementById("timer");
const usersul = document.getElementById("users");
const promt_label = document.getElementById("promt");
const data_ul = document.getElementById("data_ul");
const second_panel = document.getElementById("second_panel");
second_panel.style.display = 'none';
const game_fill = document.getElementById("game_fill");
game_fill.style.display = 'none';
const game_draw = document.getElementById("game_draw");
game_draw.style.display = 'none';
const game_pattern = document.getElementById("game_pattern");
game_pattern.style.display = 'none';
const game_typeracer = document.getElementById("game_typeracer");
game_typeracer.style.display = 'none';
const game_geomaster = document.getElementById("game_geomaster");
game_geomaster.style.display = 'none';
const typeracer_ul = document.getElementById("typeracer_ul");
const typeracer_form = document.getElementById("typeracer_form");
const typeracer_input = document.getElementById("typeracer_input");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var painting = document.getElementById("canvas_div");
var painting_style = getComputedStyle(painting);

canvas.height = 658; //parseInt(painting_style.getPropertyValue('height'));
canvas.width = 905; //parseInt(painting_style.getPropertyValue('width'));


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
var current_word = '';
var artistid = '';
var latlongarray = [];
var guesslocation = {lat: 256, lng: 256};
var querylocation;
var has_sent_results = false;


const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})

function outputMessage(data){
    const templi = document.createElement('li');
    templi.innerHTML = "<li class='chatli'><label>"+ data.username +":</label><span>" + data.msg + "</span></li>"
    chatul.appendChild(templi);
}

chat.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(canusechat){
        const msg = e.target.elements.msg.value;
        if( current_game == 5){
            if(msg == current_word){
                canusechat = false;
                socket.emit('guessed_correctly', {type: current_game, id: artistid, count: 1})
                socket.emit('results', {type: current_game, id: myid, count:  1});
            }
        }
        socket.emit('client_message', msg);
        e.target.elements.msg.value = '';
        e.target.elements.msg.focus();
    }
})

typeracer_form.addEventListener('submit', (e)=>{
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
    timer.innerHTML = seconds;
    t = setInterval(function(){
        timer.innerHTML -= 1;
        if (timer.innerHTML < 0){
            clearInterval(t);
            callfunction();
        }
    }, 1000);
}

socket.on('room_users', (data) =>{
    usersul.innerHTML = '';
    var pointsimg = '/imgs/omegalul.png';
    for (let i = 0; i < data.users.length; i++) {    
        const user = document.createElement("li");
        user.innerHTML = "<li class='usersli'><div><label>"+ data.users[i].username +"</label><p>"+data.users[i].points +" Points</p></div><img src="+pointsimg+"></li>";
        usersul.appendChild(user);
    }
})

socket.on('message', (data)=>{
    outputMessage(data);
    chatul.scrollTop = chatul.scrollHeight;
})

socket.emit('join_room', {username,room});

function start_game(){
    document.getElementById("ready").style.visibility = 'hidden';
    socket.emit('start_game');
}

socket.on('results', (data) =>{
    canusechat = true;
    data_ul.innerHTML = '';
    promt_label.innerHTML = 'Results of the previous round';
    set_visibility(second_panel);
    data_ul.style.flexDirection = 'column';
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
            temp_li.innerHTML = "<li class='resultsli'><label><b>"+ data.results[i].user.username +"<b> +"+ data.results[i].points.plus +"</label></li>";
        }
        data_ul.appendChild(temp_li);
    }
    start_timer(3, ()=>{
        socket.emit('start_round');
    });
})

socket.on('start_second_phase', (res)=>{
    timer.innerHTML ='';
    set_visibility(second_panel);
    second_phase_data(res);
})

socket.on('start_round',(promt)=>{
    second_panel.style.display = 'none';
    has_sent_results = false;
    current_game = promt.type;
    if(promt.type == 1){
        promt_label.innerHTML = "Next Round: Draw my thing!";
        start_timer(3,()=>{
            start_round_draw(promt);
        });
    }
    else if(promt.type == 2){
        promt_label.innerHTML = "Next Round: Fill the blank!";
        start_timer(3,()=>{
            start_round_fill(promt);
        });
    }
    else if(promt.type == 3){
        promt_label.innerHTML = "Next Round: Memorize the pattern!";
        start_timer(3,()=>{
            start_round_pattern(promt);
        });
    }
    else if(promt.type == 4){
        promt_label.innerHTML = "Next Round: Typeracer!";
        start_timer(3,()=>{
            start_round_typeracer(promt);
        });
    }
    else if(promt.type == 5){
        promt_label.innerHTML = "Next Round: Guess the drawing! Player <b>" + promt.query.user.username + "</b> is drawing.";
        start_timer(3,()=>{
            start_round_guessdraw(promt);
        });
    }
    else if(promt.type == 6){
        promt_label.innerHTML = "Next Round: Geomaster";
        start_timer(3,()=>{
            start_round_geomaster(promt);
        });
    }
})

function second_phase_data(res){
    data_ul.innerHTML = '';
    if(current_game == 1){
        second_phase_draw_data(res);
    }
    else if(current_game == 2){
        second_phase_fill_data(res);
    }
    else if(current_game == 3){
        second_phase_pattern_data(res);
    }
}

function end_phase_one(){
    set_visibility(second_panel);
    clearInterval(t);
    if(current_game == 1){
        document.getElementById("done").style.visibility = 'hidden';
        drawing = false;   
        const canvas_data = canvas.toDataURL();
        socket.emit('end_phase_one', canvas_data);
    }
    else if(current_game == 2){
        document.getElementById("done2").style.visibility = 'hidden';
        const fill_data = document.getElementById('fill_input').value;
        socket.emit('end_phase_one', fill_data);
    }
    else if(current_game == 3){
        socket.emit('end_phase_one', '');
    }
    else if(current_game == 4){
        send_res();
    }
    else if(current_game == 5){
        send_res();
    }
    else if(current_game == 6){
        send_res();
    }
}

function send_res(userid){
    if(current_game == 1){
        send_results_draw(userid);
    }
    else if(current_game == 2){
        send_results_fill(userid);
    }
    else if(current_game == 3){
        send_results_pattern(userid);  
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
}

function clear_pattern_table(){
    var cells = document.querySelectorAll('td');
    for(let i = 0; i < cells.length; i++){
        cells[i].classList.remove('black');
    }
    query_array = [];
}

function fill_pattern_table(arr){
    query_array = arr;
    var cells = document.querySelectorAll('td');
    for(let i = 0; i < cells.length; i++){
        if( query_array.includes(i)){
            cells[i].classList.add('black');
        }
    }
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
        game_draw.style.display = 'none';
        game_fill.style.display = 'none';
        game_pattern.style.display = 'none';
        game_typeracer.style.display = 'none';
        game_geomaster.style.display = 'none';
        second_panel.style.display = 'flex';
     }
     else if(panel == game_draw){
        game_draw.style.display = 'flex';
        document.getElementById("done").style.visibility = 'visible';
        game_fill.style.display = 'none';
        game_pattern.style.display = 'none';
        game_typeracer.style.display = 'none';
        game_geomaster.style.display = 'none';
        second_panel.style.display = 'none';
     }
     else if( panel == game_fill){
        game_draw.style.display = 'none';
        game_fill.style.display = 'flex';
        document.getElementById("done2").style.visibility = 'visible';
        game_pattern.style.display = 'none';
        game_typeracer.style.display = 'none';
        game_geomaster.style.display = 'none';
        second_panel.style.display = 'none';
     }
     else if(panel == game_pattern){
        game_draw.style.display = 'none';
        game_fill.style.display = 'none';
        game_pattern.style.display = 'flex';
        game_typeracer.style.display = 'none';
        game_geomaster.style.display = 'none';
        second_panel.style.display = 'none';
     }
     else if(panel == game_typeracer){
        game_draw.style.display = 'none';
        game_fill.style.display = 'none';
        game_pattern.style.display = 'none';
        game_typeracer.style.display = 'flex';
        game_geomaster.style.display = 'none';
        second_panel.style.display = 'none';
     }
     else if(panel == game_geomaster){
        game_draw.style.display = 'none';
        game_fill.style.display = 'none';
        game_pattern.style.display = 'none';
        game_typeracer.style.display = 'none';
        game_geomaster.style.display = 'flex';
        second_panel.style.display = 'none';
     }
 }

function start_round_draw(promt){
    promt_label.innerHTML = promt.query;
    clear_canvas();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    set_visibility(game_draw);
    drawing = true;
    start_timer(10,end_phase_one);
}

function start_round_fill(promt){
    promt_label.innerHTML = promt.query;
    document.getElementById('fill_input').value = '';
    set_visibility(game_fill);
    start_timer(10,end_phase_one);
}

function start_round_pattern(promt){
    clear_pattern_table();
    result_array = [];
    promt_label.innerHTML = 'Try to remember the pattern shown bellow!';
    set_visibility(game_pattern);
    start_timer(5,end_phase_one);
    fill_pattern_table(promt.query);
}

function start_round_typeracer(promt){
    typeracer_ul.innerHTML = '';
    typeracer_input.innerHTML = '';
    result_array = [];
    promt_label.innerHTML = 'Type as many words from the list below as possible!';
    set_visibility(game_typeracer);
    start_timer(20,end_phase_one);
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
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    current_word = promt.query.word;
    artistid = promt.query.user.id;
    set_visibility(game_draw);
    start_timer(90,end_phase_one);
    if(myid == artistid){
        promt_label.innerHTML = promt.query.word;
        drawing = true;
        canusechat = false;
        document.getElementById("buttons").style.visibility = 'visible';
        socket.emit('results', {type: current_game, id: myid, count: 0});
        has_sent_results = true;
    }
    else{
        var tempword = [];
        for(let i = 0; i< promt.query.word.length ;i ++){
            tempword.push('_');
        }
        promt_label.innerHTML = tempword.join(' ');
        drawing = false;
        document.getElementById("buttons").style.visibility = 'hidden';
        ctx.beginPath();
    }
    document.getElementById("done").style.visibility = 'hidden';
}

function start_round_geomaster(promt){
    set_visibility(game_geomaster);
    guesslocation = {lat: 256, lng: 256};
    querylocation = promt.query;
    promt_label.innerHTML = 'Guess where in the world is the current location!';
    initialize_map_pano(promt);
    start_timer(60,end_phase_one);
}


function second_phase_draw_data(res){
    data_ul.style.flexDirection = "row";
    for(let i = 0; i < res.length; i++){
        let temp_li = document.createElement('li');
        let temp_button_onclick = "send_res('"+ res[i].user +"')";
        temp_li.innerHTML = "<li class='canvasli'><button class='canvasbutton' onclick="+temp_button_onclick+"><img src='"+res[i].data+"'></button></li>"
        data_ul.appendChild(temp_li);

    }
}

function second_phase_fill_data(res){
    data_ul.style.flexDirection = "column";
    for(let i = 0; i < res.length; i++){
        let temp_li = document.createElement('li');
        let temp_button_onclick = "send_res('"+ res[i].user +"')";
        temp_li.innerHTML = "<li class='fillli'><button class='fillbutton' onclick="+temp_button_onclick+"><p>"+res[i].data+"</p></button></li>"
        data_ul.appendChild(temp_li);
    }
}

function second_phase_pattern_data(res){
    data_ul.style.flexDirection = "column";
    let table = document.createElement('ul');
    table.classList.add('table_js');
    for(let i = 0; i < 36; i++){
        let temp_b = document.createElement('button');
        temp_b.classList.add('patternbutton');
        temp_b.onclick = ()=>{push_cell(i)};
        table.appendChild(temp_b);
    }
    data_ul.appendChild(table);
    let done3 = document.createElement('button');
    done3.id = 'done3';
    done3.textContent = 'Done';
    done3.onclick = ()=>{send_res(myid)};
    data_ul.appendChild(done3);
}

function send_results_draw(userid){
    if(!has_sent_results){
        var buttons = document.querySelectorAll('.canvasbutton');
        socket.emit('results', {type: current_game, id: userid, count: 1});
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
        has_sent_results = true;
    }
}


function send_results_fill(userid){
    if(!has_sent_results){
        var buttons = document.querySelectorAll('.fillbutton');
        socket.emit('results', {type:current_game, id: userid, count: 1});
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
        has_sent_results = true;
    }
}

function send_results_pattern(userid){
    if(!has_sent_results){
        document.getElementById("done3").style.visibility = 'hidden';
        var buttons = document.querySelectorAll('.patternbutton');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
        socket.emit('results', {type: current_game, id: userid, count: calculate_points()});
        has_sent_results = true;
    }
}

function send_results_typeracer(userid){
    if( !has_sent_results){
        socket.emit('results', {type: current_game, id: userid, count: {total: query_array.length, typed: result_array.length}});
        has_sent_results = true;
    }
}

function send_results_guessdraw(userid){
    if(!has_sent_results){
        socket.emit('results', {type: current_game, id: userid, count: 0});
        has_sent_results = true;
    }
}

function send_results_geomaster(userid){
    socket.emit('results', {type: current_game, id: userid, count: calculate_points_geomaster()});
    has_sent_results = true;
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
      linksControl: false,
      clickToGo: false,
      scrollwheel: false,
      zoomControl: false
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
            console.log('rip');   
        }
    });  
}


let markers = [];
function initialize_map_pano(promt){
    var map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 3,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,});
    map.addListener("click", (mapsMouseEvent) => {
        addMarker(mapsMouseEvent.latLng,map);
        guesslocation = JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2);
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
        linksControl: false,
        clickToGo: false,
        scrollwheel: false,
        zoomControl: false
    });
}

function calculate_points_geomaster(){
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