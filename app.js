const express = require('express');
const socket = require('socket.io');
const path = require('path');
const cors = require('cors');
const validate = require('./validators/validator');
require('./config/db');
const Room = require('./models/Room');
const { sendStatus } = require('express/lib/response');

const app = express();
const server = app.listen(process.env.PORT || 4000);
const io = new socket.Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public/build')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

setInterval(() => {
    Room.find()
        .then(rooms => {
            for(let room of rooms){
                if((new Date().getTime()-room.renew)/1000/60 > 5){
                    room.remove();
                }
            }
        });
}, 1000*60*6);

app.post('/room/create', (req, res) => {
    const valid = validate(req.body.url);

    if(!valid) return res.sendStatus(406);
    
    (new Room({...valid, renew: new Date().getTime(), originalUrl: req.body.url}))
        .save()
        .then(room => res.send(room.id))
        .catch(err => console.log(err));
});

app.get('/room/info/:id', (req, res) => {
    Room.findById(req.params.id)
        .then(room => {
            res.json({id: room.id, url: room.url, key: room.key, originalUrl: room.originalUrl});
        })
        .catch(err => res.sendStatus(404));
});

app.put('/room/update', async (req, res) => {
    const room = await Room.findById(req.body.id).catch(err => console.log(err));

    if(!room) return res.sendStatus(406);

    const valid = validate(req.body.url);

    if(!valid) return res.sendStatus(406);

    room.originalUrl = req.body.url;
    room.url = valid.url;
    room.key = valid.key;

    const newRoom = await room.save().catch(err => console.log(err));

    if(!newRoom) return sendStatus(406);

    res.json({id: room.id, url: room.url, key: room.key, originalUrl: room.originalUrl});
});

app.use('/*', (req, res) => res.sendFile(path.join(__dirname, 'public/build', 'index.html')));

io.on('connection', socket => {
    const roomId = socket.handshake.headers.id;

    socket.join(roomId);

    socket.on('PLAY', () => {
        socket.broadcast.to(roomId).emit('PLAY');
    });

    socket.on('PAUSE', () => {
        socket.broadcast.to(roomId).emit('PAUSE');
    });

    socket.on('SEEK', data => {
        socket.broadcast.to(roomId).emit('SEEK', data);
    });

    socket.on('UPDATE', data => {
        socket.broadcast.to(roomId).emit('UPDATE', data);
    });

    socket.on('MSG', msg => {
        if(msg.sender && msg.message) io.to(roomId).emit('MSG', msg);
    });

    socket.on('RENEW', () => {
        Room.findById(roomId)
            .then(room => {
                room.renew = new Date().getTime();
                room.save();
            })
            .catch(err => console.log(err));
    });
});