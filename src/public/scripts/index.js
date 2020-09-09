const host = window.location.origin;

$('#with-camera').click(()=>{
    let code = $('#code').val();
    if(!code)
          return alert('please enter the code')
     
    fetch(`${host}/checkCode?code=${code}`).then(res=>{
       return res.json()
    }).then(status=>{
        if(status)
            window.location.href = `/room.html?code=${code}&with-camera=true`
        else
            alert("code is invalid")    
    })
})


$('#without-camera').click(()=>{
    let code = $('#code').val();
    if(!code)
          return alert('please enter the code')
     
    fetch(`${host}/checkCode?code=${code}`).then(res=>{
       return res.json()
    }).then(status=>{
        if(status)
            window.location.href = `/room.html?code=${code}&with-camera=false`
        else
            alert("code is invalid")    
    })
})