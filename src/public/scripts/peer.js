const host = window.location.origin;
const socket = io(host);
const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");
var peer = new Peer();
var peerId ;
let checked = true;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let target_camera = true;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let interval ;
let code = urlParams.get('code')
let withcamera = urlParams.get('with-camera')



fetch(`${host}/checkCode?code=${code}`).then(res=>{
  return res.json()
}).then(status=>{
   if(!status){
     alert('code is invalid')
    window.location.href = `/`
   } 
})

socket.on('set-camera',(hasCamera)=>{
  target_camera = hasCamera;
})

socket.on('new-connections',data=>{
  document.getElementById('idle-users').innerHTML = `${data.idle} Idle`
  document.getElementById('online-users').innerHTML = `${data.online} Online`
})

peer.on('open', function(id) {
    peerId = id;
    socket.emit('camera',withcamera);
  });

  peer.on('close',function(user){
    console.log('closed',user)
  })

  peer.on('disconnected',function(user){
    console.log('disconnected',user)
  })

  document.getElementById('make-call').addEventListener('click', async () => {
    callUser()
})


socket.on('no-idle',()=>{
  alert('Sorry there is no idle users , please try again after 2 minutes')
})

function callUser(){
    socket.emit("call-user", {
        peerId
    });
}



socket.on('call-made',data=>{

  
  getUserMedia({video: true, audio: true}, function(stream) {
    var call = peer.call(`${data.peerId}`, stream);
    localVideo.srcObject = stream;
    call.on('stream', function(remoteStream) {

      // Show stream in some video/canvas element.
      let counter = 120;
      remoteVideo.srcObject = remoteStream
      if(target_camera == 'false'){
        remoteStream.getVideoTracks()[0].enabled = false
      }

  let interval_caller = setInterval(() => {
      if(counter > 0){
        counter--;
      }
      else{
        clearInterval(interval_caller);

        if (confirm('do you want to join room again ?')) {
          
         window.location.href = `${host}/room.html?code=${code}&with-camera=${withcamera}`
        }
        else
          window.location.href = '/'
      }
        document.getElementById('count-down').innerHTML = `${counter} Seconds`;
    }, 1000);
    
    document.getElementById('make-call').disabled =true;
    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
})

peer.on('call', function(call) {

  getUserMedia({video: true, audio: true}, function(stream) {
    localVideo.srcObject = stream

    call.answer(stream); // Answer the call with an A/V stream.
    call.on('stream', function(remoteStream) {
        let counter = 120;
        remoteVideo.srcObject = remoteStream
        if(target_camera == 'false'){
          remoteStream.getVideoTracks()[0].enabled = false
        }
      let interval_answer =  setInterval(() => {
          if(counter > 0){
            counter--;
          }
          else{
            clearInterval(interval_answer);
            
            if (confirm('do you want to join room again ?') ) {
              window.location.href = `${host}/room.html?code=${code}&with-camera=${withcamera}`
            }
            else
              window.location.href = '/'
          }
            document.getElementById('count-down').innerHTML = `${counter} Seconds`;
        }, 1000);
      
      document.getElementById('make-call').disabled =true;
    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
});