const gyroOutput = document.getElementById("gyro-output")
const socket = new WebSocket("ws://localhost:8080") //("wss://hackathon-backend-l22i.onrender.com/")

const cookies = {}
const cookiesRaw = document.cookie.split("; ")
cookiesRaw.forEach(cookie => {
    [key, value] = cookie.split("=")
    cookies[key] = value
})
console.log(cookies)

socket.onopen = () => {
    console.log("connection established")
    if (cookies.uuid) {
        socket.send(JSON.stringify({ client: cookies.uuid }))
    } else {
        socket.send(JSON.stringify({ client: "new" }))
    }
    window.addEventListener("deviceorientation", event => {
        console.log(event.alpha)
        gyroOutput.innerText = event.alpha
        //socket.send(JSON.stringify({ alpha: event.alpha }))
    })
}

socket.onmessage = msg => {
    const msgJSON = JSON.parse(msg.data)
    if (msgJSON.uuid) {
        document.cookie = "uuid=" + msgJSON.uuid
    }
}