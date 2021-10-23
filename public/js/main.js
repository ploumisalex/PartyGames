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
const typeracer_ul = document.getElementById('typeracer_ul');
const typeracer_form = $('#typeracer_form');
const typeracer_input = document.getElementById("typeracer_input");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var painting = document.getElementById("canvas_div");
var painting_style = getComputedStyle(painting);

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
var current_word = '';
var artistid = '';
var guesslocation = {lat: 256, lng: 256};
var querylocation;
var has_sent_results = false;


const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})

function outputMessage(data){
    const templi = document.createElement('li');
    templi.innerHTML = "<li class='chatli'><label>"+ data.username +":</label><span>" + data.msg + "</span></li>"
    chatul.append(templi);
}

chat.submit((e)=>{
    e.preventDefault();
    if(canusechat){
        const msg = e.target.elements.msg.value;
        if( current_game == 5){
            if(msg == current_word){
                canusechat = false;
                socket.emit('guessed_correctly', {type: current_game, id: artistid, count: 1})
                socket.emit('results', {type: current_game, id: myid, count:  1,data: ''});
            }
        }
        socket.emit('client_message', msg);
        e.target.elements.msg.value = '';
        e.target.elements.msg.focus();
    }
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
    }, 1000);
}

socket.on('room_users', (data) =>{
    usersul.html('');
    var pointsimg = '/imgs/omegalul.png';
    for (let i = 0; i < data.users.length; i++) {    
        const user = document.createElement("li");
        user.innerHTML = "<li class='usersli'><div><label>"+ data.users[i].username +"</label><p>"+data.users[i].points +" Points</p></div><img src="+pointsimg+"></li>";
        usersul.append(user);
    }
})

socket.on('message', (data)=>{
    outputMessage(data);
    chatul.scrollTop = chatul.scrollHeight;
})

socket.emit('join_room', {username,room});

function start_game(){
    $('#ready').css('visibility','hidden')
    socket.emit('start_game');
}

socket.on('results', (data) =>{
    canusechat = true;
    data_ul.html('');
    promt_label.html('Results of the previous round');
    set_visibility(second_panel);
    data_ul.css('flexDirection','column');
    if(current_game == 5){
        var templabel = document.createElement('label');
        templabel.classList.add('templabel');
        templabel.innerHTML = 'The word was: <b>'+ current_word+'</b> .';
        data_ul.append(templabel);
    }
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
    if(current_game == 3){
        fill_mini_pattern_table();
        fill_mini_pattern_tables(data);
    }
    else if(current_game == 6){
        create_results_map(data);
    }
    start_timer(10, ()=>{
        socket.emit('start_round');
    });
})

socket.on('start_second_phase', (res)=>{
    timer.html('');
    second_phase_data(res);
})

socket.on('start_round',(promt)=>{
    second_panel.css("display", "none");
    has_sent_results = false;
    current_game = promt.type;
    if(promt.type == 1){
        promt_label.html("Next Round: Draw my thing!");
        start_timer(5,()=>{
            start_round_draw(promt);
        });
    }
    else if(promt.type == 2){
        promt_label.html("Next Round: Fill the blank!");
        start_timer(5,()=>{
            start_round_fill(promt);
        });
    }
    else if(promt.type == 3){
        promt_label.html("Next Round: Memorize the pattern!");
        start_timer(5,()=>{
            start_round_pattern(promt);
        });
    }
    else if(promt.type == 4){
        promt_label.html("Next Round: Typeracer!");
        start_timer(5,()=>{
            start_round_typeracer(promt);
        });
    }
    else if(promt.type == 5){
        promt_label.html("Next Round: Guess the drawing! Player <b>" + promt.query.user.username + "</b> is drawing.");
        start_timer(5,()=>{
            start_round_guessdraw(promt);
        });
    }
    else if(promt.type == 6){
        promt_label.html("Next Round: Geomaster");
        start_timer(5,()=>{
            start_round_geomaster(promt);
        });
    }
})

