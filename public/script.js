// root path is facing docker root path
const socket = io("/");
const videoGrid = document.getElementById("video-grid");



const myPeer = new Peer(undefined, {
    host: location.hostname,
    secure: true,
    port: location.port,
    path: "peerjs"
});

const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {}
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then(stream => {
        addVideoStream(myVideo, stream);

        myPeer.on("call", call => {
            console.log('peer called');
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            connectToNewUser(userId, stream);
            console.log(userId, stream);
        });
    }).catch((err) => {console.error(err)})

socket.on("user-disconnected", userId => {
peers[userId]?.close()
});

myPeer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
    console.log('socket open');
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
        video.remove();
    });
    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    videoGrid.append(video);
}
