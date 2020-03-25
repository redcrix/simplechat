const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const container = document.querySelector('#message-container')

console.log(username, conversation_id)

const socket = io("http://localhost:3001");

// Join Chatroom
socket.emit('joinRoom', {user_id, username, conversation_id})

// Message from server
socket.on('message',message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  container.scrollTop = container.scrollHeight
});


if (messageForm != null) {
  messageForm.addEventListener('submit', e => {
    e.preventDefault()

    // Get message text
    const msg = messageInput.value
    socket.emit('chatMessage', msg);
    messageInput.value = ''
  })
}

// Output message to DOM
function outputMessage(message){
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="">${message.username}<span> ${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('#message-container').appendChild(div);
}