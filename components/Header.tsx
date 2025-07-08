
import React from 'react';
import { MicIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="flex items-center justify-center gap-4">
                <MicIcon className="w-10 h-10 text-sky-400" />
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 text-transparent bg-clip-text">
                    Estudio de Voz en Off
                </h1>
            </div>
            <p className="mt-3 text-lg text-slate-400">
                Genera guiones de narración con IA y dales vida con una voz natural.
            </p>
        </header>
    );
};
