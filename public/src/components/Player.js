import React, { useEffect, useState, useRef } from 'react'
import VM from './players/VM';
import YT from './players/YT';

function Player({ videoInfo, socket }) {
  const [player, setPlayer] = useState(null);
  const videoContainer = useRef(null);
  const muteControl = useRef(null);
  const progress = useRef(null);
  const [volume, setVol] = useState(100);
  const [duration, setDur] = useState('0:00 / 0:00');
  const [fbStyle, setFbStyle] = useState(0);
  const [mouseDown, setMouseDown] = useState(false);
  const [fullScreen, setFS] = useState('fullscreen');
  const [playPause, setPP] = useState('play_arrow');
  const [showControls, setShowControls] = useState('flex');

  let iframe;

  const playerReady = (p) => {
    setPlayer(p);
    setPP('play_arrow');
  }

  const mousePressed = () => setMouseDown(false);

  useEffect(() => {
    document.addEventListener('mouseup', mousePressed);

    let timeout;
    const mouseMove = () => {
      clearTimeout(timeout);
      setShowControls('flex');
      timeout = setTimeout(async () => {
        setShowControls('none');
      }, 5000);
    };
    const mouseEnter = () => setShowControls('flex');

    videoContainer.current.addEventListener('mousemove', mouseMove);
    videoContainer.current.addEventListener('mouseenter', mouseEnter);
    return () => {
      document.removeEventListener('mouseup', mousePressed);
      videoContainer.current?.removeEventListener('mousemove', mouseMove);
      videoContainer.current?.removeEventListener('mouseenter', mouseEnter);
      clearTimeout(timeout);
    }
  }, []);

  const seeking = async e => {
    const seekTime = (e.nativeEvent.offsetX / progress.current.offsetWidth) * await player.getDuration();
    player.setTime(seekTime);
    socket.emit('SEEK', seekTime);
    handleTimeUpdate();
  }

  const handlePlayPause = async e => {
    if (await player.isPaused()) {
      player.play();
      setPP('pause');
      socket.emit('PLAY');
    } else {
      player.pause();
      setPP('play_arrow');
      socket.emit('PAUSE');
    }
  }

  const handleVolume = e => {
    const vol = e.target.value / 100;
    setVol(e.target.value);
    const mc = muteControl.current;
    player.setVolume(vol);
    if (vol === 0) {
      player.setMuted(true);
      mc.innerText = 'volume_off';
    } else {
      player.setMuted(false);
      if (vol <= 0.5) mc.innerText = 'volume_down';
      else mc.innerText = 'volume_up';
    }
  }

  const handleMute = async e => {
    const mc = muteControl.current;
    if (await player.isMuted()) {
      if (await player.getVolume() === 0) {
        player.setMuted(false);
        player.setVolume(0.5);
        setVol(50);
      } else {
        player.setMuted(false);
      }
      if (await player.getVolume() <= 0.5) mc.innerText = 'volume_down';
      else mc.innerText = 'volume_up';
    } else {
      player.setMuted(true);
      mc.innerText = 'volume_off';
    }
  }

  const openFullScreen = () => {
    const vc = videoContainer.current;
    if (vc.requestFullscreen) {
      vc.requestFullscreen();
    } else if (vc.mozRequestFullScreen) {
      vc.mozRequestFullScreen();
    } else if (vc.webkitRequestFullscreen) {
      vc.webkitRequestFullscreen();
    } else if (vc.msRequestFullscreen) {
      vc.msRequestFullscreen();
    }
  }

  const closeFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  const handleFullscreen = () => {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
      closeFullScreen();
      setFS('fullscreen');
    } else {
      openFullScreen();
      setFS('fullscreen_exit');
    }
  }

  const handleTimeUpdate = async () => {
    if (!player) return;
    const cmin = Math.floor(await player.getTime() / 60);
    const csec = Math.floor(await player.getTime() % 60) < 10 ? '0' + Math.floor(await player.getTime() % 60) : Math.floor(await player.getTime() % 60);
    const dmin = Math.floor(await player.getDuration() / 60);
    const dsec = Math.floor(await player.getDuration() % 60) < 10 ? '0' + Math.floor(await player.getDuration() % 60) : Math.floor(await player.getDuration() % 60);
    setDur(`${cmin}:${csec} / ${dmin}:${dsec}`);
    setFbStyle((1 / await player.getDuration()) / (1 / await player.getTime()));
  }

  const handleEnded = () => setPP('replay');

  useEffect(() => {
    const playEvent = () => {
      if(!player) return;
      player.play();
      setPP('pause');
    }

    const pauseEvent = () => {
      if(!player) return;
      player.pause();
      setPP('play_arrow');
    }

    const seekEvent = time => {
      player?.setTime(time);
    }

    socket?.on('PLAY', playEvent);
    socket?.on('PAUSE', pauseEvent);
    socket?.on('SEEK', seekEvent);

    return () => {
      socket?.off('PLAY', playEvent);
      socket?.off('PAUSE', pauseEvent);
      socket?.off('SEEK', seekEvent);
    }
  }, [socket, player]);

  if (videoInfo.key === 'yt') {
    iframe = <YT videoId={videoInfo.url} onReady={playerReady} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} />
  } else if (videoInfo.key === 'vm') {
    iframe = <VM videoId={videoInfo.url} onReady={playerReady} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} />
  }

  return (
    <div className='player' ref={videoContainer}>
      {iframe}
      <div className="player-overlay" style={showControls === 'flex' ? {background: "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 30%)"} : {}}>
        <div className="video-controls" style={{display: showControls}}>
          <div className="progress-bar"
            ref={progress}
            onClick={seeking}
            onMouseMove={e => mouseDown && seeking(e)}
            onMouseDown={() => setMouseDown(true)}
          >
            <div className="filled-bar" style={{ flex: fbStyle || 0 }}></div>
            <div className="bar-thumb"></div>
          </div>
          <div className="controls">
            <div className="left-side">
              <div className="play-control" onClick={handlePlayPause}>{playPause}</div>
              <div className="sound-control">
                <div className="mute-control" ref={muteControl} onClick={handleMute}>volume_up</div>
                <input type="range" className="volume-control" min="0" max="100" value={volume} onChange={handleVolume} />
              </div>
              <div className="duration">{duration}</div>
            </div>
            <div className="right-side">
              <div className="fullscreen-control" onClick={handleFullscreen}>{fullScreen}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Player