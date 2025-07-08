
import React from 'react';

interface ScriptDisplayProps {
    sentences: string[];
    currentSentence: string | null;
}

export const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ sentences, currentSentence }) => {
    if (sentences.length === 0) {
        return null;
    }

    return (
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-300 mb-4">Guion en Reproducción</h3>
            <div className="max-h-[40vh] overflow-y-auto p-4 bg-slate-900 rounded-md space-y-2">
                {sentences.map((sentence, index) => (
                    <p key={index} className={`transition-all duration-300 ${sentence === currentSentence ? 'text-sky-300 font-semibold scale-105' : 'text-slate-400'}`}>
                        {sentence}
                    </p>
                ))}
            </div>
        </div>
    );
};
