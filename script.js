let messages = [];

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

async function sendMessage() {
    const text = messageInput.value.trim();

    if (!text) {
        showStatus('Please enter a message', 'error');
        return;
    }

    // Add to local array
    messages.push(text);

    // Update UI
    displayMessages();
    messageInput.value = '';
    messageInput.focus();

    // Send to API
    await sendToAPI(text);
}

async function sendToAPI(message) {
    try {
        showStatus('Sending...', 'sending');

        // Replace with your actual API endpoint
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Message',
                body: message
            })
        });

        if (response.ok) {
            showStatus('Message sent successfully!', 'success');
            setTimeout(() => hideStatus(), 3000);
        } else {
            showStatus('Failed to send message', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Error sending message', 'error');
    }
}

function displayMessages() {
    messagesContainer.innerHTML = '';

    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="empty-state">No messages yet. Write something!</div>';
        return;
    }

    messages.forEach((msg, index) => {
        const msgBox = document.createElement('div');
        msgBox.className = 'message-box';
        msgBox.textContent = msg;
        messagesContainer.appendChild(msgBox);
    });
}

function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = `status ${type}`;
}

function hideStatus() {
    statusMsg.className = 'status';
}
