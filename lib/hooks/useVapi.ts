import { IBook, Messages } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_VOICE } from "../constants";

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'listening' | 'thinking' | 'speaking';

const useLatestRef = <T>(value: T) => {
    const ref = useRef<T>(value);
   useEffect(()=>{
     ref.current = value;
   }, [value])
    return ref;
};

export const useVapi = (book:IBook) =>{
    const {userId} =useAuth();

    // TODO: Implement limits
    const [status, setStatus] = useState<CallStatus>('idle');
    const [message, setMessage] = useState<Messages[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [currentUserMessage, setCurrentUserMessage] = useState('');
    const [duration, setDuration] = useState(0);
    const [limitError, setLimitError] = useState<string | null>(null);
    
    const timerRef=useRef<NodeJS.Timeout | null>(null);
    const stratTimerRef=useRef<NodeJS.Timeout | null>(null);
    const sessionIdRef=useRef<string | null>(null);
    const isStoppingRef=useRef<boolean>(false);
 
    const bookRef = useLatestRef(book);
    const durationRef = useLatestRef(duration);
   const voice=book.persona|| DEFAULT_VOICE;
   // const maxDurationRef = useLatestRef(limits.maxSessionMinutes*60);

const isActive=status === 'listening' || status === 'thinking' || status === 'speaking'|| status === 'starting';
const start=async()=>{
    if(!userId) return setLimitError('Please sign in to start conversation');
setLimitError(null);
setStatus('connecting');
try{

}
catch(error){
    console.error('Failed to start conversation', error);
    setStatus('idle');
    setLimitError('Failed to start conversation');

}

}
const stop=async()=>{}
const clearErrors=async()=>{}
return {
    status,
    message,
    currentMessage,
    currentUserMessage,
    duration,
    isActive,
    start,
    stop,
    clearErrors,
    //maxDurationSeconds, remainingSeconds, showTimeWarning
}
}
export default useVapi;