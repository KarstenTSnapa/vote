let messages = [];
let votedMessageIndex = null;

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
        showStatus('Enter a message', 'error');
        return;
    }

    // Add to local array with vote count
    messages.push({ text: text, votes: 0 });

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
        messagesContainer.innerHTML = '<div class="empty-state">Ingen forslag enda, skriv noe!</div>';
        return;
    }

    messages.forEach((msgObj, index) => {
        const msgBox = document.createElement('div');
        msgBox.className = 'message-box';
        if (votedMessageIndex === index) {
            msgBox.classList.add('voted');
        }
        msgBox.style.cursor = 'pointer';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'message-text';
        textSpan.textContent = msgObj.text;
        
        const voteCount = document.createElement('span');
        voteCount.className = 'vote-count';
        voteCount.textContent = '👍 ' + msgObj.votes;
        
        msgBox.appendChild(textSpan);
        msgBox.appendChild(voteCount);
        
        msgBox.addEventListener('click', () => upvoteMessage(index));
        messagesContainer.appendChild(msgBox);
    });
}

function upvoteMessage(index) {
    if (votedMessageIndex !== null && votedMessageIndex !== index) {
        showStatus('Du kan bare stemme på en ting!', 'error');
        return;
    }
    
    if (votedMessageIndex === index) {
        showStatus('Du har allerede stemt på dette!', 'error');
        return;
    }
    
    messages[index].votes++;
    votedMessageIndex = index;
    displayMessages();
    showStatus('Stemmen din ble registrert!', 'success');
    setTimeout(() => hideStatus(), 2000);
}

function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = `status ${type}`;
}

function hideStatus() {
    statusMsg.className = 'status';
}
