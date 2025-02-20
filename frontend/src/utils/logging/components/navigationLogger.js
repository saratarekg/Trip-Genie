import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from './SessionContext';

const NavigationLogger = () => {
    const location = useLocation();
    const { logInteraction } = useSession();
    const prevPathRef = useRef(location.pathname); // Track the previous path

    useEffect(() => {
        if (location.pathname !== prevPathRef.current) {
            console.log(location.pathname);
            // Log the route change only if the path has changed
            logInteraction('route_change', {
                previousPath: prevPathRef.current,
                currentPath: location.pathname,
            });

            prevPathRef.current = location.pathname; // Update the previous path
        }
    }, [location, logInteraction]);

    return null; // This component doesn't render anything
};

export default NavigationLogger;