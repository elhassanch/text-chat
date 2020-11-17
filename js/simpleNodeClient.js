var nameRoom=document.getElementById("nameRoom");
var input = document.getElementById("channelInput");
var inputUser = document.getElementById("usernameInput");
var channelButton = document.getElementById("channelButton");

var dataChannelSend=document.getElementById("dataChannelSend");
var dataChannelReceive=document.getElementById("dataChannelReceive");
var sendButton = document.getElementById("sendButton");

var channel;
var username;
var x=0;

sendButton.disabled = false;
dataChannelSend.disabled = false;
var socket = io.connect('https://src-app.herokuapp.com');


sendButton.onclick = sendData;
channelButton.onclick=getChannel;

// BUTTON LISTENER ============================================================
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
            appendInfo("<marquee behavior='scroll' direction='left' style='color:red'>Sending 'Bye' to server</marquee>");
            scrollToBottom();
            console.log('Sending "Bye" to server');
            socket.emit('Bye', channel);
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


// SOCKET EVENT CALLBACKS =====================================================
socket.on('created', function (channel){
    console.log('channel ' + channel + ' has been created!');
    console.log('This peer is the initiator...');
    
    appendInfo("Channel "+ channel + " has been created!");
    scrollToBottom();
    appendInfo("You are the initiator!");
    scrollToBottom();
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
    console.log('Broadcast message from server: ' + msg);
    
    appendInfo(msg);
    scrollToBottom();
});

socket.on('full', function (channel){
    console.log('channel ' + channel + ' is too crowded! \ Cannot allow you to enter, sorry :-(');
    
    appendInfo('channel ' + channel + ' is too crowded! \ Cannot allow you to enter, sorry :-(');
    scrollToBottom();
});

socket.on('message', function (message){   
    console.log('Got message from other peer: ' + message);
    
    appendMessage(message, 'incoming');
    scrollToBottom();
});

socket.on('response', function (response){
    console.log('Got response from other peer: ' + response);
    
    appendMessage(response, 'incoming');
    scrollToBottom();
    
});

socket.on('Bye', function (){
    console.log('Got "Bye" from other peer! Going to disconnect...');
    appendInfo("<marquee behavior='scroll' direction='left' style='color:red'>Got 'Bye' from the other peer</marquee>");
    scrollToBottom();
    appendInfo("<p style='color:red'>Sending 'Ack' to server</p>");
    scrollToBottom();
    console.log('Sending "Ack" to server');
    socket.emit('Ack');
    appendInfo("<p style='color:red'>Going to disconnect...</</p>");
    scrollToBottom();
    console.log('Going to disconnect...');
    socket.disconnect();
    sendButton.disabled = true;
    dataChannelSend.disabled = true;
 });

socket.on('log', function (array){
    console.log.apply(console, array);
});

// FUNCTIONS ==================================================================
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

