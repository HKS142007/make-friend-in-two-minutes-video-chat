


const socket = io(window.location.origin);
const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");
var configuration = {

    iceServers: [{urls: "stun:stun.1.google.com:19302"}]
 };
const { RTCPeerConnection, RTCSessionDescription } = window;
const peerConnection = new RTCPeerConnection(configuration);
let isAlreadyCalling = false;

async function callUser(to=null){
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    socket.emit("call-user", {
        offer,
        to
    });
    isAlreadyCalling = true ;
}

document.getElementById('make-call').addEventListener('click', async () => {
    callUser()
})

socket.on("call-made", async data => {
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );
    console.log(`you have a call from ${data.user} `)
    // let counter = 120
    // document.getElementById('make-call').disabled =true;
        // setTimeout(() => {
        //     alert('2 minutes are done now , page will reload if you like to try again')
        //     window.location.href = "/"
        // }, 120000);
        // setInterval(() => {
        //     counter--;
        //     document.getElementById('count-down').innerHTML = counter;
        // }, 1000);

        

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
    if (!isAlreadyCalling) {
        callUser(data.user);
        isAlreadyCalling = true;
      }
    socket.emit("make-answer", {
        answer,
        to: data.user
    });

    
});

socket.on('no-idle',()=>{
    alert('Sorry there is no idle users , please try again after 2 minutes')
})

socket.on("answer-made", async data => {
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );
    let counter = 120;
    console.log(localVideo)

    

    console.log(`answer from ${data.user}`)
    setTimeout(() => {
        alert('2 minutes are done now , page will reload if you like to try again')
        window.location.href = "/"
    }, 120000);
    setInterval(() => {
        counter--;
        document.getElementById('count-down').innerHTML = counter;
    }, 1000);
    
    document.getElementById('make-call').disabled =true;
});



var constraints = { audio: true, video: true };
    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
      /* use the stream */
      console.log(stream)
      if ('srcObject' in localVideo) {
        localVideo.srcObject = stream
      } else {
        localVideo.src = window.URL.createObjectURL(stream) // for older browsers
      }
      stream.getTracks().forEach(track => {
        console.log(track)
        return peerConnection.addTrack(track, stream)
    });
    })
    .catch(function(err) {
      /* handle the error */
      console.log(err);
    });

peerConnection.ontrack = ({streams:[stream] }) => {
    if ('srcObject' in remoteVideo) {
        remoteVideo.srcObject = stream
        console.log('src=>' ,remoteVideo.srcObject)
      } else {
        remoteVideo.src = window.URL.createObjectURL(stream) 
      }

        
};

