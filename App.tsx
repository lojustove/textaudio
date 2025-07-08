import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ScriptEditor } from './components/ScriptEditor';
import { PlaybackControls } from './components/PlaybackControls';
import { ScriptDisplay } from './components/ScriptDisplay';
import { useSpeech } from './hooks/useSpeech';
import { generateScript } from './services/geminiService';

export const App: React.FC = () => {
    const [script, setScript] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [exportNotification, setExportNotification] = useState<string | null>(null);

    const {
        voices,
        selectedVoice,
        setSelectedVoice,
        play,
        pause,
        resume,
        cancel,
        isPlaying,
        isPaused,
        currentSentence,
    } = useSpeech();

    useEffect(() => {
        if (voices.length > 0 && !selectedVoice) {
            const preferredVoices = voices.filter(v => 
                (v.lang.startsWith('es') || v.lang.startsWith('en')) && v.name.toLowerCase().includes('male')
            );
            let bestMatch = preferredVoices.find(v => v.name.toLowerCase().includes('narrator')) || 
                            preferredVoices.find(v => v.name.toLowerCase().includes('jorge')) ||
                            preferredVoices[0];
            if (!bestMatch) {
                bestMatch = voices.find(v => v.lang.startsWith('es-ES') || v.lang.startsWith('es-MX')) || voices[0];
            }
            setSelectedVoice(bestMatch);
        }
    }, [voices, selectedVoice, setSelectedVoice]);

    const handleGenerateScript = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Por favor, introduce una idea para el guion.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const generatedScript = await generateScript(prompt);
            setScript(generatedScript);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al generar el guion.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    }, [prompt]);
    
    const handlePlay = useCallback(() => {
        if (script && selectedVoice) {
            if (isPaused) {
                resume();
            } else {
                play(script, selectedVoice);
            }
        }
    }, [script, selectedVoice, isPaused, play, resume]);

    const sentences = useMemo(() => {
        return script.match(/[^.!?]+[.!?]*/g) || [];
    }, [script]);

    const formatSrtTime = (ms: number): string => {
        const date = new Date(ms);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
        return `${hours}:${minutes}:${seconds},${milliseconds}`;
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExport = useCallback(async () => {
        if (!script || !selectedVoice) {
            setError("Se necesita un guion y una voz seleccionada para exportar.");
            return;
        }

        cancel(); // Detener cualquier reproducción actual
        setIsExporting(true);
        setError(null);
        setExportNotification("Iniciando exportación... Se te pedirá permiso para grabar.");

        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: false,
                audio: true,
            });
        } catch (err) {
            setError("Permiso de grabación denegado. No se puede exportar el audio.");
            setIsExporting(false);
            setExportNotification(null);
            return;
        }

        setExportNotification("Grabando... La narración se reproducirá ahora. No cierres la pestaña.");
        
        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack) {
            stream.getTracks().forEach(track => track.stop());
            setError("No se pudo capturar el audio de la pestaña.");
            setIsExporting(false);
            setExportNotification(null);
            return;
        }

        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const audioChunks: Blob[] = [];
        recorder.ondataavailable = (event) => audioChunks.push(event.data);
        
        const exportPromise = new Promise<{ audioBlob: Blob; srtContent: string }>((resolve, reject) => {
            const srtEntries: { text: string; index: number; startTime: number; endTime: number; }[] = [];
            const t0 = performance.now();
            const localSentences = script.match(/[^.!?]+[.!?]*/g) || [];
            let utterancesProcessed = 0;

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' }); // Save as mp3 for convenience
                const sortedSrtEntries = srtEntries.sort((a, b) => a.startTime - b.startTime);
                const srtContent = sortedSrtEntries
                    .map(e => `${e.index}\n${formatSrtTime(e.startTime)} --> ${formatSrtTime(e.endTime)}\n${e.text}\n`)
                    .join('\n');
                resolve({ audioBlob, srtContent });
            };

            recorder.onerror = (event) => reject((event as any).error || new Error("Error en MediaRecorder"));

            const utterances = localSentences.map((sentence, index) => {
                const utterance = new SpeechSynthesisUtterance(sentence.trim());
                utterance.voice = selectedVoice;
                const entry = { text: sentence.trim(), index: index + 1, startTime: 0, endTime: 0 };

                utterance.onstart = () => {
                    entry.startTime = performance.now() - t0;
                };
                utterance.onend = () => {
                    entry.endTime = performance.now() - t0;
                    srtEntries.push(entry);
                    utterancesProcessed++;
                    if (utterancesProcessed === utterances.length) {
                        setTimeout(() => recorder.stop(), 500); // Give a brief moment before stopping
                    }
                };
                return utterance;
            });

            recorder.start();
            utterances.forEach(u => window.speechSynthesis.speak(u));
        });

        try {
            const { audioBlob, srtContent } = await exportPromise;
            setExportNotification("¡Exportación completada! Descargando archivos...");
            downloadBlob(audioBlob, "narracion.mp3");
            const srtBlob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
            downloadBlob(srtBlob, "narracion.srt");
        } catch(err) {
            setError(err instanceof Error ? err.message : "Ocurrió un error durante la exportación.");
        } finally {
            stream.getTracks().forEach(track => track.stop());
            setIsExporting(false);
            setTimeout(() => setExportNotification(null), 3000);
        }
    }, [script, selectedVoice, cancel]);


    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
            {exportNotification && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-sky-600 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-pulse">
                    <p>{exportNotification}</p>
                </div>
            )}
            <div className="w-full max-w-4xl mx-auto">
                <Header />

                <main className="mt-8 space-y-8">
                    <ScriptEditor
                        prompt={prompt}
                        onPromptChange={setPrompt}
                        onGenerate={handleGenerateScript}
                        isGenerating={isGenerating}
                        script={script}
                        onScriptChange={setScript}
                    />

                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                            <p>{error}</p>
                        </div>
                    )}

                    <PlaybackControls
                        voices={voices}
                        selectedVoice={selectedVoice}
                        onVoiceChange={setSelectedVoice}
                        onPlay={handlePlay}
                        onPause={pause}
                        onStop={cancel}
                        onExport={handleExport}
                        isPlaying={isPlaying}
                        isPaused={isPaused}
                        isExporting={isExporting}
                        disabled={!script || isGenerating}
                    />

                    <ScriptDisplay 
                        sentences={sentences}
                        currentSentence={currentSentence}
                    />
                </main>
            </div>
        </div>
    );
};