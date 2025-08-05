import React, { useState, useEffect, useRef, useCallback } from 'react';

function App() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [volume, setVolume] = useState(0.1);
  const [timeSignature, setTimeSignature] = useState(4);
  
  const audioContextRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playClick = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    const frequency = beat === 0 ? 1000 : 600;
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
  }, [beat, volume]);

  const increaseBpm = () => {
    if (bpm < 200) setBpm(bpm + 1);
  };

  const decreaseBpm = () => {
    if (bpm > 40) setBpm(bpm - 1);
  };

  const toggleMetronome = async () => {
    if (!isPlaying) {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval = null;
    
    if (isPlaying) {
      const msPerBeat = 60000 / bpm;
      
      interval = setInterval(() => {
        setBeat(prevBeat => {
          const nextBeat = (prevBeat + 1) % timeSignature;
          return nextBeat;
        });
      }, msPerBeat);
    } else {
      clearInterval(interval);
      setBeat(0);
    }

    return () => clearInterval(interval);
  }, [isPlaying, bpm, timeSignature]);

  useEffect(() => {
    if (isPlaying) {
      playClick();
    }
  }, [beat, isPlaying, playClick]);

  // Calculate pendulum rotation based on beat
  const pendulumRotation = isPlaying ? (beat % 2 === 0 ? -15 : 15) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1D0C1F 0%, #73184E 100%)',
      color: '#F6F5F3',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      margin: 0
    }}>
      
      {/* Main Metronome Container */}
      <div style={{
        width: 'min(400px, 90vw)',
        height: 'min(700px, 90vh)',
        background: 'linear-gradient(180deg, #2E2E2E 0%, #1D0C1F 100%)',
        borderRadius: '200px 200px 60px 60px',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 2px 10px rgba(246,245,243,0.1)',
        border: '3px solid #73184E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '60px 40px'
      }}>

        {/* Volume Control */}
        <div style={{
          position: 'absolute',
          left: '25px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{
            fontSize: '16px',
            color: '#EA2E83',
            marginBottom: '15px',
            zIndex: 11
          }}>
            🔊
          </div>
          <input 
            type="range" 
            min="0" 
            max="0.3" 
            step="0.01"
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              width: '80px',
              accentColor: '#EA2E83',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              marginTop: '20px',
              zIndex: 9
            }}
          />
        </div>
        
        {/* Time Signature Selection */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <label style={{
            fontSize: '12px',
            color: '#F6F5F3',
            opacity: 0.8,
            letterSpacing: '1px'
          }}>
            TIME SIGNATURE
          </label>
          <select 
            value={timeSignature} 
            onChange={(e) => setTimeSignature(parseInt(e.target.value))}
            style={{
              padding: '8px 15px',
              borderRadius: '20px',
              border: '2px solid #EA2E83',
              backgroundColor: 'rgba(246,245,243,0.1)',
              color: '#F6F5F3',
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: '160px'
            }}
          >
            <option value={2} style={{color: 'black'}}>2/4 (March)</option>
            <option value={3} style={{color: 'black'}}>3/4 (Waltz)</option>
            <option value={4} style={{color: 'black'}}>4/4 (Common)</option>
            <option value={6} style={{color: 'black'}}>6/8 (Compound)</option>
          </select>
        </div>

        {/* Beat Indicators */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '12px'
          }}>
            {Array.from({length: timeSignature}, (_, index) => (
              <div
                key={index}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: beat === index ? '#EA2E83' : 'rgba(246,245,243,0.3)',
                  transition: 'all 0.1s',
                  boxShadow: beat === index ? '0 0 10px #EA2E83' : 'none'
                }}
              />
            ))}
          </div>
          <p style={{ 
            fontSize: '14px', 
            color: '#F6F5F3',
            opacity: 0.8,
            margin: 0,
            textAlign: 'center'
          }}>
            Beat {beat + 1} of {timeSignature}
          </p>
        </div>

        {/* Metronome Visual */}
        <div style={{
          position: 'relative',
          width: '180px',
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '140px',
            height: '190px',
            background: 'linear-gradient(145deg, #F6F5F3, #E8E8E8)',
            borderRadius: '70px 70px 15px 15px',
            position: 'relative',
            boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.15), 0 6px 20px rgba(0,0,0,0.3)',
            border: '2px solid rgba(46,46,46,0.2)'
          }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: '50%',
                top: `${30 + i * 18}px`,
                transform: 'translateX(-50%)',
                width: i % 2 === 0 ? '30px' : '20px',
                height: '2px',
                backgroundColor: '#2E2E2E',
                opacity: 0.6
              }} />
            ))}
            <div style={{
              position: 'absolute',
              left: '50%',
              bottom: '15px',
              width: '3px',
              height: '145px',
              backgroundColor: '#2E2E2E',
              transformOrigin: 'bottom center',
              transform: `translateX(-50%) rotate(${pendulumRotation}deg)`,
              transition: isPlaying ? 'transform 0.1s ease-in-out' : 'transform 0.3s ease-out',
              zIndex: 2
            }}>
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20px',
                height: '35px',
                backgroundColor: '#EA2E83',
                borderRadius: '10px',
                boxShadow: '0 3px 8px rgba(0,0,0,0.3)'
              }} />
            </div>
            <div style={{
              position: 'absolute',
              left: '50%',
              bottom: '15px',
              transform: 'translateX(-50%)',
              width: '8px',
              height: '8px',
              backgroundColor: '#2E2E2E',
              borderRadius: '50%',
              zIndex: 3
            }} />
          </div>
        </div>

        {/* Tempo Name */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <p style={{ 
            fontSize: '20px',
            color: '#EA2E83',
            fontStyle: 'italic',
            fontFamily: 'serif',
            margin: 0
          }}>
            {bpm < 60 ? 'Largo' : 
             bpm < 76 ? 'Adagio' : 
             bpm < 108 ? 'Andante' : 
             bpm < 120 ? 'Moderato' : 
             bpm < 168 ? 'Allegro' : 'Presto'}
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '15px'
          }}>
            <button 
              onClick={decreaseBpm}
              disabled={bpm <= 40}
              style={{ 
                padding: '12px',
                fontSize: '18px',
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                border: '2px solid #EA2E83',
                backgroundColor: 'transparent',
                color: '#EA2E83',
                cursor: bpm > 40 ? 'pointer' : 'not-allowed',
                opacity: bpm > 40 ? 1 : 0.5,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              −
            </button>
            <span style={{ 
              fontSize: '18px', 
              color: '#F6F5F3',
              fontWeight: 'bold',
              minWidth: '80px',
              textAlign: 'center'
            }}>
              BPM: {bpm}
            </span>
            <button 
              onClick={increaseBpm}
              disabled={bpm >= 200}
              style={{ 
                padding: '12px',
                fontSize: '18px',
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                border: '2px solid #EA2E83',
                backgroundColor: 'transparent',
                color: '#EA2E83',
                cursor: bpm < 200 ? 'pointer' : 'not-allowed',
                opacity: bpm < 200 ? 1 : 0.5,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
          </div>
        </div>
        
        {/* Start/Stop Button */}
        <button 
          onClick={toggleMetronome} 
          style={{ 
            padding: '15px 30px', 
            fontSize: '18px',
            backgroundColor: isPlaying ? '#EA2E83' : '#73184E',
            color: '#F6F5F3',
            border: 'none',
            borderRadius: '25px',
            minWidth: '120px',
            minHeight: '50px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }}
        >
          {isPlaying ? 'Stop' : 'Start'}
        </button>

        {/* Signature */}
        <p style={{
          fontSize: '16px',
          color: '#F6F5F3',
          opacity: 1,
          fontFamily: 'cursive',
          fontStyle: 'italic',
          margin: 0,
          marginTop: '20px'
        }}>
          Berk's Metronome
        </p>

      </div>
    </div>
  );
}

export default App;
