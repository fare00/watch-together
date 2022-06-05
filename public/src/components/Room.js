import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import Chat from './Chat';
import Player from './Player';
import { serverURL } from '../config/keys'

function Room() {
  const [videoInfo, setVideoInfo] = useState({});
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState('ERROR');
  const navigate = useNavigate();

  const params = useParams();

  useEffect(() => {
    fetch(serverURL+'/room/info/' + params.id)
      .then(resp => resp.json())
      .then(room => {
        setVideoInfo(room);
      })
      .catch(err => navigate('/error'));
  }, []);

  useEffect(() => {
    const s = io(serverURL, {
      extraHeaders: {
        id: params.id
      }
    });
    setSocket(s);

    s.emit('RENEW');
    const i = setInterval(() => s.emit('RENEW'), 1000 * 60 * 5);

    s.on('UPDATE', info => {
      setVideoInfo(info);
    });

    return () => {
      s.disconnect();
      clearInterval(i);
    };
  }, []);

  const updateRoom = url => {
    setError('ERROR');

    fetch(serverURL+'/room/update', {
      method: 'PUT',
      body: JSON.stringify({ url, id: params.id }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(resp => resp.json())
      .then(info => {
        if(info === 'Not Acceptable') return setError('Invalid Url');
        setVideoInfo(info);
        socket.emit('UPDATE', info);
      })
      .catch(err => setError('Invalid Url'));
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if(e.target.url.value === videoInfo.originalUrl) return setError("Url can't be the same")

    if (e.target.url.value.length > 0) {
      updateRoom(e.target.url.value);
    }
    else setError("Input can't be empty");
  }

  const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  return (
    <div id="room-content">
      <div className="top">
        <form onSubmit={handleSubmit}>
          <input type="text" name="url" placeholder="Video URL" defaultValue={videoInfo.originalUrl} />
          <button className="update-video">play_arrow</button>
          <button className="room-copy" type="button" onClick={() => copyToClipboard(window.location.href)}>Copy room url</button>
        </form>
        <div className="error-message" style={{ visibility: error === 'ERROR' ? 'hidden' : 'visible', display: error === 'ERROR' ? 'none' : 'block' }}>{error}</div>
      </div>
      <div className="bottom">
        <Player videoInfo={videoInfo} socket={socket} />
        <Chat socket={socket} />
      </div>
    </div>
  )
}

export default Room