import React, { useEffect, useState } from 'react'
import Player from '@vimeo/player'

function VM({videoId, onReady, onEnded, onTimeUpdate}) {
    const [player, setPlayer] = useState(null);

    useEffect(() => {
        const p = new Player('vimeo', {
            id: videoId,
            autopause: false,
            controls: false,
            title: false,
            byline: false,
            portrait: false,
            background: false,
            responsive: true
        });
        p.ready().then(() => {
            onReady({
                play: () => p.play(),
                pause: () => p.pause(),
                setTime: (time) => p.setCurrentTime(time),
                setMuted: (muted) => p.setMuted(muted),
                setVolume: (volume) => p.setVolume(volume),
                isMuted: () => p.getMuted(),
                getVolume: () => p.getVolume(),
                getTime: () => p.getCurrentTime(),
                getDuration: () => p.getDuration(),
                isPaused: () => p.getPaused()
            });
            setPlayer(p);
        });

        return () => p.destroy();
    }, [videoId]);

    useEffect(() => {
        onTimeUpdate();
        player?.on('timeupdate', onTimeUpdate);
        player?.on('ended', onEnded);
        return () => {
            player?.off('timeupdate');
            player?.off('ended');
        }
    }, [player]);

    return (
        <div id='vimeo' className='video'></div>
    )
}

export default VM