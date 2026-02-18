// API base - replace with your ngrok https URL when exposing the backend (e.g. https://abcd1234.ngrok.io)
const API_BASE = 'https://REPLACE_WITH_YOUR_NGROK_URL';

let messages = [];
let votedMessageId = null; // track by id now

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const statusMsg = document.getElementById('statusMsg');

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter key
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Fetch existing messages on load
fetchMessages();

async function sendMessage() {
    const text = messageInput.value.trim();

    if (!text) {
        showStatus('Enter a message', 'error');
        return;
    }

    messageInput.value = '';
    messageInput.focus();

    // Send to backend and refresh list
    const ok = await sendToAPI(text);
    if (ok) {
        await fetchMessages();
    }
}

async function sendToAPI(message) {
    try {
        showStatus('Sending...', 'sending');

        const response = await fetch(`${API_BASE}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: message })
        });

        if (response.ok) {
            showStatus('Message sent successfully!', 'success');
            setTimeout(() => hideStatus(), 3000);
            return true;
        } else {
            const err = await response.json().catch(() => ({}));
            console.error('Failed to send:', err);
            showStatus('Failed to send message', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Error sending message', 'error');
        return false;
    }
}

async function fetchMessages() {
    try {
        const res = await fetch(`${API_BASE}/messages`);
        if (res.ok) {
            const data = await res.json();
            // Normalize to local message shape (id, text, votes)
            messages = data.map(m => ({ id: m.id, text: m.text, votes: m.votes }));
            displayMessages();
        } else {
            showStatus('Failed to load messages', 'error');
        }
    } catch (err) {
        console.error(err);
        showStatus('Error loading messages', 'error');
    }
}

function displayMessages() {
    messagesContainer.innerHTML = '';

    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="empty-state">Ingen forslag enda, skriv noe!</div>';
        return;
    }

    messages.forEach((msgObj) => {
        const msgBox = document.createElement('div');
        msgBox.className = 'message-box';
        if (votedMessageId === msgObj.id) {
            msgBox.classList.add('voted');
        }

        const textSpan = document.createElement('span');
        textSpan.className = 'message-text';
        textSpan.textContent = msgObj.text;

        const upvoteBtn = document.createElement('button');
        upvoteBtn.className = 'upvote-btn';
        upvoteBtn.textContent = '👍 ' + msgObj.votes;
        upvoteBtn.addEventListener('click', () => upvoteMessage(msgObj.id));

        msgBox.appendChild(textSpan);
        msgBox.appendChild(upvoteBtn);
        messagesContainer.appendChild(msgBox);
    });
}

async function upvoteMessage(id) {
    if (votedMessageId !== null && votedMessageId !== id) {
        showStatus('Du kan bare stemme på en ting!', 'error');
        return;
    }

    if (votedMessageId === id) {
        showStatus('Du har allerede stemt på dette!', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/messages/${id}/upvote`, { method: 'POST' });
        if (res.ok) {
            const updated = await res.json();
            // Update local state
            const idx = messages.findIndex(m => m.id === updated.id);
            if (idx >= 0) messages[idx].votes = updated.votes;
            votedMessageId = id;
            displayMessages();
            showStatus('Stemmen din ble registrert!', 'success');
            setTimeout(() => hideStatus(), 2000);
        } else {
            showStatus('Failed to upvote', 'error');
        }
    } catch (err) {
        console.error(err);
        showStatus('Error while voting', 'error');
    }
}

function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = `status ${type}`;
}

function hideStatus() {
    statusMsg.className = 'status';
}
