
import React from 'react';
import { SparklesIcon } from './icons';

interface ScriptEditorProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    script: string;
    onScriptChange: (value: string) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
    prompt,
    onPromptChange,
    onGenerate,
    isGenerating,
    script,
    onScriptChange
}) => {
    return (
        <div className="space-y-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg">
                <label htmlFor="prompt" className="block text-lg font-semibold text-sky-400 mb-2">1. Genera tu guion</label>
                <p className="text-slate-400 mb-4">Describe la idea para tu video. Sé específico para obtener mejores resultados (ej: "un guion de 15 minutos sobre la historia de la exploración espacial").</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        id="prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder="Escribe la idea para tu guion..."
                        className="flex-grow bg-slate-900 border border-slate-600 rounded-md py-3 px-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition duration-200"
                        disabled={isGenerating}
                    />
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating || !prompt}
                        className="flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3 px-6 rounded-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generando...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Generar Guion
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg">
                <label htmlFor="script" className="block text-lg font-semibold text-indigo-400 mb-2">2. Edita y Prepara</label>
                 <p className="text-slate-400 mb-4">Aquí aparecerá tu guion generado. Puedes editarlo o pegar tu propio texto antes de reproducirlo.</p>
                <textarea
                    id="script"
                    value={script}
                    onChange={(e) => onScriptChange(e.target.value)}
                    placeholder="Tu guion aparecerá aquí..."
                    className="w-full h-64 bg-slate-900 border border-slate-600 rounded-md p-4 text-slate-300 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
                />
            </div>
        </div>
    );
};
