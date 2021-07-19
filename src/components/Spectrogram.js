// import SpectrogramPattern from './SpectrogramPattern';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Unit8Array from 'typedarray';

const Spectrogram = () => {
  const [play, setPlay] = useState(false);
  // using width and height as normal variable afterwards can converts them to state variables
  const width = 1200;
  const height = 900;
  const canvasElement = useRef(null);
  const audioElement = useRef(null);

  let audioSource = null;
  // let audioContext = null;
  // let analyser = null;
  // let canvasContext = null;
  // let imgData = null;
  // let audioDataArray = null;
  // let audioDataArrayLength = null;
  // let timeAxisSpectrogram = null;
  // let freqAxisSpectrogram = null;

  // draw function
  const draw = useCallback(canvasContext => {
    try {
      // intialize audioContext
      let audioContext = new (window.AudioContext ||
        window.webkitAudioContext ||
        window.mozAudioContext)();

      // initialize audioSource
      let audioSource = audioContext.createMediaElementSource(
        audioElement.current
      );

      // intialize analyser
      let analyser = audioContext.createAnalyser();

      // fftsize
      analyser.fftSize = 4096;

      // connect source to analyser
      audioSource.connect(analyser);

      // set canvasContext background and call fillrect
      canvasContext.fillStyle = 'hsl(280, 100%, 10%)';
      canvasContext.fillRect(0, 0, width, height);

      // Array of audio data
      let audioDataArray = new Unit8Array(analyser.frequencyBinCount);
      // console.log(audioDataArray);

      // length of data
      let audioDataArrayLength = audioDataArray.length;

      // time axis of spectrogram
      let timeAxisSpectrogram = height / audioDataArrayLength;

      // frequency axis of spectrogram
      let freqAxisSpectrogram = width - 1;

      // getting image data of just one previous frame
      let imgData = canvasContext.getImageData(1, 0, width - 1, height);

      canvasContext.fillRect(0, 0, width, height);

      // put image at (0, 0) coordinate
      canvasContext.putImageData(imgData, 0, 0);

      // getByteFrequencyData copies audioData to the Unit8Array
      analyser.getByteFrequencyData(audioDataArray);

      // going the audio array
      for (let i = 0; i < audioDataArrayLength; i++) {
        let rat = audioDataArray[i] / 255; // this represents the loudness
        let hue = Math.round(rat * 120 + (280 % 360));
        let sat = '100%';
        let lit = 10 + 70 * rat + '%';

        // to draw the actual frequency graph
        canvasContext.beginPath();
        canvasContext.strokeStyle = `hsl(${hue}, ${sat}, ${lit})`;
        canvasContext.moveTo(
          freqAxisSpectrogram,
          height - i * timeAxisSpectrogram
        );
        canvasContext.lineTo(
          freqAxisSpectrogram,
          height - (i * timeAxisSpectrogram + timeAxisSpectrogram)
        );
        canvasContext.stroke();
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  function handlePlay() {
    setPlay(true);
    audioElement.current.play();
    console.log(play);
  }

  function handlePause() {
    setPlay(false);
    audioElement.current.pause();
    console.log(play);
  }

  useEffect(() => {
    let animationFrameId;
    try {
      // canvas element
      const canvasObj = canvasElement.current;

      // intialize canvasContext
      const canvasContext = canvasObj.getContext('2d');

      // invoking draw
      draw(canvasContext);

      const render = () => {
        draw(canvasContext);
        animationFrameId = window.requestAnimationFrame(render);
      };
      render();
    } catch (error) {
      console.log(error);
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);
  // if anything inside the draw function changes we need to call the draw function

  return (
    <div className='spectrogram-container'>
      <h1>Spectrogram</h1>
      <div className='spectrogram'>
        <canvas
          ref={canvasElement}
          className='canvas-element'
          width={width}
          height={height}
        ></canvas>
        <audio
          ref={audioElement}
          src={process.env.PUBLIC_URL + '/sounds/baby.mp3'}
        ></audio>
        <button onClick={handlePlay} className='btn-play'>
          Play
        </button>
        <button onClick={handlePause} className='btn-pause'>
          Pause
        </button>
      </div>
    </div>
  );
};

export default Spectrogram;
