import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { serverURL } from '../config/keys'

function Home() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!e.target.url.value) return setError("Input can't be empty");
      
    const config = {
      method: 'POST',
      body: JSON.stringify({url: e.target.url.value}),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const romID = await (await fetch(serverURL+'/room/create', config)).text();

    if(romID.length !== 24 && romID.includes(' ')) return setError('Invalid Url');
    
    navigate('/room/'+romID);
  }

  return (
    <main id="home-content">
      <h1><span>Watch</span> videos together</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="url" autoComplete="off" placeholder="Video URL" />
        <button>play_arrow</button>
      </form>
      <div className="error-message" style={{ visibility: error === '' ? 'hidden' : 'visible' }}>{error}</div>
    </main>
  )
}

export default Home