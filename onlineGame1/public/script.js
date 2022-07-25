const container = document.getElementById("container");

var usernmame;

moving_up = false;
moving_down = false;
moving_left = false;
moving_right = false;


players = {}

scores = {};
usernames = {};

var cnv;
var positions;
var collision;

var can_move = true;
var can_be_bounced = true;

frame = 0;

var sessionID;

diameter = 50;

var scoreInterval = window.setInterval(scoreCallback,1000);

const socket = io({
    transports: ["websocket"]
});

    var position = {
        x:(Math.random()*0.5)+0.25,
        y:(Math.random()*0.5)+0.25
    };


function player(position,id){
    this.id = id;
    this.position = position;
    this.positionX = this.position.x;
    this.positionX = this.position.x;
    this.username = ""
}

function updateName(){
    player.username = document.getElementById("name").value;
    socket.emit("updateName",{
        username:player.username
    });
}

function scoreCallback(){
    scores[sessionID]++;
}

player.positionX = position.x;
player.positionY = position.y;

socket.emit("updatePosition",{
    x: player.positionX,
    y: player.positionY
});

function findTarget(dx,dy,minDist,x2,y2,id){
    let angle = Math.atan2(dy,dx);

    let targetX = player.positionX+(Math.cos(angle)*minDist);
    let targetY = player.positionY+(Math.sin(angle)*minDist);

    if (angle<1){
        targetX = player.positionX+Math.cos(angle)*minDist;
        socket.emit("moveTarget",{
            id:id,
            x:positions[id].x-(Math.cos(angle)*minDist)/2,
            y:positions[id].y-(Math.sin(angle)*minDist)/2
        })
    }
    else{
        targetX = player.positionX-Math.cos(angle)*minDist;
        socket.emit("moveTarget",{
            id:id,
            x:positions[id].x+(Math.cos(angle)*minDist)/2,
            y:positions[id].y+(Math.sin(angle)*minDist)/2
        })
    }

    player.positionX = targetX;
    player.positionY = targetY;

    socket.emit("updatePosition",{
        x: player.positionX,
        y: player.positionY
    });


}

function setup(){

    screenWidth = 600;
    screenHeight = 600;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    cnv = createCanvas(screenWidth,screenHeight);
    cnv.position((windowWidth-screenWidth)/2,(windowHeight-screenHeight)/2);

    iceberg = loadImage("Iceberg.png");
    penguin = loadImage("Penguin1.png")

    frameRate(30);

    socket.on("connect",()=>{
        sessionID = socket.id;
        player.id = sessionID;
        scores[sessionID] = 0;
    });

};


function draw(){

    cnv.mouseReleased(()=>{cnv.mouseIsPressed = false;});


    imageMode(CORNER);
    image(iceberg,0,0);

    socket.on("positions",(data)=>{
        positions = data;
    });

    socket.on("usernames",(data)=>{
        usernames = data;
    });

    socket.emit("updateScores",{
        id : sessionID,
        scores : scores[sessionID]
    });
    
    socket.on("score_update",(data)=>{
        scores = data;
    })

    for (const id in positions){
        const position = positions[id];
        players[id] = new player(position,id);
        
        imageMode(CENTER);
        image(penguin,position.x*width,position.y*height,diameter,diameter);
        

        if (id!=sessionID){
            fill("WHITE");
            text(usernames[id]+": "+(scores[id]),position.x*width,position.y*height);
            distance = checkDistance(player.positionX,position.x,player.positionY,position.y);

            if (distance<((diameter-0.1)/((screenWidth+screenHeight)/2))){
                findTarget(player.positionX-position.y,player.positionY-position.y,0.05,position.x,position.y,id);
            }
        }


    }

    if (
        player.positionX*screenWidth>screenWidth*0.875 || 
        player.positionX*screenWidth<screenWidth*0.15 ||
        player.positionY*screenHeight>screenHeight*0.875||
        player.positionY*screenHeight<screenHeight*0.15
        ){
            can_move = false;
            scores[sessionID]=0;
            setTimeout(function(){
                can_be_bounced = false;
                frame++;
                if (frame==1){
                player.positionX = (Math.random()*0.5)+0.25;
                player.positionY = (Math.random()*0.5)+0.25;}
                socket.emit("updatePosition",{
                    x: player.positionX,
                    y: player.positionY
                });

            },1000);
            can_be_bounced = true;
            frame = 0;

    }
    else{
        can_move = true;
    }

    if(can_move)
{
    if (moving_up){
        player.positionY -= 0.01;
    }

    if (moving_down){
        player.positionY += 0.01;

    }
    if (moving_left){
        player.positionX -= 0.01;

    }

    if (moving_right){
        player.positionX += 0.01;
    }}


    if (player.username==null){
        textSize(20);
        fill("YELLOW");
        text(scores[sessionID],player.positionX*screenWidth,(player.positionY-0.05)*screenHeight);
    }
    else{
        textSize(20);
        fill("YELLOW");
        text(player.username+": "+(scores[sessionID]),player.positionX*screenWidth,(player.positionY-0.05)*screenHeight);
    }

    socket.emit("updatePosition",{
        x:player.positionX,
        y:player.positionY
    })

}

function checkDistance(x1,x2,y1,y2){
    let dist = sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
    return dist;


}

function keyPressed(){

        if (keyCode === 38){
            moving_up = true;
        }
        if (keyCode === 40){
            moving_down = true;
        }
        if (keyCode === 39){
            moving_right = true;
        }
        if (keyCode === 37){
            moving_left = true;
        }

}

function keyReleased(){
    if (keyCode === 38){
        moving_up = false;
    }
    if (keyCode === 40){
        moving_down = false;
    }
    if (keyCode === 39){
        moving_right = false;
    }
    if (keyCode === 37){
        moving_left = false;
    }

}