function second_phase_data(res){
    set_visibility(second_panel);
    data_ul.html('');
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
    clearInterval(t);
    if(current_game == 1){
        $('#done').css('visibility','hidden');
        drawing = false;   
        const canvas_data = canvas.toDataURL();
        socket.emit('end_phase_one', canvas_data);
    }
    else if(current_game == 2){
        $('#done2').css('visibility','hidden');
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
        second_panel.css("display", "flex");
     }
     else if(panel == game_draw){
        game_draw.css("display", "flex");
        $('#done').css('visibility','visible');
        game_fill.css("display", "none");
        game_pattern.css("display", "none");
        game_typeracer.css("display", "none");
        game_geomaster.css("display", "none");
        second_panel.css("display", "none");
     }
     else if( panel == game_fill){
        game_draw.css("display", "none");
        game_fill.css("display", "flex");
        $('#done2').css('visibility','visible');
        game_pattern.css("display", "none");
        game_typeracer.css("display", "none");
        game_geomaster.css("display", "none");
        second_panel.css("display", "none");
     }
     else if(panel == game_pattern){
        game_draw.css("display", "none");
        game_fill.css("display", "none");
        game_pattern.css("display", "flex");
        game_typeracer.css("display", "none");
        game_geomaster.css("display", "none");
        second_panel.css("display", "none");
     }
     else if(panel == game_typeracer){
        game_draw.css("display", "none");
        game_fill.css("display", "none");
        game_pattern.css("display", "none");
        game_typeracer.css("display", "flex");
        game_geomaster.css("display", "none");
        second_panel.css("display", "none");
     }
     else if(panel == game_geomaster){
        game_draw.css("display", "none");
        game_fill.css("display", "none");
        game_pattern.css("display", "none");
        game_typeracer.css("display", "none");
        game_geomaster.css("display", "flex");
        second_panel.css("display", "none");
     }
 }

function start_round_draw(promt){
    promt_label.html(promt.query);
    clear_canvas();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    set_visibility(game_draw);
    drawing = true;
    start_timer(90,end_phase_one);
}

function start_round_fill(promt){
    promt_label.html(promt.query);
    document.getElementById('fill_input').value = '';
    set_visibility(game_fill);
    start_timer(20,end_phase_one);
}

function start_round_pattern(promt){
    clear_pattern_table();
    result_array = [];
    promt_label.html('Try to remember the pattern shown bellow!');
    set_visibility(game_pattern);
    start_timer(10,end_phase_one);
    fill_pattern_table(promt.query);
}

function start_round_typeracer(promt){
    typeracer_ul.innerHTML = '';
    typeracer_input.innerHTML = '';
    result_array = [];
    promt_label.html('Type as many words from the list below as possible!');
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
        promt_label.html(promt.query.word);
        drawing = true;
        canusechat = false;
        document.getElementById("buttons").style.visibility = 'visible';
        socket.emit('results', {type: current_game, id: myid, count: 0,data: ''});
        has_sent_results = true;
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
    start_timer(60,end_phase_one);
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
    if(!has_sent_results){
        var buttons = document.querySelectorAll('.canvasbutton');
        socket.emit('results', {type: current_game, id: userid, count: 1, data: ''});
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
        has_sent_results = true;
    }
}


function send_results_fill(userid){
    if(!has_sent_results){
        var buttons = document.querySelectorAll('.fillbutton');
        socket.emit('results', {type:current_game, id: userid, count: 1, data: ''});
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
        has_sent_results = true;
    }
}

function send_results_pattern(userid){
    if(!has_sent_results){
        $('#done3').css('visibility','hidden');
        var buttons = document.querySelectorAll('.patternbutton');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
        socket.emit('results', {type: current_game, id: userid, count: calculate_points(),data: result_array});
        has_sent_results = true;
    }
}

function send_results_typeracer(userid){
    if( !has_sent_results){
        socket.emit('results', {type: current_game, id: userid, count: {total: query_array.length, typed: result_array.length}, data: ''});
        has_sent_results = true;
    }
}

function send_results_guessdraw(userid){
    if(!has_sent_results){
        socket.emit('results', {type: current_game, id: userid, count: 0,data: ''});
        has_sent_results = true;
    }
}

function send_results_geomaster(userid){
    socket.emit('results', {type: current_game, id: userid, count: calculate_points_geomaster(),data: guesslocation});
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
        zoom: 2,
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
        addMarkerStyle(JSON.parse(array.results[i].data),map,array.results[i].user.username.charAt(0));
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