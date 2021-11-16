const promts = ['Couple crying while watching Netflix', 'Two men five feet apart in a hot tub','Lizard with a gun','Fat cat','Sonic running from a policeman','Pikachu','Thanos','Child running from a chicken',
'Dog chasing a cat chasing a mouse','Man-Bear-Pig'];

const fill = ['I hate when my boss _____ .','Imagine liking _____ .' ,'_____ . Couldnt be me.','Cant wait to wake up tomorrow and _____ .' ,'Whatever the circumstances, never _____ .',
'When it comes down to it, its impossible to _____ .','Humanity would have advanced so much more if only _____ .', '_____ , cringe.','When he said _____ , I felt that .','How can I concentrate when _____ ?',
"_____ , funniest shit I've ever seen.",'How is it possible to unironically _____ .','When I told my wife I like Rick and Morty, she said _____ .',"My wife's boyfriend came the other day and _____ .", ' _____ - Albert Einstein.'];

const words = ['vivacious','riddle','woozy','discover','connect','lovely','command','report','successful','man','advice','dam','spiteful','guiltless','key','draconian','toothpaste','chess','gentle','swing','punch',
'filthy','sassy','telephone','yummy','true','robust','boast','crowded','abrupt','queue','shoes','fixed','mindless','callous','selective','scribble','icy','grouchy','axiomatic','disgusted','ugliest','undress','placid',
'steep','innate','juice','acoustics','bruise','rigid','list','bird','disagree','pies','gate','arrogant','absorbing','uninterested','unbiased','ugly','mice','dark','unsuitable','jump','hill','juicy','shrug','influence',
'truculent','return','dizzy','pointless','rejoice','nondescript','toy','rotten','stream','boy','puzzling','friends','glow','existence','dolls','look','bless','limit','obey','sin','breathe','kiss','snotty','cabbage','rinse',
'scattered','division','disturbed','afford','card','super','acoustic','rebel','point','needless','adorable','accurate','prepare','wakeful','develop','little','scarf','rod','preach','bored','mysterious','pen','encourage',
'grotesque','bite-sized','sponge','trite','chew','four','male','grandmother','natural','resolute','worm','circle','reason','waste','tearful','troubled','shave','hobbies','giddy','spell','rule','productive','swim','upset',
'measly','brawny','moan','nose','maniacal','public','marked','useless','exclusive','vase','synonymous','copy','fascinated','chance','fact','pizzas','lamentable','suspend','absurd','flavor','tedious','cattle','compete',
'surround','tested','victorious','machine','middle','approval','x-ray','judicious','tax','brick','exercise','cake','creator','bashful','second-hand','bang','well-off','materialistic','fortunate','harm','tender','object',
'bounce','deer','scratch','stay','angry','rot','stitch','tame','death','shame','duck','faint','vanish','careless','jail','railway','belong','malicious','cynical','descriptive','foolish','plant','knot','amuse','type',
'habitual','boiling','drunk','wax','rifle','contain','smash','cakes','maddening','discovery','church','cluttered','drawer','obtainable','laborer','connection','bizarre','womanly','building','prefer','naive','unusual',
'plate','twig','wreck','river','lucky','few','average','oatmeal','sheet','snail','imported','uncle','refuse','mother','nutritious','plane','dapper','brush','bloody','hook','skin','healthy','want','attempt','quick',
'observant','note','graceful','jelly','evanescent','impress','sugar','things','romantic','adjoining','pigs','murky','eight','steady','pocket','advise','amazing','worthless','cap','abounding','frail','apathetic','sip',
'drink','search','broad','ignorant','tiger','belligerent','gaudy','awful','muddled','dysfunctional','permit','ajar','awesome','coat','tree','craven','smoggy','market','bawdy','erratic','majestic','elfin','treat','amusement',
'toe','rings','mark','invincible','aggressive','potato','tacit','quickest','exuberant','spiders','practice','thinkable','loving','invent','maid','rescue','previous','valuable','prevent','macho','mask','art','snow','nice',
'plough','fallacious','glib','excited','spare','territory','reading','noiseless','pancake','faulty','stove','respect','remind','new','unique','station','remain','sore','cart','eggnog','obscene','cemetery','innocent',
'unadvised','decay','squalid','queen','outgoing','lock','sticks','nasty','incandescent','rose','frantic','teaching','battle','learned','witty','soda','military','follow','recess','curl','lick','extend','interesting',
'collar','adaptable','applaud','cycle','thrill','strengthen','abandoned','fancy','miscreant','paint','earn','unnatural','structure','impartial','frogs','wrist','interrupt','clear','throat','six','impulse','print','boring',
'shiny','perpetual','tasty','voracious','tomatoes','gusty','numberless','request','hydrant','red','glossy','plain','elbow','open','achiever','chemical','fail','view','suit','squirrel','vigorous','cold','ossified','mine',
'hurry','straw','jazzy','second','consist','price','squealing','fire','notebook','hammer','whisper','trick','hall','abaft','nail','suffer','vegetable','nostalgic','inconclusive','pickle','wealth','pastoral','old-fashioned',
'flaky','embarrassed','wing','jaded','annoying','imaginary','bouncy','horn','half','ray','ski','unknown','army','quartz','acceptable','clip','visit','increase','engine','brainy','tip','hunt','afterthought','hand','dance',
'shiver','grape','street','limping','accept','dime','taboo','heal','admire','shivering','drown','escape','examine','real','pick','girls','money','actually','switch','rude','spiritual','zephyr','round','heat','tenuous',
'store','water','cagey','premium','channel','earth','decide','zealous','inexpensive','legs','ad','grain','cup','plantation','intelligent','robin','cloudy','special','hanging','small','chief','volleyball','calculate',
'scandalous','statement','plug','discussion','efficient','mellow','basin','caring','disillusioned','stretch','fair','stem','clever','toothsome','daffy','balance','handsomely','minute','tough','correct','aunt','watch',
'wobble','zebra','anxious','wet','sound','soothe','cut','spotty','whispering','receptive','succeed','power','wary','wandering','illegal','omniscient','defeated','lewd','far-flung','scissors','daughter','rampant','run',
'inject','capricious','coal','necessary','snore','tall','annoyed','addicted','heavy','didactic','enjoy','used','suggest','strap','murder','houses','labored','lie','ruin','animated','stew','quirky','reply','eyes','branch',
'spoil','song','spooky','memorize','dynamic','deceive','cheat','educated','activity','brash','impolite','cast','fertile','retire','greasy','violent','absorbed','announce','arch','replace','squeal','afternoon','tramp',
'bath','zip','woman','bare','overjoyed','confess','treatment','outrageous','quilt','doubt','harsh','attraction','cub','thunder','peace','tin','sea','easy','luxuriant','promise','play','plants','deserve','lumpy','merciful',
'future','ready','illustrious','paper','record','club','geese','wrestle','industrious','dear','welcome','unequal','freezing','stir','flap','swanky','cross','ordinary','rambunctious','mere','reaction','minister','form',
'marble','business','arrest','war','beautiful','downtown','writing','leather','example','snatch','distance','volcano','adjustment','expand','grease','drip','wipe','long-term','scold','fill','confuse','nonchalant','tie',
'invite','excellent','tranquil','frightened','longing','haircut','ragged','incredible','lacking','crime','decisive','rabid','neat','useful','name','can','colossal','breath','continue','acidic','cactus','sofa','turn',
'pedal','elastic','creature','peaceful','workable','trip','childlike','one','vagabond','alluring','extra-small','near','jewel','whimsical','fence','squeak','squeeze','health','distribution','ban','lavish','available',
'equal','ripe','gray','testy','feigned','concerned','matter','resonant','shaky','wall','self','regret','office','wry','thought','sleepy','jolly','greedy','exchange','meeting','birthday','obnoxious','rock','sidewalk',
'knock','calendar','breezy','infamous','low','quarrelsome','argue','shop','company','ceaseless','economic','hesitant','ladybug','communicate','subsequent','girl','dry','staking','own','temper','cloistered','relax',
'condition','hospital','pleasure','move','hard','sister','edge','entertaining','basketball','creepy','mass','likeable','relieved','learn','tempt','development','yard','end','dress','bake','dad','dispensable','motionless',
'reject','fry','long','mature','towering','unsightly','glamorous','sordid','locket','separate','risk','wooden','lean','fragile','flood','travel','faded','plastic','handy','earsplitting','title','courageous','messy','quack',
'blue','five','vacuous','swift','gifted','chivalrous','thick','bone','unaccountable','stranger','poor','flawless','chin','camp','fog','moon','onerous','bury','statuesque','trail','harbor','carpenter','profuse','disappear',
'join','large','crow','present','abhorrent','floor','cream','racial','iron','wealthy','spiky','careful','corn','noisy','playground','spotted','beginner','story','scream','nippy','pie','owe','laughable','thankful','thaw',
'hope','hushed','massive','grateful','fuzzy','determined','talk','protective','moaning','rich','thing','whip','possible','mountain','friendly','curve','muddle','try','private','steel','hypnotic','warlike','cry','orange',
'passenger','dependent','boundless','airport','prick','north','first','magnificent','abortive','condemned','wish','flag','sedate','slimy','repeat','whole','hair','nappy','literate','boorish','living','exist','tightfisted',
'whistle','remember','current','harmonious','uppity','heap','sniff','choke','juggle','melt','bat','kitty','scene','pail','psychotic','abundant','wretched','ducks','fasten','complete','hellish','glorious',
'wren','torpid','hat','pollution','terrific','add','zesty','meek','butter','sail','violet','grubby','unlock','burly','shape','recognise','mammoth','transport','frog','launch','punishment','border','noise',
'soggy','mend','nervous','driving','toad','minor','clammy','strong','trap','giant','unwieldy','itchy','agree','broken','keen','regular','scatter','puncture','stingy','old','hollow','understood','sophisticated','baby',
'cannon','act','two','obese','license','adamant','touch','divergent','tumble','umbrella','lake','apparatus','heavenly','carve'];

