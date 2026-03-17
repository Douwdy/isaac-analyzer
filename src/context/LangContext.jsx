import { createContext, useContext } from 'react';
import { translations } from '../data/translations.js';

export const LangContext = createContext('en');
export function useLang() { return translations[useContext(LangContext)]; }
