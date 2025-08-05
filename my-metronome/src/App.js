import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0); // New state for visual beat

  const increaseBpm = () => {
    setBpm(bpm + 1);
  };

  const decreaseBpm = () => {
    setBpm(bpm - 1);
  };

  const toggleMetronome = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval = null;
    
    if (isPlaying) {
      const msPerBeat = 60000 / bpm;
      
      interval = setInterval(() => {
        console.log('Tick!');
        setBeat(prevBeat => (prevBeat + 1) % 4); // Cycle: 0,1,2,3,0,1,2,3...
      }, msPerBeat);
    } else {
      clearInterval(interval);
      setBeat(0); // Reset to first beat when stopped
    }

    return () => clearInterval(interval);
  }, [isPlaying, bpm]);

  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center' }}>
      <h1>My Metronome</h1>
      
      {/* Beat indicator dots */}
      <div style={{ margin: '20px' }}>
        {[0, 1, 2, 3].map(index => (
          <span
            key={index}
            style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: beat === index ? 'red' : 'lightgray',
              margin: '5px',
              transition: 'all 0.1s'
            }}
          />
        ))}
      </div>
      
      <div style={{ margin: '20px' }}>
        <p style={{ fontSize: '24px' }}>BPM: {bpm}</p>
        
        <div>
          <button onClick={decreaseBpm} style={{ margin: '5px', padding: '10px' }}>
            -
          </button>
          <button onClick={increaseBpm} style={{ margin: '5px', padding: '10px' }}>
            +
          </button>
        </div>
      </div>
      
      <button 
        onClick={toggleMetronome} 
        style={{ 
          padding: '15px 30px', 
          fontSize: '18px',
          backgroundColor: isPlaying ? 'red' : 'green',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        {isPlaying ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}

export default App;