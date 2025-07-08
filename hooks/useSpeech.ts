
import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeech = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [currentSentence, setCurrentSentence] = useState<string | null>(null);
    
    const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);

    const populateVoiceList = useCallback(() => {
        const newVoices = window.speechSynthesis.getVoices();
        setVoices(newVoices);
    }, []);

    useEffect(() => {
        populateVoiceList();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populateVoiceList;
        }
    }, [populateVoiceList]);

    const resetState = useCallback(() => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSentence(null);
        utteranceQueueRef.current = [];
    }, []);

    const play = useCallback((text: string, voice: SpeechSynthesisVoice) => {
        if (!text || !voice) return;

        // Cancel any previous speech
        window.speechSynthesis.cancel();
        resetState();
        
        const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
        
        const utterances = sentences.map(sentence => {
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.voice = voice;
            utterance.lang = voice.lang;
            utterance.onstart = () => {
                setIsPlaying(true);
                setIsPaused(false);
                setCurrentSentence(sentence);
            };
            return utterance;
        });
        
        if (utterances.length > 0) {
            utterances[utterances.length - 1].onend = () => {
                resetState();
            };
        }

        utteranceQueueRef.current = utterances;
        utterances.forEach(u => window.speechSynthesis.speak(u));

    }, [resetState]);

    const pause = useCallback(() => {
        if (isPlaying) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
            setIsPaused(true);
        }
    }, [isPlaying]);

    const resume = useCallback(() => {
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
            setIsPaused(false);
        }
    }, [isPaused]);

    const cancel = useCallback(() => {
        window.speechSynthesis.cancel();
        resetState();
    }, [resetState]);

    return {
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
    };
};
