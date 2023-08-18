import { WebSocketServer } from 'ws'
import {v4 as uuidv4 } from 'uuid'

const PORT = process.env.PORT || 8080

const wss = new WebSocketServer({ port: PORT })

const clients = {}
let unity = null

wss.on('connection', ws => {
    ws.on('message', function message(msg) {
        console.log(`message received: ${msg}`)
        if (msg.toString() === "UNITY") {
            unity = ws
        } else {
            const msgJSON = JSON.parse(msg.toString())
            if (msgJSON.client) {
                if (!Object.keys(clients).includes(msgJSON.client)) {
                    const newUUID = uuidv4()
                    console.log("new client connected, uuid: " + newUUID)
                    clients[newUUID] = ws
                    clients[newUUID].connected = true
                    ws.send(JSON.stringify({ uuid: newUUID }))
                    console.log("connected clients: " + Object.keys(clients).length)
                } else {
                    clients[msgJSON.client].connected = true
                }
                if (unity) {
                    // TODO: send uuid of new client to unity
                }
            }
        }
    })

    ws.on('close', () => {
        const closeUUID = Object.keys(clients).find(key => clients[key] === ws)
        if (closeUUID) {
            clients[closeUUID].connected = false
        }
    })
})
