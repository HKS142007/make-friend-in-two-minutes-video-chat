const socket = io(window.location.origin);
const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");
var peer = new Peer();
var peerId ;
socket.on('new-connections',data=>{
  document.getElementById('idle-users').innerHTML = `${data.idle} Idle`
  document.getElementById('online-users').innerHTML = `${data.online} Online`
})

peer.on('open', function(id) {
    peerId = id;
    console.log('My peer ID is: ' + id);
  });

  document.getElementById('make-call').addEventListener('click', async () => {
    callUser()
})

var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

socket.on('no-idle',()=>{
  alert('Sorry there is no idle users , please try again after 2 minutes')
})

function callUser(){
    socket.emit("call-user", {
        peerId
    });
}
socket.on('call-made',data=>{
  console.log(data);
  getUserMedia({video: true, audio: true}, function(stream) {
    var call = peer.call(`${data.peerId}`, stream);
    localVideo.srcObject = stream;
    call.on('stream', function(remoteStream) {
      // Show stream in some video/canvas element.
      let counter = 120;
      
      remoteVideo.srcObject = remoteStream
      setTimeout(() => {
        alert('2 minutes are done now , page will reload if you like to try again')
        window.location.href = "/"
    }, 120000);
    setInterval(() => {
        counter--;
        document.getElementById('count-down').innerHTML = `${counter} Seconds`;
    }, 1000);
    
    document.getElementById('make-call').disabled =true;
    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
})
peer.on('call', function(call) {
    console.log('call',call);
  getUserMedia({video: true, audio: true}, function(stream) {
    console.log('stream',stream);
    localVideo.srcObject = stream

    call.answer(stream); // Answer the call with an A/V stream.
    call.on('stream', function(remoteStream) {
        let counter = 120;

        remoteVideo.srcObject = remoteStream
        setTimeout(() => {
          alert('2 minutes are done now , page will reload if you like to try again')
          window.location.href = "/"
      }, 120000);
      setInterval(() => {
          counter--;
          document.getElementById('count-down').innerHTML = `${counter} Seconds`;
      }, 1000);
      
      document.getElementById('make-call').disabled =true;
    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
});