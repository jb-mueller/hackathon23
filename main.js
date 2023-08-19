const gyroOutput = document.getElementById("gyro-output")
const socket = new WebSocket("wss://hackathon-backend-l22i.onrender.com/")

const gyro = {}

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
        gyroOutput.innerText = `alpha: ${event.alpha}, beta: ${event.beta}, gamma: ${event.gamma}`
        gyro.alpha = event.alpha
        gyro.beta = event.beta
        gyro.gamma = event.gamma
    })
}

socket.onmessage = msg => {
    const msgJSON = JSON.parse(msg.data)
    if (msgJSON.uuid) {
        document.cookie = "uuid=" + msgJSON.uuid
    }
}

setInterval(() => {
    socket.send(JSON.stringify({ gyro }))
}, 100);

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.")
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(stream => {
        const mediaRecorder = new MediaRecorder(stream)
        document.getElementById('record').addEventListener('click', () => {
            mediaRecorder.start()
            console.log(mediaRecorder.state)
            console.log("start media recording")
        })
        let chunks = []
        mediaRecorder.ondataavailable = e => {
            chunks.push(e.data)
        }
        document.getElementById('stop').addEventListener('click', () => {
            mediaRecorder.stop()
            console.log(mediaRecorder.state)
            console.log("recorder stopped")
        })
        mediaRecorder.onstop = e => {
            console.log("recorder stopped")

            const clipName = prompt("Enter a name for your sound clip")
            const clipContainer = document.createElement("article")
            const clipLabel = document.createElement("p")
            const audio = document.createElement("audio")

            audio.setAttribute("controls", "")
            clipLabel.innerHTML = clipName
            clipContainer.appendChild(audio)
            clipContainer.appendChild(clipLabel)
            document.body.appendChild(clipContainer)

            const blob = new Blob(chunks, {type: "audio/ogg; codecs=opus"})
            chunks = []
            const audioURL = window.URL.createObjectURL(blob)
            audio.src = audioURL
        }
    }).catch(err => {
        console.error(`the following getUserMedia error occured: ${err}`)
    })
} else {
    console.log("getUserMedia not supported on your browser")
}