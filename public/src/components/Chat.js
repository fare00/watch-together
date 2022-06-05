import React, { useEffect, useRef, useState } from 'react'

function Chat({ socket }) {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [msgs, setMsgs] = useState([]);
    const msgContainer = useRef(null);

    useEffect(() => {
        socket?.on('MSG', (msg) => {
            setMsgs([...msgs, msg]);
        });
    }, [msgs, socket]);

    useEffect(() => { msgContainer.current.scrollTop = msgContainer.current.scrollHeight; }, [msgs]);

    const handleUsername = (e) => setUsername(e.target.value);
    const handleMessage = (e) => setMessage(e.target.value);
    const handleSendMessage = (e) => {
        setMessage('');
        e.preventDefault();
        let u = 'Anon#' + socket.id.slice(0, 4);
        if (!username) setUsername(u);
        socket.emit('MSG', { message, sender: username || u, id: socket.id });
    }

    return (
        <div className="chat-container">
            <div className="username">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" onChange={handleUsername} value={username || ''} />
            </div>
            <div className="messages" ref={msgContainer}>
                {msgs.map((msg, i) => (
                    <div className={"message" + (msg.id === socket.id ? ' own' : '')} key={i}>
                        <span>{msg.message}</span>
                        <span>{msg.sender}</span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage}>
                <input type="text" value={message || ''} onChange={handleMessage} />
                <button className='material-icons'>send</button>
            </form>
        </div>
    )
}

export default Chat