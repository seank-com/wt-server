# wt-server
A WebSocket server that accepts WAV files and shares them with all connections

## Preparing the project

In the terminal of your choice navigate to the server folder and run the following command

```bash
$ npm install
```

## Running the Server Locally

In the terminal of your choice navigate to the server folder and run one of the following commands

```bash
$ npm start
```

```bash
$ node src/index.js
```

```bash
$ docker build -t wt-server .
$ docker run -it -p 8080:8080 -p 8686:8686 wt-server
```

```bash
$ cd ..
$ docker-compose up
```

## Posting to the server

In the terminal of your choice navigate to the server folder and run one of the following commands

```bash
$ curl -v -X POST "http://localhost:8080/broadcast" -F "file=@intro.wav"
```
