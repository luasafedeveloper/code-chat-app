const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// 유저 데이터 저장 ({ userCode: { username, password, socketId } })
const users = {};

function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

io.on('connection', (socket) => {
    // 회원가입
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

    // 로그인 (고유코드 또는 닉네임 지원)
    socket.on('login', (data) => {
        const { identifier, password } = data; // identifier는 코드 또는 닉네임
        let targetUser = null;
        let targetCode = null;

        // 1. 코드로 검색
        if (users[identifier]) {
            targetUser = users[identifier];
            targetCode = identifier;
        } else {
            // 2. 닉네임으로 검색
            for (let code in users) {
                if (users[code].username === identifier) {
                    targetUser = users[code];
                    targetCode = code;
                    break;
                }
            }
        }

        if (!targetUser) {
            socket.emit('error_msg', '존재하지 않는 코드 또는 닉네임입니다.');
            return;
        }

        if (targetUser.password !== password) {
            socket.emit('error_msg', '비밀번호가 일치하지 않습니다.');
            return;
        }

        targetUser.socketId = socket.id;
        socket.userCode = targetCode;
        socket.username = targetUser.username;

        socket.emit('logged_in', { username: targetUser.username, myCode: targetCode });
    });

    // 친구 코드로 채팅 시작
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
                partnerName: targetUser.username
            });
        }

        socket.emit('chat_started', {
            roomName,
            partnerName: targetUser.username
        });
    });

    // 메시지 전송
    socket.on('send_message', (data) => {
        const { roomName, message, type } = data;
        io.to(roomName).emit('receive_message', {
            sender: socket.username,
            senderCode: socket.userCode,
            message,
            type: type || 'text',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`서버가 실행되었습니다: 포트 ${PORT}`);
});
