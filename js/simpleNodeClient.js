div = document.getElementById('scratchPad');
var channel;
var username;

var allClient;

var nameRoom=document.getElementById("nameRoom");
var input = document.getElementById("channelInput");
var inputUser = document.getElementById("usernameInput");
var channelButton = document.getElementById("channelButton");

var dataChannelSend=document.getElementById("dataChannelSend");
var dataChannelReceive=document.getElementById("dataChannelReceive");



var x=0;
var sendButton = document.getElementById("sendButton");
sendButton.disabled = false;
dataChannelSend.disabled = false;



sendButton.onclick = sendData;
function sendData(){
    if (x==0){
        var myMessage = [];
        myMessage[0]=dataChannelSend.value;
        myMessage[1]=username;
        document.getElementById("dataChannelSend").value = '';
        appendMessage(myMessage, 'outgoing');
        scrollToBottom();
        socket.emit('message', {
            channel: channel,
            message: myMessage
        });
        x=1;
    }
    
    else{
        var myMessage = [];
        myMessage[0]=dataChannelSend.value;
        myMessage[1]=username;
        document.getElementById("dataChannelSend").value = '';
        appendMessage(myMessage, 'outgoing');
        scrollToBottom();
        if(myMessage[0] == "Bye"){
            // div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' (performance.now() / 1000).toFixed(3) + ' --> Sending "Bye" to server...</p>');
            appendInfo("<marquee behavior='scroll' direction='left' style='color:red'>Sending 'Bye' to server</marquee>");
            scrollToBottom();
            console.log('Sending "Bye" to server');
            socket.emit('Bye', channel);
            // div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
            //     (performance.now() / 1000).toFixed(3) +' --> Going to disconnect...</p>');
            appendInfo("<p style='color:red'>Going to disconnect...</p>");
            scrollToBottom();
            console.log('Going to disconnect...');
            socket.disconnect();
            sendButton.disabled = true;
            dataChannelSend.disabled = true;
        }else{
            socket.emit('response', {
            channel: channel,
            message: myMessage
        });
        }
    }
    
}


var socket = io.connect('https://src-app.herokuapp.com');

channelButton.onclick=getChannel;
function getChannel(){
    channel = input.value;
    username =inputUser.value;
    
    if (channel !== "") {
        appendInfo('Trying to create or join channel: ', channel);
        scrollToBottom();
        socket.emit('clientsID', username);
        socket.emit('create or join', channel);
        
        nameRoom.appendChild(document.createTextNode(channel));
        document.querySelector('.infoLogin').style.visibility = "hidden";
        document.querySelector('.chat__section').style.visibility = "visible";
        
    }
}



socket.on('created', function (channel){
    console.log('channel ' + channel + ' has been created!');
    console.log('This peer is the initiator...');
    
  
    appendInfo("Channel "+ channel + " has been created!");
    scrollToBottom();
    appendInfo("You are the initiator!");
    scrollToBottom();
});

socket.on('full', function (channel){
    console.log('channel ' + channel + ' is too crowded! \ Cannot allow you to enter, sorry :-(');
    appendInfo('channel ' + channel + ' is too crowded! \ Cannot allow you to enter, sorry :-(');
    scrollToBottom();
    // div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +(performance.now() / 1000).toFixed(3) +
    //      ' --> \ channel ' + channel + ' is too crowded! \
    //     Cannot allow you to enter, sorry :-( </p>');
});

socket.on('remotePeerJoining', function (channel){
    console.log('Request to join ' + channel);
    console.log('You are the initiator!');
    
    appendInfo( "A new user Request to join  "+ channel + "!");
    scrollToBottom();
});

socket.on('joined', function (msg){
    console.log('Message from server: ' + msg);
    
    appendInfo( msg);
    scrollToBottom();
});

socket.on('broadcast: joined', function (msg){
    // div.insertAdjacentHTML( 'beforeEnd', '<p style="color:red">Time: ' +
    //     (performance.now() / 1000).toFixed(3) + ' --> Broadcast message from server: </p>');
    // div.insertAdjacentHTML( 'beforeEnd', '<p style="color:red">' + msg + '</p>');
    appendInfo(msg);
    scrollToBottom();
    console.log('Broadcast message from server: ' + msg);

    
    
});

socket.on('log', function (array){
    console.log.apply(console, array);
});

socket.on('message', function (message){
    
    console.log('Got message from other peer: ' + message);
    // div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
    //     (performance.now() / 1000).toFixed(3) + ' --> Got message from other peer: </p>');
    // div.insertAdjacentHTML( 'beforeEnd', '<p style="color:blue">' + message + '</p>');
    // document.getElementById("dataChannelReceive").value = username + " : "+  message;
    // document.getElementById("dataChannelSend").value = '';
    appendMessage(message, 'incoming');
    scrollToBottom();
    
    
});

socket.on('response', function (response){
    
    console.log('Got response from other peer: ' + response);
    // div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
    // (performance.now() / 1000).toFixed(3) + ' --> Got response from other peer: </p>');
    // div.insertAdjacentHTML( 'beforeEnd', '<p style="color:blue">' + response + '</p>');
    // document.getElementById("dataChannelReceive").value = username + " : "+ response;
    // document.getElementById("dataChannelSend").value = '';
    appendMessage(response, 'incoming');
    scrollToBottom();
    
});

socket.on('Bye', function (){
    console.log('Got "Bye" from other peer! Going to disconnect...');
    // div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
    //     (performance.now() / 1000).toFixed(3) + ' --> Got "Bye" from other peer!</p>');
    // div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +
    //     (performance.now() / 1000).toFixed(3) + ' --> Sending "Ack" to server</p>');
    appendInfo("<marquee behavior='scroll' direction='left' style='color:red'>Got 'Bye' from the other peer</marquee>");
    scrollToBottom();
    appendInfo("<p style='color:red'>Sending 'Ack' to server</p>");
    scrollToBottom();
    console.log('Sending "Ack" to server');
    socket.emit('Ack');
    // div.insertAdjacentHTML( 'beforeEnd', '<p>Time: ' +(performance.now() / 1000).toFixed(3) + ' --> Going to disconnect...</p>');
    appendInfo("<p style='color:red'>Going to disconnect...</</p>");
    scrollToBottom();
    console.log('Going to disconnect...');
    socket.disconnect();
    sendButton.disabled = true;
    dataChannelSend.disabled = true;
 });

 function appendMessage(msg, type) {
    let mainDiv = document.createElement('div');
    let className = type;
    mainDiv.classList.add(className, 'message');
    let markup = `
        <h4>${msg[1]}</h4>
        <p>${msg[0]}</p>
    `;
    mainDiv.innerHTML = markup;
    dataChannelReceive.appendChild(mainDiv);
}

function appendInfo(info) {
    let mainDiv = document.createElement('div');
    let className = "info";
    mainDiv.classList.add(className, 'info');
    let markup = `
        <h4 style='font-size:15px;'>${info}</h4>
        <br>
    `;
    mainDiv.innerHTML = markup;
    dataChannelReceive.appendChild(mainDiv);
}

function scrollToBottom() {
    dataChannelReceive.scrollTop = dataChannelReceive.scrollHeight;
}

