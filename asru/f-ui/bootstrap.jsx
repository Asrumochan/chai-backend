import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App.jsx';
import './index.css';
import { ThemeProvider } from '@uhg-abyss/web/ui/ThemeProvider';
import { createTheme } from '@uhg-abyss/web/tools/theme';
import { BrowserRouter } from 'react-router-dom';

const theme = createTheme('uhc');

console.log('import.meta.env======= ', import.meta.env);
console.log('process.env======= ', process.env);

ReactDOM.createRoot(document.getElementById('root')).render(
    // <React.StrictMode>
    <ThemeProvider theme={theme}>
        <BrowserRouter>
            <AppWrapper />
        </BrowserRouter>
    </ThemeProvider>
    // </React.StrictMode>,
);
