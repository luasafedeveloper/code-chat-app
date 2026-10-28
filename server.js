const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 사진 및 파일 전송 용량 제한을 100MB로 대폭 확장 (무제한에 가깝게 설정)
const io = new Server(server, {
    maxHttpBufferSize: 100 * 1024 * 1024 
});

app.use(express.static(path.join(__dirname, 'public')));

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
    socket.on('register', (data) => {
        const { username, password } = data;
        if (!username || !password) return;
        
        let myCode = generateCode();
        while (users[myCode]) {
            myCode = generateCode();
        }

        users[myCode] = { username, password, socketId: socket.id };
        socket.userCode = myCode;
        socket.username = username;

        socket.emit('registered', { username, myCode });
    });

    socket.on('login', (data) => {
        const { identifier, password } = data;
        if (!identifier || !password) return;

        let targetUser = null;
        let targetCode = null;

        if (users[identifier]) {
            targetUser = users[identifier];
            targetCode = identifier;
        } else {
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

    socket.on('join_room', (roomName) => {
        if (roomName) {
            socket.join(roomName);
        }
    });

    socket.on('send_message', (data) => {
        const { roomName, message, type, fileName } = data;
        if (!roomName) return;

        io.to(roomName).emit('receive_message', {
            roomName,
            sender: socket.username || '알 수 없음',
            senderCode: socket.userCode || '',
            message,
            type: type || 'text',
            fileName: fileName || '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`서버가 실행되었습니다: 포트 ${PORT}`);
});
