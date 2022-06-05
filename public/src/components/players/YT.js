import React, { useEffect, useState } from 'react'
import YouTube from 'react-youtube'

function YT({ videoId, onReady, onEnded, onTimeUpdate }) {
    const [player, setPlayer] = useState(null);

    const playerReady = ({target: p}) => {
        setPlayer(p);
        onReady({
            play: () => p.playVideo(),
            pause: () => p.pauseVideo(),
            setTime: (time) => p.seekTo(time),
            setMuted: (muted) => { if(muted) return p.mute(); p.unMute(); },
            setVolume: (volume) => p.setVolume(volume*100),
            isMuted: () => p.isMuted(),
            getVolume: () => p.getVolume(),
            getTime: () => p.getCurrentTime(),
            getDuration: () => p.getDuration(),
            isPaused: () => (p.getPlayerState() !== 1 ? true : false)
        });
    }

    useEffect(() => {
        const interval = setInterval(onTimeUpdate, 1000);
        return () => clearInterval(interval);
    }, [player]);

    return (
        <YouTube videoId={videoId} onReady={playerReady} className="video" opts={{playerVars: { controls: 0 }}} onEnd={onEnded} />
    )
}

export default YT