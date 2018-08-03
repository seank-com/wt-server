const fs = require('fs');
const express = require('express');
const fileUpload = require('express-fileupload');
const WebSocket = require('ws');

const app = express();
app.use(fileUpload());

const wss = new WebSocket.Server({ port: 8686 });

var flatten = function(obj) {
        var values = [];
        Object.getOwnPropertyNames(obj).forEach((val) => {
            if (Array.isArray(obj[val])) {
                obj[val].forEach((el) => {
                    values.push(el);
                });
            } else {
                values.push(obj[val]);
            }
        });
        return values;
    },
    sendInChunks = function (client, data) {
        var chunks = [],
            sendNextChunk = function (err) {
                options = {
                    binary: true,
                    fin: true
                };

                if (err) {
                    console.log("ERROR: send failed");
                    console.log(err);
                    chunks = [];
                    client.isBusy = false;
                } else {
                    options.fin = (chunks.length === 1);
                    client.isBusy = (chunks.length !== 0);

                    if (client.isBusy) {
                        console.log("Sending chunk");
                        client.send(chunks.shift(), options, sendNextChunk);
                    } else {
                        console.log("Send completed");
                    }
                }
            },
            start = 0,
            end = 0;

        while (end < data.length) {
            end = start + 32000;
            if (end > data.length) {
                end = data.length;
            }

            chunks.push(data.slice(start, end));
            start = end;
        }
        sendNextChunk();
    },
    broadcast = function (data, source) {
        var count = 0;
        console.log("Sending data");
        wss.clients.forEach((client) => {

            if (client !== source && client.readyState === WebSocket.OPEN && client.isBusy === false) {
                sendInChunks(client, data);
                count += 1;
            }
        })
        console.log('Data sent to %d active connections', count);
    };

app.post('/broadcast', (req, res) => {
    if (!req.files) {
        console.log('ERR: No files were uploaded in POST');
        return res.status(400).send('No files were uploaded.');
    }

    flatten(req.files).forEach((file) => {
        if (file.truncated) {
            console.log('ERR: file %s is too large (skipping)', file.name);
        } else {
            console.log('Broadcasting %s', file.name);
            broadcast(file.data, null);
        }
    })
    res.sendStatus(200);
});

app.listen(8080, () => {
    console.log("listening for broadcasts on port 8080");
})

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.isBusy = false;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    ws.on('ping', (data) => {
        ws.pong(data);
    })
    ws.on('message', (data) => {
//        fs.writeFileSync('lastMsg.wav', data);
        console.log('message received: size %s', data.length);
        
        broadcast(data, ws);
    });
});

const internval = setInterval(() => {
    var count = 0, busy = 0, closed = 0;
    console.log("Pinging clients");
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            closed += 1;
            return ws.terminate();
        }

        if (ws.isBusy === false) {
            ws.isAlive = false;
            ws.ping(".");
            count += 1;    
        } else {
            busy += 1;
        }
    });
    if (closed) {
        console.log('%d inactive connections terminated', closed);
    }
    console.log ('%d active connections, %d busy', count, busy);
}, 30000);