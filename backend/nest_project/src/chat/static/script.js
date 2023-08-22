// socket.io 인스턴스 생성
const socket = io('localhost:3000/chat'); //네임스페이스 추가
const roomSocket = io('localhost:3000/room');
const privateSocket = io('localhost:3000/private');
let currentRoom = ''; //현재 들어있는 채팅방

const nickname = prompt("닉네임을 입력해주세요 : ");

//전송 버튼 클릭시 발생 이벤트 -> 클라이언트에서 서버에 메시지 전송
function sendMessage() {
    // if (currentRoom === '')
    // {
    //     alert("채팅방에 먼저 입장해주세요");
    //     return ; //대기실을 남겨둬도 괜찮겠다.
    // }
    const message = $('#message').val();
    $('#chat').append(`<div> 나 : ${message}</div>`); //내가 보낸 메세지 바로 추가
    roomSocket.emit('localhost:80/message', { message, nickname, room: currentRoom });
    // roomSocket.emit('message', { message, nickname, room: currentRoom });
    // return false; 
}


//서버 접속을 확인하는 이벤트
socket.on('connect', () => {
    console.log('connected');
    socket.emit('connectNewUser', {});
});

//서버에서 message 이벤트 발생 시 처리
// socket.on('message', (message) => {
//     $('#chat').append(`<div>${message}</div>`);
// });

//방에서 대화나누기
roomSocket.on('message', (data) => {
        $('#chat').append(`<div>${data.message}</div>`);
    });

// 방 생성하기 기능에 따른 추가 함수들
function createNewRoom() {
    const room = prompt("생성할 방의 이름을 입력해 주세요. ");
     //이제 막 들어온 새 유저에게도 기존의 채팅방을 보여주고 싶어서 이벤트를 호출. 그러나 동작하진 않는다. why?
    roomSocket.emit('events', {room, nickname});
    // roomSocket.emit('createRoom', {room, nickname});
}

roomSocket.on('rooms', (data) => {
    console.log(data);
    $('#rooms').empty(); //채팅방 갱신 시 일단 리스트를 비움
    data.forEach( (room) => { //루프를 돌면서 서버에서 준 데이터 추가
        $('#rooms').append(`<li>${room} <button onclick="joinRoom('${room}')">join</button></li>`);
    });
});

//chat네임스페이스에서 발생(socket)하는 'notice' 이벤트 처리 함수
socket.on('notice', (data) => {
    $('#notice').append(`<div>${data.message}</div>`);
});

//방 입장하기 이벤트 생성 함수
function joinRoom(room){
    roomSocket.emit('joinRoom', {room, nickname, toLeveRoom: currentRoom });
    $('#chat').html(''); //채팅방 이동 시 기존 메시지 삭제
    currentRoom = room; //현재 방의 정보를 변경
}

//----------------------혼자 만들어 본것들 --------

//귓속말하기 버튼 이벤트 생성 함수
// function 

// privateSocket.on('message', (data)=> {
//     $('#chat').append(`<div>${data.message}</div>`);
// })
