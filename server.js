<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1대1 채팅</title>
    <style>
        :root {
            --primary: #6366f1;
            --primary-hover: #4f46e5;
            --bg-gradient: linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%);
            --card-bg: rgba(255, 255, 255, 0.96);
            --text-main: #1f2937;
            --text-sub: #4b5563;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-gradient);
            color: var(--text-main);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 16px;
            box-sizing: border-box;
        }

        .card {
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            padding: 24px;
            border-radius: 24px;
            box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 8px 15px -6px rgba(0, 0, 0, 0.05);
            width: 100%;
            max-width: 420px;
            transition: all 0.3s ease;
        }

        h2, h3 {
            margin-top: 0;
            color: var(--text-main);
            font-weight: 700;
            letter-spacing: -0.025em;
        }

        p {
            color: var(--text-sub);
            font-size: 0.92rem;
        }

        .hidden { display: none !important; }

        input {
            width: 100%;
            padding: 12px 16px;
            margin-top: 10px;
            background: #f9fafb;
            border: 1px solid #d1d5db;
            border-radius: 12px;
            box-sizing: border-box;
            font-size: 1rem;
            transition: all 0.2s;
        }

        input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
            background: #fff;
        }

        button {
            width: 100%;
            padding: 12px 16px;
            margin-top: 14px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
        }

        button:hover { background: var(--primary-hover); }
        button:active { transform: scale(0.98); }

        .link-btn {
            background: transparent;
            color: var(--primary);
            margin-top: 8px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        .link-btn:hover { background: rgba(99, 102, 241, 0.05); }

        .code-box {
            background: #eef2ff;
            color: var(--primary);
            padding: 14px;
            border-radius: 14px;
            text-align: center;
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: 3px;
            margin: 15px 0;
            border: 1px dashed #c7d2fe;
        }

        #chatBox {
            border: 1px solid #e5e7eb;
            height: 360px;
            overflow-y: auto;
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 14px;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .msg {
            max-width: 75%;
            padding: 10px 14px;
            border-radius: 16px;
            font-size: 0.95rem;
            line-height: 1.4;
            word-break: break-word;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }

        .msg img {
            max-width: 100%;
            max-height: 200px;
            border-radius: 10px;
            margin-top: 4px;
            display: block;
            cursor: pointer;
        }

        .file-msg {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(0,0,0,0.05);
            padding: 8px 12px;
            border-radius: 10px;
            text-decoration: none;
            color: inherit;
            font-size: 0.9rem;
            word-break: break-all;
        }
        .my-msg .file-msg { background: rgba(255,255,255,0.2); color: white; }

        .msg-container {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .my-msg-container { align-items: flex-end; }
        .other-msg-container { align-items: flex-start; }

        .my-msg {
            background: var(--primary);
            color: white;
            border-bottom-right-radius: 4px;
        }

        .other-msg {
            background: #ffffff;
            color: var(--text-main);
            border: 1px solid #e5e7eb;
            border-bottom-left-radius: 4px;
        }

        .msg-time {
            font-size: 0.7rem;
            color: #9ca3af;
            margin-top: 3px;
            padding: 0 4px;
        }

        hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 18px 0;
        }

        .chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .back-btn {
            background: #e5e7eb;
            color: #374151;
            width: auto;
            padding: 6px 12px;
            margin: 0;
            font-size: 0.82rem;
            border-radius: 8px;
        }
        .back-btn:hover { background: #d1d5db; }

        .recent-room-item {
            background: #ffffff;
            padding: 14px 16px;
            border-radius: 14px;
            cursor: pointer;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .recent-room-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.12);
            border-color: var(--primary);
        }

        .file-upload-label {
            background: #e0e7ff;
            color: var(--primary);
            padding: 10px 12px;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            transition: background 0.2s;
        }
        .file-upload-label:hover { background: #c7d2fe; }

        #imageModal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 1000;
            padding: 20px;
            box-sizing: border-box;
        }
        #modalImg {
            max-width: 90%;
            max-height: 75vh;
            border-radius: 12px;
            object-fit: contain;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .modal-btns {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            width: 100%;
            max-width: 300px;
        }
    </style>
</head>
<body>

<div class="card">
    <div id="stepLogin">
        <h2>로그인</h2>
        <p>고유 코드 또는 닉네임을 입력하세요.</p>
        <input type="text" id="loginIdentifierInput" placeholder="고유 코드 또는 닉네임">
        <input type="password" id="loginPwInput" placeholder="비밀번호">
        <button onclick="login()">로그인하기</button>
        <button class="link-btn" onclick="showRegister()">계정이 없으신가요? 회원가입</button>
    </div>

    <div id="stepRegister" class="hidden">
        <h2>회원가입</h2>
        <p>사용하실 닉네임과 비밀번호를 설정하세요.</p>
        <input type="text" id="regNameInput" placeholder="사용할 닉네임">
        <input type="password" id="regPwInput" placeholder="비밀번호 설정">
        <button onclick="register()">가입 완료하기</button>
        <button class="link-btn" onclick="showLogin()">계정이 있으신가요? 로그인</button>
    </div>

    <div id="stepLobby" class="hidden">
        <h3>환영합니다, <span id="myUser" style="color:var(--primary);"></span>님!</h3>
        <p>친구에게 공유할 나의 고유 코드입니다.</p>
        <div class="code-box" id="myCodeDisplay">------</div>
        <hr>
        <h3>채팅 연결하기</h3>
        <p>친구의 코드를 입력해 대화를 시작하세요.</p>
        <input type="text" id="targetCodeInput" placeholder="친구의 6자리 코드 입력" style="text-transform: uppercase;">
        <button onclick="startChat()">채팅방 들어가기</button>

        <hr>
        <h3>대화</h3>
        <div id="recentChatsList" style="max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-top: 8px; padding-right: 2px;">
            <p style="font-size: 0.85rem; color: #9ca3af; text-align: center; margin: 10px 0;">대화 기록이 없습니다.</p>
        </div>
    </div>

    <div id="stepChat" class="hidden">
        <div class="chat-header">
            <h3 id="chatPartner" style="margin:0; font-size:1.1rem;">채팅방</h3>
            <button class="back-btn" onclick="leaveChat()">나가기</button>
        </div>
        <div id="chatBox"></div>
        
        <div style="display: flex; gap: 8px; align-items: center;">
            <label class="file-upload-label" title="파일 및 사진 보내기">
                📎<input type="file" id="fileInput" style="display:none;" onchange="sendFile(this)">
            </label>
            <input type="text" id="msgInput" placeholder="메시지를 입력하세요..." onkeydown="if(event.key==='Enter') sendMsg()" style="margin-top:0; flex:1;">
            <button onclick="sendMsg()" style="width: 70px; margin-top:0;">전송</button>
        </div>
    </div>
</div>

<div id="imageModal" onclick="closeModal()">
    <img id="modalImg" src="" alt="확대 이미지">
    <div class="modal-btns" onclick="event.stopPropagation()">
        <a id="downloadBtn" download="chat_image.png" style="flex:1;"><button style="margin-top:0; background:#10b981;">저장하기</button></a>
        <button onclick="closeModal()" style="margin-top:0; background:#ef4444; flex:1;">닫기</button>
    </div>
</div>

<script src="/socket.io/socket.io.js"></script>
<script>
    const socket = io();
    let currentRoom = null;
    let myCode = '';
    let myUsername = '';
    let currentPartnerName = ''; // 현재 대화 중인 상대방 이름 저장

    function showRegister() {
        document.getElementById('stepLogin').classList.add('hidden');
        document.getElementById('stepRegister').classList.remove('hidden');
    }

    function showLogin() {
        document.getElementById('stepRegister').classList.add('hidden');
        document.getElementById('stepLogin').classList.remove('hidden');
    }

    function register() {
        const username = document.getElementById('regNameInput').value.trim();
        const password = document.getElementById('regPwInput').value.trim();
        if (!username || !password) {
            alert('닉네임과 비밀번호를 모두 입력해주세요.');
            return;
        }
        socket.emit('register', { username, password });
    }

    socket.on('registered', (data) => {
        alert(`회원가입 성공! 발급된 고유 코드는 [ ${data.myCode} ] 입니다.`);
        myCode = data.myCode;
        myUsername = data.username;
        enterLobby(data.username, data.myCode);
    });

    function login() {
        const identifier = document.getElementById('loginIdentifierInput').value.trim();
        const password = document.getElementById('loginPwInput').value.trim();
        if (!identifier || !password) {
            alert('고유 코드(또는 닉네임)와 비밀번호를 입력해주세요.');
            return;
        }
        socket.emit('login', { identifier, password });
    }

    socket.on('logged_in', (data) => {
        myCode = data.myCode;
        myUsername = data.username;
        enterLobby(data.username, data.myCode);
    });

    function enterLobby(username, code) {
        document.getElementById('stepLogin').classList.add('hidden');
        document.getElementById('stepRegister').classList.add('hidden');
        document.getElementById('stepLobby').classList.remove('hidden');

        document.getElementById('myUser').innerText = username;
        document.getElementById('myCodeDisplay').innerText = code;
        renderRecentRooms();
    }

    function startChat() {
        const targetCode = document.getElementById('targetCodeInput').value.trim().toUpperCase();
        if (!targetCode) {
            alert('친구의 코드를 입력해주세요.');
            return;
        }
        socket.emit('start_chat', targetCode);
    }

    socket.on('chat_started', (data) => {
        currentRoom = data.roomName;
        currentPartnerName = data.partnerName;
        document.getElementById('chatPartner').innerText = `${data.partnerName} 님과의 대화`;
        
        document.getElementById('stepLobby').classList.add('hidden');
        document.getElementById('stepChat').classList.remove('hidden');

        saveChatRoom(currentRoom, data.partnerName);
        loadChatHistory(currentRoom);
    });

    function saveChatRoom(roomName, partnerName) {
        try {
            let rooms = JSON.parse(localStorage.getItem('rooms_' + myCode)) || [];
            rooms = rooms.filter(r => r.roomName !== roomName);
            rooms.unshift({ roomName, partnerName });
            localStorage.setItem('rooms_' + myCode, JSON.stringify(rooms));
            renderRecentRooms();
        } catch (e) {
            console.error('대화 목록 저장 실패:', e);
        }
    }

    function renderRecentRooms() {
        const listDiv = document.getElementById('recentChatsList');
        listDiv.innerHTML = '';
        let rooms = JSON.parse(localStorage.getItem('rooms_' + myCode)) || [];

        if (rooms.length === 0) {
            listDiv.innerHTML = '<p style="font-size: 0.85rem; color: #9ca3af; text-align: center; margin: 10px 0;">대화 기록이 없습니다.</p>';
            return;
        }

        rooms.forEach(r => {
            let history = JSON.parse(localStorage.getItem('chat_' + r.roomName)) || [];
            let lastMsgObj = history[history.length - 1];
            let lastText = '대화 내용 없음';
            if (lastMsgObj) {
                if (lastMsgObj.type === 'image') lastText = '📷 사진을 보냈습니다.';
                else if (lastMsgObj.type === 'file') lastText = `📎 파일: ${lastMsgObj.fileName}`;
                else lastText = lastMsgObj.message;
            }

            const item = document.createElement('div');
            item.classList.add('recent-room-item');
            item.innerHTML = `
                <div style="font-weight: 600; color: var(--text-main); font-size: 0.98rem;">${r.partnerName} 님</div>
                <div style="font-size: 0.84rem; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${lastText}</div>
            `;
            item.onclick = () => openChatRoom(r.roomName, r.partnerName);
            listDiv.appendChild(item);
        });
    }

    function openChatRoom(roomName, partnerName) {
        currentRoom = roomName;
        currentPartnerName = partnerName;
        socket.emit('join_room', roomName);
        document.getElementById('chatPartner').innerText = `${partnerName} 님과의 대화`;
        document.getElementById('stepLobby').classList.add('hidden');
        document.getElementById('stepChat').classList.remove('hidden');
        loadChatHistory(roomName);
    }

    function sendMsg() {
        const input = document.getElementById('msgInput');
        const message = input.value.trim();
        if (message && currentRoom) {
            socket.emit('send_message', { roomName: currentRoom, message, type: 'text' });
            input.value = '';
        }
    }

    function sendFile(input) {
        const file = input.files[0];
        if (!file || !currentRoom) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = e.target.result;
            const isImage = file.type.startsWith('image/');
            socket.emit('send_message', { 
                roomName: currentRoom, 
                message: fileData, 
                type: isImage ? 'image' : 'file',
                fileName: file.name 
            });
        };
        reader.readAsDataURL(file);
        input.value = '';
    }

    socket.on('receive_message', (data) => {
        // 상대방이 보낸 거라면 상대 이름, 내가 보낸 거라면 현재 파트너 이름 사용
        const partnerName = (data.senderCode === myCode) ? currentPartnerName : data.sender;
        if (partnerName) {
            saveChatRoom(data.roomName, partnerName);
        }

        if (currentRoom === data.roomName) {
            appendMessage(data);
        }
        saveMessageToHistory(data.roomName, data);
        renderRecentRooms();
    });

    function appendMessage(data) {
        const box = document.getElementById('chatBox');
        
        const container = document.createElement('div');
        container.classList.add('msg-container');

        const msgDiv = document.createElement('div');
        msgDiv.classList.add('msg');

        const isMyMessage = (data.senderCode === myCode);
        if (isMyMessage) {
            container.classList.add('my-msg-container');
            msgDiv.classList.add('my-msg');
        } else {
            container.classList.add('other-msg-container');
            msgDiv.classList.add('other-msg');
            msgDiv.innerHTML = `<b style="font-size:0.8rem; display:block; margin-bottom:2px; color:var(--primary);">${data.sender}</b>`;
        }

        if (data.type === 'image') {
            const img = document.createElement('img');
            img.src = data.message;
            img.onclick = () => openModal(data.message);
            msgDiv.appendChild(img);
        } else if (data.type === 'file') {
            const fileLink = document.createElement('a');
            fileLink.href = data.message;
            fileLink.download = data.fileName || 'download';
            fileLink.className = 'file-msg';
            fileLink.innerHTML = `📄 <span>${data.fileName || '파일 다운로드'}</span>`;
            msgDiv.appendChild(fileLink);
        } else {
            msgDiv.appendChild(document.createTextNode(data.message));
        }

        const timeDiv = document.createElement('div');
        timeDiv.classList.add('msg-time');
        timeDiv.innerText = data.time || '';

        container.appendChild(msgDiv);
        container.appendChild(timeDiv);
        box.appendChild(container);
        
        box.scrollTop = box.scrollHeight;
    }

    function openModal(imgSrc) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImg');
        const downloadBtn = document.getElementById('downloadBtn');
        
        modalImg.src = imgSrc;
        downloadBtn.href = imgSrc;
        modal.style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('imageModal').style.display = 'none';
    }

    function saveMessageToHistory(roomName, data) {
        try {
            let history = JSON.parse(localStorage.getItem('chat_' + roomName)) || [];
            history.push(data);
            localStorage.setItem('chat_' + roomName, JSON.stringify(history));
        } catch (e) {
            console.error('메시지 저장 용량 초과:', e);
            alert('기기 저장 공간이 부족하여 파일/사진이 기록에 전부 저장되지 않을 수 있습니다.');
        }
    }

    function loadChatHistory(roomName) {
        const box = document.getElementById('chatBox');
        box.innerHTML = '';
        let history = JSON.parse(localStorage.getItem('chat_' + roomName)) || [];
        history.forEach(data => appendMessage(data));
    }

    function leaveChat() {
        currentRoom = null;
        currentPartnerName = '';
        document.getElementById('stepChat').classList.add('hidden');
        document.getElementById('stepLobby').classList.remove('hidden');
        renderRecentRooms();
    }

    socket.on('error_msg', (msg) => alert(msg));
</script>

</body>
</html>
