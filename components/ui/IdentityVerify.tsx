import { useState, useEffect, useRef } from 'react';
import { isAddress, type Address } from 'viem';
import {
  getBasename,
  getBasenameAddress,
  getBasenameAvatar,
  formatToBasename,
  type BaseName,
} from '@/lib/basenames';

// ============================================================================
// COMPONENT
// ============================================================================

interface Props {
  input: string;
  onResolved: (validAddress: string | null) => void;
}

type Status = 'IDLE' | 'LOADING' | 'RESOLVED_BASENAME' | 'VALID_ADDRESS' | 'ERROR';

export default function IdentityVerify({ input, onResolved }: Props) {
  const [status, setStatus] = useState<Status>('IDLE');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [basename, setBasename] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Ref to prevent stale closure issues
  const onResolvedRef = useRef(onResolved);
  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  // Track current input for race condition prevention
  const currentInputRef = useRef<string>('');

  useEffect(() => {
    const trimmedInput = input?.trim() || '';
    currentInputRef.current = trimmedInput;

    // Reset state
    setResolvedAddress(null);
    setBasename(null);
    setAvatar(null);
    setErrorMessage('');

    if (!trimmedInput) {
      setStatus('IDLE');
      onResolvedRef.current(null);
      return;
    }

    setStatus('LOADING');

    const resolve = async () => {
      if (currentInputRef.current !== trimmedInput) return;

      try {
        // ================================================================
        // CASE A: Input is a valid Ethereum address
        // ================================================================
        if (isAddress(trimmedInput)) {
          console.log('[IdentityVerify] Resolving address:', trimmedInput);
          
          setResolvedAddress(trimmedInput);
          onResolvedRef.current(trimmedInput); // Always pass valid address

          // Try reverse lookup (address -> basename)
          const name = await getBasename(trimmedInput as Address);
          
          if (currentInputRef.current !== trimmedInput) return;

          if (name) {
            console.log('[IdentityVerify] Found basename:', name);
            setBasename(name);
            setStatus('RESOLVED_BASENAME');

            // Fetch avatar
            const avatarUrl = await getBasenameAvatar(name);
            if (currentInputRef.current === trimmedInput && avatarUrl) {
              setAvatar(avatarUrl);
            }
          } else {
            // Valid address but no basename - still valid for form!
            setStatus('VALID_ADDRESS');
          }
          return;
        }

        // ================================================================
        // CASE B: Input looks like a name (contains letters, might have dots)
        // ================================================================
        const looksLikeName = /^[a-zA-Z0-9-_]+(\.[a-zA-Z]+)*$/.test(trimmedInput);
        
        if (looksLikeName) {
          const formattedBasename = formatToBasename(trimmedInput);
          console.log('[IdentityVerify] Resolving basename:', formattedBasename);

          const address = await getBasenameAddress(formattedBasename);
          
          if (currentInputRef.current !== trimmedInput) return;

          if (address) {
            console.log('[IdentityVerify] Resolved to address:', address);
            setResolvedAddress(address);
            setBasename(formattedBasename);
            setStatus('RESOLVED_BASENAME');
            onResolvedRef.current(address);

            // Fetch avatar
            const avatarUrl = await getBasenameAvatar(formattedBasename);
            if (currentInputRef.current === trimmedInput && avatarUrl) {
              setAvatar(avatarUrl);
            }
          } else {
            console.log('[IdentityVerify] Basename not found');
            setStatus('ERROR');
            setErrorMessage(`"${formattedBasename}" is not a registered Basename`);
            onResolvedRef.current(null);
          }
          return;
        }

        // ================================================================
        // CASE C: Invalid input
        // ================================================================
        setStatus('ERROR');
        setErrorMessage('Invalid address or Basename format');
        onResolvedRef.current(null);

      } catch (err) {
        console.error('[IdentityVerify] Error:', err);
        if (currentInputRef.current === trimmedInput) {
          setStatus('ERROR');
          setErrorMessage('Failed to resolve - please try again');
          onResolvedRef.current(null);
        }
      }
    };

    // Debounce
    const timer = setTimeout(resolve, 500);
    return () => clearTimeout(timer);
  }, [input]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!input?.trim()) return null;

  // LOADING STATE
  if (status === 'LOADING') {
    return (
      <div className="mt-2 text-xs text-zinc-500 flex items-center gap-2">
        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="animate-pulse">Resolving Base Identity...</span>
      </div>
    );
  }

  // ERROR STATE
  if (status === 'ERROR') {
    return (
      <div className="mt-2 text-xs text-red-400 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{errorMessage || 'Unable to resolve identity'}</span>
      </div>
    );
  }

  // RESOLVED BASENAME - Verified State
  if (status === 'RESOLVED_BASENAME' && basename && resolvedAddress) {
    return (
      <div className="mt-3 relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-3">
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
          Base Verified
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={basename}
                className="h-11 w-11 rounded-full border-2 border-blue-500/30 shadow-lg shadow-blue-500/20 object-cover"
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-blue-500/30 shadow-lg shadow-blue-500/20">
                {basename.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-blue-100 truncate text-sm">
                {basename}
              </span>
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
              {resolvedAddress}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // VALID ADDRESS BUT UNVERIFIED - Warning State (Still allows deployment!)
  if (status === 'VALID_ADDRESS' && resolvedAddress) {
    return (
      <div className="mt-3 relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-3">
        {/* Unverified Badge */}
        <div className="absolute top-0 right-0 bg-amber-500/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Unverified
        </div>

        <div className="flex items-center gap-3">
          {/* Warning Icon Avatar */}
          <div className="flex-shrink-0">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border-2 border-amber-500/30">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-amber-200 text-sm">
                No Base Identity
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
              {resolvedAddress}
            </span>
            <p className="text-[10px] text-amber-300/70 mt-1.5 leading-relaxed">
              This address has no linked Basename. Verify you trust the recipient before proceeding.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}