import './App.css'
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F0E8',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>

      {/* Top nav bar */}
      <nav style={{
        padding: '1.25rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #DDD5C0',
        backgroundColor: '#FAF6EE',
      }}>
        <span style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#8B7D65',
        }}>
          IT 322
        </span>
      </nav>

      {/* Hero section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>

        {/* Decorative ornament */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '1px', background: '#C4B49A' }} />
          <div style={{ width: '6px', height: '6px', background: '#C4B49A', borderRadius: '50%' }} />
          <div style={{ width: '48px', height: '1px', background: '#C4B49A' }} />
        </div>

        {/* Eyebrow label */}
        <p style={{
          fontSize: '0.65rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#9B8B72',
          marginBottom: '1.25rem',
        }}>
          Welcome to IT 322 – Information Assurance and Security
        </p>

        {/* Main heading */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '400',
          color: '#2C2416',
          lineHeight: '1.2',
          letterSpacing: '-0.02em',
          maxWidth: '720px',
          margin: '0 0 1.75rem',
        }}>
          Secure Registration and Login System
        </h1>

        {/* Hero paragraph */}
        <p style={{
          fontSize: '0.95rem',
          color: '#7A6B52',
          maxWidth: '560px',
          lineHeight: '1.8',
          marginBottom: '3rem',
        }}>
          Password Hashing, Salt, Pepper, Password Strength Meter, and Online Hosting
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '0.85rem 2.5rem',
              fontSize: '0.75rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#FAF6EE',
              background: '#5C4F3A',
              border: '1px solid #5C4F3A',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Create Account
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '0.85rem 2.5rem',
              fontSize: '0.75rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#5C4F3A',
              background: 'transparent',
              border: '1px solid #C4B49A',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>

        {/* Bottom ornament */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '4rem' }}>
          <div style={{ width: '32px', height: '1px', background: '#DDD5C0' }} />
          <div style={{ width: '4px', height: '4px', background: '#DDD5C0', transform: 'rotate(45deg)' }} />
          <div style={{ width: '32px', height: '1px', background: '#DDD5C0' }} />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '1.25rem 2.5rem',
        borderTop: '1px solid #DDD5C0',
        backgroundColor: '#FAF6EE',
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: '0.65rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#B0A08A',
        }}>
          IT 322 — Information Assurance and Security
        </span>
      </footer>
    </div>
  );
}