const gyroOutput = document.getElementById("gyro-output")
const socket = new WebSocket("wss://hackathon-backend-l22i.onrender.com/")

socket.onopen = () => {
    console.log("connection established")
    window.addEventListener("deviceorientation", event => {
        console.log(event.alpha)
        gyroOutput.innerText = event.alpha
        socket.send(JSON.stringify({ alpha: event.alpha }))
    })
}

socket.onmessage = msg => {
    console.log(msg)
}