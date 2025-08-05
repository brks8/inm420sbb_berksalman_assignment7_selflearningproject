import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [volume, setVolume] = useState(0.1);
  const [timeSignature, setTimeSignature] = useState(4); // Number of beats per measure
  
  // useRef to hold the audio context
  const audioContextRef = useRef(null);

  // Initialize audio context when component first loads
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    // Cleanup when component is destroyed
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []); // Empty array means "run once when component mounts"

  // Function to create and play a click sound
  const playClick = () => {
    if (!audioContextRef.current) return;
    
    // Create an oscillator (sound generator)
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    // Connect oscillator to gain (volume control) to speakers
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    // Different frequency for beat 1 vs other beats
    const frequency = beat === 0 ? 1000 : 600; // Higher pitch for first beat
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'square'; // Square wave sounds more like a click
    
    // Use the volume state instead of hardcoded 0.1
    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
    
    // Start and stop the sound
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.1); // Stop after 0.1 seconds
  };

  const increaseBpm = () => {
    setBpm(bpm + 1);
  };

  const decreaseBpm = () => {
    setBpm(bpm - 1);
  };

  const toggleMetronome = async () => {
    if (!isPlaying) {
      // Modern browsers require user interaction before playing audio
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
          const nextBeat = (prevBeat + 1) % timeSignature; // Use timeSignature instead of hardcoded 4
          return nextBeat;
        });
      }, msPerBeat);
    } else {
      clearInterval(interval);
      setBeat(0);
    }

    return () => clearInterval(interval);
  }, [isPlaying, bpm, timeSignature]); // Add timeSignature to dependencies

  // Separate useEffect to play sound when beat changes
  useEffect(() => {
    if (isPlaying) {
      playClick();
    }
  }, [beat, isPlaying]);

  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(24px, 5vw, 48px)', margin: '20px 0' }}>My Metronome</h1>
      
      {/* Time Signature Selection */}
      <div style={{ margin: '20px 0' }}>
        <label style={{ fontSize: 'clamp(14px, 3vw, 18px)' }}>Time Signature: </label>
        <select 
          value={timeSignature} 
          onChange={(e) => setTimeSignature(parseInt(e.target.value))}
          style={{ 
            margin: '0 10px', 
            padding: '8px', 
            fontSize: 'clamp(14px, 3vw, 16px)',
            minWidth: '120px'
          }}
        >
          <option value={2}>2/4 (March)</option>
          <option value={3}>3/4 (Waltz)</option>
          <option value={4}>4/4 (Common)</option>
          <option value={6}>6/8 (Compound)</option>
        </select>
      </div>

      {/* Beat indicator dots - now dynamic based on time signature */}
      <div style={{ margin: '20px 0' }}>
        {Array.from({length: timeSignature}, (_, index) => (
          <span
            key={index}
            style={{
              display: 'inline-block',
              width: 'clamp(16px, 4vw, 24px)',
              height: 'clamp(16px, 4vw, 24px)',
              borderRadius: '50%',
              backgroundColor: beat === index ? 'red' : 'lightgray',
              margin: 'clamp(3px, 1vw, 8px)',
              transition: 'all 0.1s'
            }}
          />
        ))}
        <p style={{ 
          fontSize: 'clamp(12px, 2.5vw, 16px)', 
          color: '#666', 
          margin: '10px 0 0 0' 
        }}>
          Beat {beat + 1} of {timeSignature}
        </p>
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <p style={{ fontSize: 'clamp(18px, 4vw, 24px)', margin: '10px 0' }}>BPM: {bpm}</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={decreaseBpm} 
            style={{ 
              margin: '5px', 
              padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
              fontSize: 'clamp(16px, 3vw, 20px)',
              minWidth: '44px',
              minHeight: '44px'
            }}
          >
            -
          </button>
          <span style={{ 
            fontSize: 'clamp(14px, 3vw, 16px)', 
            padding: '0 10px',
            whiteSpace: 'nowrap'
          }}>
            40 ← → 200
          </span>
          <button 
            onClick={increaseBpm} 
            style={{ 
              margin: '5px', 
              padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
              fontSize: 'clamp(16px, 3vw, 20px)',
              minWidth: '44px',
              minHeight: '44px'
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Volume Control */}
      <div style={{ margin: '20px 0' }}>
        <label style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>Volume: </label>
        <input 
          type="range" 
          min="0" 
          max="0.3" 
          step="0.01"
          value={volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{ 
            width: 'clamp(120px, 30vw, 200px)',
            margin: '0 10px'
          }}
        />
        <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
          {Math.round(volume * 100)}%
        </span>
      </div>
      
      <button 
        onClick={toggleMetronome} 
        style={{ 
          padding: 'clamp(12px, 3vw, 18px) clamp(20px, 5vw, 35px)', 
          fontSize: 'clamp(16px, 4vw, 20px)',
          backgroundColor: isPlaying ? 'red' : 'green',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          minWidth: '120px',
          minHeight: '50px',
          cursor: 'pointer'
        }}
      >
        {isPlaying ? 'Stop' : 'Start'}
      </button>
      
      {isPlaying && (
        <p style={{ 
          marginTop: '15px',
          fontSize: 'clamp(14px, 3vw, 18px)',
          color: 'green'
        }}>
          ♪ Playing with sound!
        </p>
      )}
    </div>
  );
}

export default App;