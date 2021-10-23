const promts = ['Skateboarding grandma', 'Couple crying while watching Netflix', 'Two men five feet apart in a hot tub', 'Naruto crying','Lizard with a gun'];
const fill = ['I hate when my boss _____ .','Imagine liking _____ .' ,'_____ . Couldnt be me','Cant wait to wake up tomorrow and _____ .' ,'Whatever the circumstances, never _____ .'];
const words = ['unlock','spotted','object','ill-fated','produce','permit','representative','frail','adorable','parsimonious',
'advise','popcorn','reminiscent','cloistered','office','stocking','fluttering','farm','serious','slave','wait','aware','carry',
'absorbed','bless','complete','madly','suppose','far','gold','plug','aboard','rescue','rose','faulty','vague','nostalgic','delight',
'fat','rain','debonair','bitter','stranger','turn','food','economic','sock','stale','goofy','shop','false','egg','wet','worry','married',
'death','instruct','fish','encourage','tiger','gate','remind','interest','spring','twig','evasive','satisfy','astonishing','challenge','roof',
'stamp','sloppy','queen','strap','secretary','complex','power','ugly','zephyr','leather','blind','remember','free','dare','flaky','nasty','car',
'appliance','spiders','pie','month','careless','sable','windy','roomy','steam','adamant','boorish','melt','sleet','wilderness','bumpy','flag',
'delay','rely','few','fruit','roll','sweltering','maniacal','try','guide','perform','electric','eager','rampant','powder','mark','coal','yielding'];
const table_size = 36;
const pattern_size = 12;
const typeracer_count = 20;
const {random_user_from_room} = require('./users');

const LATLONGVALIDARRAY = [{lat: 36.1028,lng: -119.5814},{lat: 58.5817,lng: 13.7051},{lat: 30.9716,lng: -103.0681},{lat: 23.3898,lng: 120.4611},
    {lat: 32.7351,lng: 131.0019},{lat: 53.7787,lng: -2.7121},{lat: 40.4451,lng: 9.0868},{lat: 42.3178,lng: -7.7836},{lat: 52.6263,lng: 1.2581},{lat: -21.6696,lng: -45.9064},
    {lat: 37.2419,lng: -94.7409},{lat: 38.3762,lng: 140.1676},{lat: 14.8065,lng: 104.1386},{lat: 64.1015,lng: 19.9742},{lat: 47.4382,lng: 0.5865},{lat: 59.4437,lng: 25.9852},
    {lat: 56.8831,lng: 60.7121},{lat: 43.707,lng: 15.8975},{lat: 50.9984,lng: 17.3877}];




function random_promt(roomid){
    var temp = Math.floor((Math.random() * 6) + 1);
    //var temp = 3;
    switch (temp){
        case 1:
            return {type: temp, query: promts[Math.floor(Math.random() * promts.length)]};
        case 2:
            return {type: temp, query: fill[Math.floor(Math.random() * fill.length)]};
        case 3:
            var arr = [];
            while(arr.length < pattern_size){
                var r = Math.floor(Math.random() * table_size);
                if(arr.indexOf(r) === -1) arr.push(r);
            }
            return {type: temp,query: arr};
        case 4:
            var arr = [];
            while(arr.length < typeracer_count){
                var r = Math.floor(Math.random() * words.length);
                if(arr.indexOf(words[r]) === -1) arr.push(words[r]);
            }
            return {type: temp,query: arr};
        case 5: 
            return {type: temp, query: {user: random_user_from_room(roomid), word: get_random_word()}};
        case 6:
            return {type: temp, query: get_random_latlng()};
    }
}

module.exports = random_promt;

function get_random_word(){
    var r = Math.floor(Math.random() * words.length);
    return words[r];
}

function get_random_latlng(){
    var r = Math.floor(Math.random() * LATLONGVALIDARRAY.length);
    return LATLONGVALIDARRAY[r];
}