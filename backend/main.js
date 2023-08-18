import { WebSocketServer } from 'ws'

const PORT = process.env.PORT || 8080

const wss = new WebSocketServer({ port: PORT })

let counter = 0

wss.on('connection', function connection(ws) {
    ws.on('message', function message(msg) {
        console.log("msg received: " + msg)
    })
    ws.send("Hello!")
    setInterval(() => {
        ws.send("counter: " + counter)
        counter += 1
        console.log("sent counter: " + counter)
    }, 2000)
    console.log("sent Hello!")
})
