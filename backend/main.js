import { WebSocketServer } from 'ws'
import { v4 as uuidv4 } from 'uuid'

const PORT = process.env.PORT || 8080

const wss = new WebSocketServer({ port: PORT })

const clients = new Set()
let unity = null

wss.on('connection', ws => {
    let uuid = "unknown"
    console.log("unknown uuid")
    ws.on('message', function message(msg) {
        console.log(`message received: ${msg}`)
        if (msg.toString() === "UNITY") {
            unity = ws
        } else {
            const msgJSON = JSON.parse(msg.toString())
            if (msgJSON.client) {
                if (!clients.has(msgJSON.client)) {
                    uuid = uuidv4()
                    console.log("new client connected, uuid: " + uuid)
                    clients.add(uuid)
                    ws.send(JSON.stringify({ uuid }))
                    console.log("connected clients: " + clients.size)
                }
                if (unity) {
                    unity.send(JSON.stringify({
                        type: "connect",
                        uuid: uuid
                    }))
                }
            } else if (msgJSON.gyro) {
                if (unity) {
                    unity.send(JSON.stringify({
                        type: "gyro",
                        uuid: uuid,
                        alpha: msgJSON.gyro.alpha,
                        beta: msgJSON.gyro.beta,
                        gamma: msgJSON.gyro.gamma,
                    }))
                }
            }
        }
    })

    ws.on('close', () => {
        if (uuid !== "unknown") {
            if (unity) {
                unity.send(JSON.stringify({
                    type: "disconnect",
                    uuid: uuid
                }))
            }
        }
    })
})
