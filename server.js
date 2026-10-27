const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// 접속자 및 고유 코드 데이터 저장 (메모리 방식)
const users = {}; // { userCode: { username, socketId } }

// 6자리 고유 코드 생성 함수 (예: A1B2C3)
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

io.on('connection', (socket) => {
    // 1. 회원가입/로그인 (코드 발급)
    socket.on('register', (username) => {
        let myCode = generateCode();
        while (users[myCode]) { // 중복 방지
            myCode = generateCode();
        }

        users[myCode] = { username, socketId: socket.id };
        socket.userCode = myCode;
        socket.username = username;

        socket.emit('registered', { username, myCode });
    });

    // 2. 친구 코드로 채팅 시작 요청
    socket.on('start_chat', (targetCode) => {
        const targetUser = users[targetCode];

        if (!targetUser) {
            socket.emit('error_msg', '존재하지 않는 코드입니다.');
            return;
        }

        if (targetCode === socket.userCode) {
            socket.emit('error_msg', '자기 자신의 코드는 입력할 수 없습니다.');
            return;
        }

        // 두 유저의 코드를 정렬하여 고유한 방 이름 생성
        const roomName = [socket.userCode, targetCode].sort().join('_');
        
        socket.join(roomName);
        
        // 상대방 소켓도 해당 방에 입장시킴
        const targetSocket = io.sockets.sockets.get(targetUser.socketId);
        if (targetSocket) {
            targetSocket.join(roomName);
            targetSocket.emit('chat_started', {
                roomName,
                partnerName: socket.username
            });
        }

        socket.emit('chat_started', {
            roomName,
            partnerName: targetUser.username
        });
    });

    // 3. 메시지 전송
    socket.on('send_message', (data) => {
        const { roomName, message } = data;
        io.to(roomName).emit('receive_message', {
            sender: socket.username,
            senderCode: socket.userCode,
            message
        });
    });

    // 접속 해제 시 데이터 정리
    socket.on('disconnect', () => {
        if (socket.userCode) {
            delete users[socket.userCode];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`서버가 실행되었습니다: 포트 ${PORT}`);
});
