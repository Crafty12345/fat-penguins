const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http,{
    transports:["websocket"]
});

const port = process.env.port || 8080;

app.use(express.static(__dirname));
app.use(express.static(__dirname+"/public"));
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/public/index.html");
});

http.listen(port,()=>{
    console.log(`Server is active at port:${port}`);
});

const positions = {};
const scores = {};
const usernames = {};
const can_move = {};

io.on("connection",(socket)=>{
    console.log(`${socket.id} connected!`)
    positions[socket.id] = {x:0.5,y:0.5};
//    console.log(positions);

    socket.on("disconnect",()=>{
        delete positions[socket.id];
        console.log(`${socket.id} disconnected`);
    });
    socket.on("updatePosition",(data)=>{
        positions[socket.id].x = data.x;
        positions[socket.id].y = data.y;

    });

    socket.on("moveTarget",(data)=>{
        id = data.id;
        positions[id].x = data.x;
        positions[id].y = data.y;
    });
    socket.on("updateScores",(data)=>{
        id = data.id;
        scores[id] = data.scores;
        io.emit("score_update",scores);
    })
    socket.on("updateName",(data)=>{
        usernames[id] = data.username;
        io.emit("usernames",usernames);
        console.log(usernames);
        
    })
});

const frameRate = 30;

setInterval(()=>{
    io.emit("positions",positions);
},1000/frameRate);