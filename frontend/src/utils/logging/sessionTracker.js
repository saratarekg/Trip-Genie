import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid"; // Generate unique session IDs
import { db, collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs } from "./configs/firebaseConfig.js";

// Function to initialize a session
const startSession = async (userId) => {
    if (userId === null) return;
    const sessionsRef = collection(db, "sessions");

    // Check if an active session exists (session without an endTime)
    const q = query(sessionsRef, where("userId", "==", userId), where("endTime", "==", null));
    const querySnapshot = await getDocs(q);

    const u = query(sessionsRef, where("userId", "==", userId));
    const totalSessions = await getDocs(u);

    if (!querySnapshot.empty) {
        // If an active session exists, return it instead of creating a new one
        const existingSession = querySnapshot.docs[0].data();
        return { ...existingSession, docRef: querySnapshot.docs[0].ref };
    }

    // If no active session, create a new one
    const sessionId = uuidv4();
    sessionStorage.setItem("sessionId", sessionId);
    console.log("sessionId stored", sessionStorage.getItem("sessionId"));
    console.log("New session started:", sessionId);

    const docRef = await addDoc(sessionsRef, {
        sessionId,
        userId,
        sessionNumber: totalSessions.size + 1,
        sequence: [],
        startTime: serverTimestamp(),
        timeToStart: 0,
        numSteps: 0,
        endTime: null, // This indicates the session is active
        timeSpent: 0,
    });

    return { sessionId, userId, sessionNumber: totalSessions.size + 1, sequence: [], startTime: Date.now(), timeToStart: null, numSteps: 0, docRef };
};

export const useSessionTracker = (userId) => {
    const [session, setSession] = useState(null);
    const [firstInteractionTime, setFirstInteractionTime] = useState(null);
    const inactivityTimer = useRef(null);
    const isSessionInitialized = useRef(false); // Track if session has been initialized

    useEffect(() => {
        const initSession = async () => {
            if (!isSessionInitialized.current) {
                const newSession = await startSession(userId);
                setSession(newSession);
                isSessionInitialized.current = true; // Mark session as initialized
                resetInactivityTimer(); // Start inactivity timer
            }
        };

        initSession();

        // Cleanup function to end the session when component unmounts
        return () => {
            if (isSessionInitialized.current) {
                endSession();
                isSessionInitialized.current = false;
            }
        };
    }, [userId]); // Runs only when userId changes

    // Function to reset inactivity timer
    const resetInactivityTimer = () => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(async () => {
            console.log("Session ended due to inactivity");
            await endSession();
        }, 900000); // 15 minutes (900,000 ms)
    };

    // Log interactions and reset inactivity timer
    const logInteraction = async (path, eventType, details) => {
        if (!session || !isSessionInitialized.current) {
            const initSession = async () => {
                const newSession = await startSession(userId);
                setSession(newSession);
                isSessionInitialized.current = true; // Mark session as initialized
            };
            initSession();
        }

        console.log("Interaction logged:", path, eventType, details);

        const now = Date.now();

        // Capture timeToStart only for the first interaction
        if (!firstInteractionTime) {
            setFirstInteractionTime(now);
            const timeToStartInMS = now - session.startTime;
            const timeToStart = Math.round(timeToStartInMS / 1000); // Convert to seconds

            // Update Firestore with timeToStart
            await updateDoc(session.docRef, { timeToStart });
        }

        const formattedTimestamp = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short'  // Includes UTC offset
        }).format(now);

        const updatedSequence = [
            ...session.sequence,
            {path, eventType, details, timestamp: formattedTimestamp },
        ];

        setSession((prevSession) => ({
            ...prevSession,
            sequence: updatedSequence,
            numSteps: prevSession.numSteps + 1,
        }));

        // Update Firestore with the new interaction
        await updateDoc(session.docRef, {
            sequence: updatedSequence,
            numSteps: session.numSteps + 1,
        });

        // Reset inactivity timer
        resetInactivityTimer();
    };

    // End session and save final data to Firestore
    const endSession = async () => {
        if (!session) return;

        // Get the timestamp of the last interaction in the sequence
        const lastInteraction = session.sequence[session.sequence.length - 1];
        const endTime = lastInteraction ? new Date(lastInteraction.timestamp).getTime() : Date.now();

        // Calculate time spent in the session
        const timeSpentInMilliseconds = endTime - session.startTime;
        const timeSpentInMinutes = Math.round(timeSpentInMilliseconds / 60000); // Convert to minutes

        // Update Firestore with the endTime and timeSpent
        await updateDoc(session.docRef, {
            timeSpent: timeSpentInMinutes, // Store timeSpent in minutes
            endTime: serverTimestamp(), // Use Firestore serverTimestamp for consistency
        });

        console.log("Session ended:", session.sessionId);
        setSession(null);
    };
    return { logInteraction, endSession };
};