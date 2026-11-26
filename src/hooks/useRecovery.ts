import { useEffect, useState } from 'react';
import { useAdoption } from '../../hooks/useAdoption';
export function useRecovery() {
  const app = useAdoption(); const [step, setStep] = useState(0); const [email, setEmail] = useState(''); const [code, setCode] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const [remaining, setRemaining] = useState(300); const [expired, setExpired] = useState(false);
  useEffect(() => { if (step !== 1) return; const timer = setInterval(() => setRemaining(value => Math.max(0, value - 1)), 1000); return () => clearInterval(timer); }, [step]);
  async function send() { if (await app.sendCode(email)) { setCode(''); setRemaining(300); setExpired(false); setStep(1); } }
  async function verify() { if (!remaining) { setExpired(true); return; } if (await app.verifyCode(code)) setStep(2); }
  return { ...app, step, setStep, email, setEmail, code, setCode, password, setPassword, confirmation, setConfirmation, remaining, expired, send, verify };
}
