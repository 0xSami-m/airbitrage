import { useState } from 'react';

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
}

const AUTH_KEY = 'flyai_user';

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function storeUser(user: AuthUser) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_KEY);
}

type Mode = 'choice' | 'login' | 'signup';

interface Props {
  onAuth: (user: AuthUser) => void;
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<Mode>('choice');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup fields
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [dob, setDob]                   = useState('');
  const [gender, setGender]             = useState('');
  const [signupEmail, setSignupEmail]   = useState('');
  const [phone, setPhone]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'Login failed. Please check your email and password.');
        return;
      }
      const user: AuthUser = data.user;
      storeUser(user);
      onAuth(user);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail.trim().toLowerCase(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          dob,
          gender,
          phone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'Sign up failed. Please try again.');
        return;
      }
      const user: AuthUser = data.user;
      storeUser(user);
      onAuth(user);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-[#D4D0CB] bg-white text-sm text-[#1A1A1A] placeholder-[#BBBBBB] focus:outline-none focus:border-[#999999] transition';

  if (mode === 'choice') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-24 gap-6">
        <div className="flex flex-col items-center gap-1">
          <div className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">My Account</div>
          <div className="text-sm text-[#999999]">Log in or create an account to continue.</div>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => setMode('login')}
            className="w-full py-3 bg-[#1A1A1A] hover:bg-[#333333] text-white text-sm font-semibold rounded-xl transition"
          >
            Log in
          </button>
          <button
            onClick={() => setMode('signup')}
            className="w-full py-3 bg-white hover:bg-[#F5F2ED] text-[#1A1A1A] text-sm font-semibold rounded-xl border border-[#D4D0CB] transition"
          >
            Sign up
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-20">
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm">
          <div className="flex flex-col gap-1 mb-2">
            <div className="text-xl font-extrabold text-[#1A1A1A]">Log in</div>
          </div>

          <input
            type="email"
            placeholder="Email address"
            required
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            className={inputCls}
          />

          {error && <div className="text-xs text-red-500">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#1A1A1A] hover:bg-[#333333] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition mt-1"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('choice'); setError(''); }}
            className="text-xs text-[#999999] hover:text-[#555555] text-center transition"
          >
            ← Back
          </button>
        </form>
      </div>
    );
  }

  // signup
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
      <form onSubmit={handleSignup} className="flex flex-col gap-3.5 w-full max-w-sm">
        <div className="flex flex-col gap-1 mb-1">
          <div className="text-xl font-extrabold text-[#1A1A1A]">Create an account</div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="First name"
            required
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Last name"
            required
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-[#999999] pl-1">Date of birth</label>
            <input
              type="date"
              required
              value={dob}
              onChange={e => setDob(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-[#999999] pl-1">Gender</label>
            <select
              required
              value={gender}
              onChange={e => setGender(e.target.value)}
              className={`${inputCls} text-[#1A1A1A]`}
            >
              <option value="" disabled>Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <input
          type="email"
          placeholder="Email address"
          required
          value={signupEmail}
          onChange={e => setSignupEmail(e.target.value)}
          className={inputCls}
        />
        <input
          type="tel"
          placeholder="Phone number"
          required
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className={inputCls}
        />
        <input
          type="password"
          placeholder="Create a password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={inputCls}
        />
        <input
          type="password"
          placeholder="Confirm password"
          required
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className={inputCls}
        />

        {error && <div className="text-xs text-red-500">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#1A1A1A] hover:bg-[#333333] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition mt-1"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
        <button
          type="button"
          onClick={() => { setMode('choice'); setError(''); }}
          className="text-xs text-[#999999] hover:text-[#555555] text-center transition"
        >
          ← Back
        </button>
      </form>
    </div>
  );
}
