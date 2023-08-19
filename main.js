const gyroOutput = document.getElementById("gyro-output")
const socket = new WebSocket("wss://hackathon-backend-l22i.onrender.com/")

const gyro = {}
let deltaXNorm = 0
let deltaYNorm = 0

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
        document.getElementById("uuid-output").innerText = cookies.uuid
    } else {
        socket.send(JSON.stringify({ client: "new" }))
    }
    window.addEventListener("deviceorientation", event => {
        console.log(event.alpha)
        gyroOutput.innerText = `alpha: ${Math.round(event.alpha)}, beta: ${Math.round(event.beta)}, gamma: ${Math.round(event.gamma)}`
        gyro.alpha = event.alpha
        gyro.beta = event.beta
        gyro.gamma = event.gamma
    })
}

socket.onmessage = msg => {
    const msgJSON = JSON.parse(msg.data)
    if (msgJSON.uuid) {
        document.cookie = "uuid=" + msgJSON.uuid
        document.getElementById("uuid-output").innerText = cookies.uuid
    }
}

setInterval(() => {
    socket.send(JSON.stringify({ uuid: cookies.uuid, alpha: deltaXNorm, beta: deltaYNorm }))
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

            const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
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

const dpad = document.getElementById('dpad')
const dpadKnob = document.getElementById('dpad-knob')

let mouseIsDown = false
let dragStartPosition = { x: 0, y: 0 }

dpadKnob.addEventListener("touchstart", event => {
    mouseIsDown = true
    dragStartPosition.x = event.touches[0].screenX
    dragStartPosition.y = event.touches[0].screenY
    console.log("foo")
})

document.addEventListener("touchend", () => {
    mouseIsDown = false
    dpadKnob.style.left = "0"
    dpadKnob.style.top = "0"
    console.log("bar")
})

document.addEventListener("touchmove", event => {
    if (mouseIsDown) {
        const deltaX = event.touches[0].screenX - dragStartPosition.x
        const deltaY = event.touches[0].screenY - dragStartPosition.y
        dpadKnob.style.left = deltaX + "px"
        dpadKnob.style.top = deltaY + "px"
        console.log("baz")
        deltaXNorm = deltaX / dpad.offsetWidth
        deltaYNorm = deltaY / dpad.offsetHeight
    }
})