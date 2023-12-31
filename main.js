
const gyroOutput = document.getElementById("gyro-output")
const socket = new WebSocket("wss://hackathon-backend-l22i.onrender.com/")

const spaceship = document.getElementById("spaceship")

const gyro = {}
let deltaXNorm = 0
let deltaYNorm = 0

let isRecording = false

const cookies = {}
const cookiesRaw = document.cookie.split("; ")
cookiesRaw.forEach(cookie => {
    [key, value] = cookie.split("=")
    cookies[key] = value
})
console.log(cookies)

function setSpaceshipColor(uuid) {
    const hue = Number("0x" + uuid.substring(0, 2)) * 360 / 255
    spaceship.style.color = `hsl(${hue}, 80%, 50%)`
}

socket.onopen = () => {
    console.log("connection established")
    if (cookies.uuid) {
        socket.send(JSON.stringify({ client: cookies.uuid }))
        setSpaceshipColor(cookies.uuid)
    } else {
        socket.send(JSON.stringify({ client: "new" }))
    }
}

socket.onmessage = msg => {
    const msgJSON = JSON.parse(msg.data)
    if (msgJSON.uuid) {
        document.cookie = "uuid=" + msgJSON.uuid
        cookies.uuid = msgJSON.uuid
        setSpaceshipColor(msgJSON.uuid)
    }
}

setInterval(() => {
    if (mouseIsDown) {
        socket.send(JSON.stringify({ uuid: cookies.uuid, gyro: { alpha: deltaXNorm, beta: deltaYNorm } }))
        console.log("sending " + deltaXNorm + " " + deltaYNorm)
    }
}, 100);

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.")
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(stream => {
        const mediaRecorder = new MediaRecorder(stream)
        recordBtn.addEventListener("touchstart", () => {
            mediaRecorder.start()
            console.log(mediaRecorder.state)
            console.log("start media recording")
            recordBtn.style.boxShadow = "0 0 5rem red inset"
            isRecording = true
        })
        let chunks = []
        mediaRecorder.ondataavailable = e => {
            chunks.push(e.data)
        }
        document.body.addEventListener('touchend', () => {
            if (isRecording) {
                mediaRecorder.stop()
                console.log(mediaRecorder.state)
                console.log("recorder stopped")
                recordBtn.style.boxShadow = "0 0 5rem blue inset"
            }
        })
        mediaRecorder.onstop = e => {
            console.log("recorder stopped")

            const blob = new Blob(chunks, { type: "audio/wav" })
            const fileReader = new FileReader()
            fileReader.onload = function (event) {
                console.log("onload")
                const base64Data = event.target.result.split(',')[1]
                socket.send(JSON.stringify({ uuid: cookies.uuid, audio: base64Data }))
            }
            fileReader.readAsDataURL(blob)
            chunks = []
        }
    }).catch(err => {
        console.error(`the following getUserMedia error occured: ${err}`)
    })
} else {
    console.log("getUserMedia not supported on your browser")
}

const dpad = document.getElementById('dpad')
const dpadKnob = document.getElementById('dpad-knob')
const recordBtn = document.getElementById('record-btn')
const container = document.getElementById('container')
const controlsContainer = document.getElementById('controls-container')

let mouseIsDown = false
let dragStartPosition = { x: 0, y: 0 }

dpadKnob.addEventListener("touchstart", event => {
    mouseIsDown = true
    dragStartPosition.x = event.touches[0].screenX
    dragStartPosition.y = event.touches[0].screenY
})

document.addEventListener("touchend", () => {
    mouseIsDown = false
    dpadKnob.style.left = "0"
    dpadKnob.style.top = "0"
    dpadKnob.style.transition = "all 0.2s ease-in-out"
    setTimeout(() => {
        dpadKnob.style.transition = "none"
    }, 200);
})

document.addEventListener("touchmove", event => {
    if (mouseIsDown) {
        const deltaX = event.touches[0].screenX - dragStartPosition.x
        const deltaY = event.touches[0].screenY - dragStartPosition.y
        dpadKnob.style.left = deltaX + "px"
        dpadKnob.style.top = deltaY + "px"
        deltaXNorm = deltaX / dpad.offsetWidth
        deltaYNorm = deltaY / dpad.offsetHeight
    }
})


const startBtn = document.getElementById("start-btn")

startBtn.addEventListener("touchstart", () => {
    document.body.requestFullscreen()
    setTimeout(() => {
        if (document.fullscreenElement) {
            startBtn.style.display = "none"
            controlsContainer.style.display = "flex"
        }
    }, 500);
})