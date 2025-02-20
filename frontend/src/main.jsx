// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import {SessionProvider} from "@/utils/logging/components/sessionContext.jsx";

import React from "react";

const userId = "user123";
createRoot(document.getElementById('root')).render(
    <SessionProvider userId={userId}>
        <App/>
    </SessionProvider>);