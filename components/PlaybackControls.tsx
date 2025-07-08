
import React from 'react';
import { PlayIcon, PauseIcon, StopIcon, DownloadIcon } from './icons';

interface PlaybackControlsProps {
    voices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    onExport: () => void;
    isPlaying: boolean;
    isPaused: boolean;
    isExporting: boolean;
    disabled: boolean;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
    voices,
    selectedVoice,
    onVoiceChange,
    onPlay,
    onPause,
    onStop,
    onExport,
    isPlaying,
    isPaused,
    isExporting,
    disabled
}) => {
    const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const voiceURI = event.target.value;
        const voice = voices.find(v => v.voiceURI === voiceURI) || null;
        onVoiceChange(voice);
    };

    const commonButtonDisabled = disabled || isExporting;

    return (
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg">
            <label className="block text-lg font-semibold text-green-400 mb-4">3. Reproduce o Exporta tu Voz en Off</label>
            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor="voice-select" className="sr-only">Voz del Narrador</label>
                    <select
                        id="voice-select"
                        value={selectedVoice?.voiceURI || ''}
                        onChange={handleVoiceChange}
                        disabled={commonButtonDisabled || voices.length === 0}
                        className="w-full bg-slate-900 border border-slate-600 rounded-md py-3 px-4 focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-200 disabled:bg-slate-700 disabled:cursor-not-allowed"
                    >
                        {voices.length > 0 ? (
                            voices.map(voice => (
                                <option key={voice.voiceURI} value={voice.voiceURI}>
                                    {voice.name} ({voice.lang})
                                </option>
                            ))
                        ) : (
                            <option>Cargando voces...</option>
                        )}
                    </select>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <button
                        onClick={onPlay}
                        disabled={commonButtonDisabled || isPlaying}
                        className="p-3 bg-green-600 text-white rounded-full hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 disabled:scale-100"
                        aria-label={isPlaying ? 'Reproduciendo' : 'Reproducir'}
                    >
                        <PlayIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={onPause}
                        disabled={commonButtonDisabled || !isPlaying}
                        className="p-3 bg-yellow-600 text-white rounded-full hover:bg-yellow-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 disabled:scale-100"
                        aria-label="Pausar"
                    >
                        <PauseIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={onStop}
                        disabled={commonButtonDisabled || (!isPlaying && !isPaused)}
                        className="p-3 bg-red-600 text-white rounded-full hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 disabled:scale-100"
                        aria-label="Detener"
                    >
                        <StopIcon className="w-6 h-6" />
                    </button>
                    <div className="w-px h-8 bg-slate-600 mx-2 hidden sm:block"></div>
                    <button
                        onClick={onExport}
                        disabled={commonButtonDisabled || isPlaying || isPaused}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                        aria-label="Exportar audio y subtítulos"
                    >
                        {isExporting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Exportando...
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="w-5 h-5" />
                                Exportar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
