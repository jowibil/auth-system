import { House } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [rules, setRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setRules({
      length: password.length >= 12,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_~+\-[\]\\/;=`]/.test(password),
    });
  }, [password]);

  // Calculate Strength Metric
  const passedCount = Object.values(rules).filter(Boolean).length;
  const getStrengthLabel = () => {
    if (password.length === 0) return { label: 'Empty', color: 'bg-stone-200', text: 'text-stone-400', width: 'w-0' };
    if (passedCount <= 2) return { label: 'Weak (Unacceptable)', color: 'bg-red-400', text: 'text-red-600', width: 'w-1/3' };
    if (passedCount <= 4) return { label: 'Moderate', color: 'bg-amber-400', text: 'text-amber-700', width: 'w-2/3' };
    return { label: 'Strong & Secure', color: 'bg-stone-600', text: 'text-stone-800', width: 'w-full' };
  };

  const strength = getStrengthLabel();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passedCount < 5) {
      setError('Password does not satisfy all mandatory validation criteria.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }
      setSuccess('Account provisioned successfully. Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] font-sans text-stone-800 px-4">
      <div className="max-w-md w-full bg-[#FCFBF9] border border-[#EFE9DC] p-8 rounded-lg shadow-sm relative">
        <House
          className="absolute right-8 top-4 text-[#2C2416] cursor-pointer hover:opacity-70 transition-opacity duration-200"
          onClick={() => navigate("/")}
        />
        <h2 className="text-2xl font-light text-center tracking-tight mb-2 text-stone-900">Create Account</h2>
        <p className="text-xs text-center text-stone-500 mb-8">Enter your details to register</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-stone-100 border border-stone-200 text-stone-700 text-xs rounded">{success}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">Username</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#EFE9DC] rounded focus:outline-none focus:border-stone-400 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#EFE9DC] rounded focus:outline-none focus:border-stone-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#EFE9DC] rounded focus:outline-none focus:border-stone-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Password Strength Gauge Component Container */}
          <div className="pt-1">
            <div className="flex justify-between items-center text-[11px] mb-1.5">
              <span className="text-stone-500">Password Health:</span>
              <span className={`font-medium ${strength.text}`}>{strength.label}</span>
            </div>
            <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
              <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
            </div>

            {/* Micro Criteria Checkboxes */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-3 text-[11px]">
              <div className={`flex items-center space-x-1.5 ${rules.length ? 'text-stone-700' : 'text-stone-400'}`}>
                <span>{rules.length ? '✓' : '◦'}</span> <span>Min 12 Characters</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${rules.upper ? 'text-stone-700' : 'text-stone-400'}`}>
                <span>{rules.upper ? '✓' : '◦'}</span> <span>Uppercase Letter</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${rules.lower ? 'text-stone-700' : 'text-stone-400'}`}>
                <span>{rules.lower ? '✓' : '◦'}</span> <span>Lowercase Letter</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${rules.number ? 'text-stone-700' : 'text-stone-400'}`}>
                <span>{rules.number ? '✓' : '◦'}</span> <span>Numerical Digit</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${rules.special ? 'text-stone-700' : 'text-stone-400'}`}>
                <span>{rules.special ? '✓' : '◦'}</span> <span>Special Character</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || passedCount < 5}
            className="w-full mt-2 py-2 text-xs uppercase tracking-widest font-medium bg-stone-800 text-[#FAF7F2] rounded hover:bg-stone-700 active:bg-stone-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          Already registered?{' '}
          <Link to="/login" className="text-stone-800 underline hover:text-stone-600 transition">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}