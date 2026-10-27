const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// 유저 데이터 저장 (메모리 방식: { userCode: { username, password, socketId } })
const users = {};

// 6자리 고유 코드 생성 함수
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

io.on('connection', (socket) => {
    // 1. 회원가입
    socket.on('register', (data) => {
        const { username, password } = data;
        let myCode = generateCode();
        while (users[myCode]) {
            myCode = generateCode();
        }

        users[myCode] = { username, password, socketId: socket.id };
        socket.userCode = myCode;
        socket.username = username;

        socket.emit('registered', { username, myCode });
    });

    // 2. 로그인 (코드 + 비밀번호)
    socket.on('login', (data) => {
        const { code, password } = data;
        const targetUser = users[code];

        if (!targetUser) {
            socket.emit('error_msg', '존재하지 않는 고유 코드입니다.');
            return;
        }

        if (targetUser.password !== password) {
            socket.emit('error_msg', '비밀번호가 일치하지 않습니다.');
            return;
        }

        // 로그인 성공 시 정보 갱신
        targetUser.socketId = socket.id;
        socket.userCode = code;
        socket.username = targetUser.username;

        socket.emit('logged_in', { username: targetUser.username, myCode: code });
    });

    // 3. 친구 코드로 채팅 시작 요청
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

        const roomName = [socket.userCode, targetCode].sort().join('_');
        socket.join(roomName);
        
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

    // 4. 메시지 전송
    socket.on('send_message', (data) => {
        const { roomName, message } = data;
        io.to(roomName).emit('receive_message', {
            sender: socket.username,
            senderCode: socket.userCode,
            message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('disconnect', () => {
        // 소켓이 끊어져도 계정 데이터(users)는 유지됨
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`서버가 실행되었습니다: 포트 ${PORT}`);
});