const table_size = 36;
const pattern_size = 12;
const typeracer_count = 20;
const {random_user_from_room} = require('./users');

const LATLONGVALIDARRAY = [{lat: 36.1028,lng: -119.5814},{lat: 58.5817,lng: 13.7051},{lat: 30.9716,lng: -103.0681},{lat: 23.3898,lng: 120.4611},
    {lat: 32.7351,lng: 131.0019},{lat: 53.7787,lng: -2.7121},{lat: 40.4451,lng: 9.0868},{lat: 42.3178,lng: -7.7836},{lat: 52.6263,lng: 1.2581},{lat: -21.6696,lng: -45.9064},{lat: 44.7918,lng: -69.1984},
    {lat: 37.2419,lng: -94.7409},{lat: 38.3762,lng: 140.1676},{lat: 14.8065,lng: 104.1386},{lat: 64.1015,lng: 19.9742},{lat: 47.4382,lng: 0.5865},{lat: 59.4437,lng: 25.9852},{lat: -9.6507,lng: -76.7218},
    {lat: 56.8831,lng: 60.7121},{lat: 43.707,lng: 15.8975},{lat: 50.9984,lng: 17.3877},{lat: 42.4096,lng: 143.2026},{lat: 42.7545,lng: -72.2708},{lat: -27.1997,lng: 26.9517},{lat: 46.9789,lng: 4.3822},
    {lat: 44.2898,lng: -78.298},{lat: 51.3336,lng: 5.3052},{lat: 39.9932,lng: -75.6268},{lat: 53.0017,lng: 34.5056},{lat: 36.6061,lng: -118.742},{lat: 58.7736,lng: -117.3474},{lat: 45.067,lng: -64.4613},
    {lat: 62.5232,lng: 24.4594},{lat: 53.3927,lng: -1.3696},{lat: 33.0328,lng: 130.0927},{lat: 56.0511,lng: 21.8184},{lat: -38.2505,lng: 145.0623},{lat: 28.9583,lng: -82.0399},{lat: 40.0568,lng: -104.9995},
    {lat: 36.2429,lng: 128.2266},{lat: 36.5472,lng: 136.6482},{lat: 40.6649,lng: -73.4938},{lat: 53.1039,lng: -0.3177},{lat: 49.595,lng: 2.6528},{lat: 10.2774,lng: -74.0423},{lat: 43.5702,lng: -116.3522},
    {lat: 31.6012,lng: -81.8677},{lat: 45.8178,lng: 14.2844},{lat: 38.2746,lng: 16.1489},{lat: -7.597,lng: 108.7549},{lat: 38.1425,lng: -112.6165},{lat: 33.8308,lng: -81.1101},{lat: 59.8037,lng: 30.1283},
    {lat: 40.8709,lng: -4.1043},{lat: 37.3588,lng: -4.6725},{lat: 23.3034,lng: 77.3917},{lat: -22.9364,lng: -46.5445},{lat: 36.9191,lng: -77.5749},{lat: 52.3082,lng: -0.2925},{lat: 43.4209,lng: 12.1539},
    {lat: 53.6051,lng: -9.8982},{lat: 41.1947,lng: 1.5372},{lat: 40.9562,lng: -98.4085},{lat: 52.7519,lng: -1.9769},{lat: 59.5995,lng: 18.0844},{lat: 42.9031,lng: 141.5815},{lat: 40.1191,lng: -123.8222},
    {lat: 42.1918,lng: -73.3724},{lat: 40.1672,lng: -89.0603},{lat: 45.6667,lng: 11.5313},{lat: 42.9481,lng: -80.2213},{lat: -6.456,lng: 107.4683},{lat: 34.9401,lng: 136.5866},{lat: 32.8653,lng: -89.9998},
    {lat: -7.8041,lng: 111.5856},{lat: 28.8768,lng: -81.5847},{lat: 33.3145,lng: 129.4955},{lat: 28.6558,lng: -82.5114},{lat: 48.3949,lng: 16.288},{lat: 34.2822,lng: -99.3351},{lat: 35.1828,lng: -89.5978},
    {lat: 30.282,lng: -89.7968},{lat: 35.3397,lng: 132.8187},{lat: 31.9591,lng: 131.4284},{lat: 35.7275,lng: -78.612},{lat: 14.9816,lng: 104.7585},{lat: 37.6963,lng: 13.575},{lat: 43.0176,lng: 46.8327},
    {lat: -7.7973,lng: 110.3259},{lat: 53.7069,lng: 91.4905},{lat: 50.0724,lng: 14.3197},{lat: -29.6982,lng: -51.2213},{lat: 43.4621,lng: -79.7157},{lat: 39.6907,lng: -84.2324},{lat: 56.2123,lng: 34.43},
    {lat: 38.6272,lng: -84.1965}];


function random_promt(roomid){
    var temp = Math.floor((Math.random() * 8) + 1);
    //var temp = test[temp];
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
        case 7:
            return {type: temp, query: ''};
        case 8: 
            return {type: temp, query: ''};
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