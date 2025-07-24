import React from 'react';
import { useSpeech } from '../hooks/useSpeech';

export const SpeechDemo: React.FC = () => {
  const {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isLoading,
    error,
    updateSettings,
    availableVoices,
    currentSettings
  } = useSpeech();

  const handleSpeak = async () => {
    try {
      await speak('Hello world');
    } catch (err) {
      console.error('Speech failed:', err);
    }
  };

  const handleSettingsChange = () => {
    updateSettings({
      rate: 0.8,
      pitch: 1.2,
      volume: 0.9
    });
  };

  if (isLoading) {
    return <div>Loading speech engine...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Speech Synthesis Demo</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      <div className="space-x-2">
        <button
          onClick={handleSpeak}
          disabled={isSpeaking}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSpeaking ? 'Speaking...' : 'Speak "Hello world"'}
        </button>

        <button
          onClick={pause}
          disabled={!isSpeaking || isPaused}
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Pause
        </button>

        <button
          onClick={resume}
          disabled={!isPaused}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Resume
        </button>

        <button
          onClick={stop}
          disabled={!isSpeaking && !isPaused}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      <div>
        <button
          onClick={handleSettingsChange}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Update Settings (Rate: 0.8, Pitch: 1.2)
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Status:</h3>
        <p>Speaking: {isSpeaking ? 'Yes' : 'No'}</p>
        <p>Paused: {isPaused ? 'Yes' : 'No'}</p>
        <p>Available Voices: {availableVoices.length}</p>
        {currentSettings && (
          <div className="mt-2">
            <h4 className="font-semibold">Current Settings:</h4>
            <p>Rate: {currentSettings.rate}</p>
            <p>Pitch: {currentSettings.pitch}</p>
            <p>Volume: {currentSettings.volume}</p>
            <p>Voice: {currentSettings.voice || 'Default'}</p>
          </div>
        )}
      </div>
    </div>
  );
};