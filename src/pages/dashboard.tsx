import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('userSession') || 'User';

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col font-serif">
      
      {/* Navbar */}
      <nav className="px-10 py-5 flex justify-between items-center border-b border-[#DDD5C0] bg-[#FAF6EE]">
        <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#8B7D65]">
          IT 322 — Secure Core
        </span>

        <button
          onClick={handleLogout}
          className="text-[0.7rem] tracking-[0.15em] uppercase text-[#FAF6EE] bg-[#5C4F3A] cursor-pointer px-[1.2rem] py-[0.45rem] rounded-[2px] hover:bg-[#4A3F2E] transition-colors duration-200"
        >
          Logout
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
        
        {/* Ornament */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-[1px] bg-[#C4B49A]" />
          <div className="w-1.5 h-1.5 bg-[#C4B49A] rounded-full" />
          <div className="w-12 h-[1px] bg-[#C4B49A]" />
        </div>

        {/* Card */}
        <div className="bg-[#FAF6EE] border border-[#DDD5C0] rounded-[4px] px-14 py-12 max-w-[520px] w-full shadow-sm">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#B0A08A] mb-4">
            Session Verified
          </p>

          <h1 className="text-3xl font-normal text-[#2C2416] mb-4 tracking-tight">
            Welcome, {username}
          </h1>

          <p className="text-sm text-[#7A6B52] leading-[1.75] mb-0">
            You have successfully authenticated. Your session is active and secure.
          </p>
        </div>

        {/* Bottom ornament */}
        <div className="flex items-center gap-3 mt-12">
          <div className="w-8 h-[1px] bg-[#DDD5C0]" />
          <div className="w-1 h-1 bg-[#DDD5C0] rotate-45" />
          <div className="w-8 h-[1px] bg-[#DDD5C0]" />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-10 py-5 border-t border-[#DDD5C0] bg-[#FAF6EE] text-center">
        <span className="text-[0.65rem] tracking-[0.12em] uppercase text-[#B0A08A]">
          IT 322 — Information Assurance and Security
        </span>
      </footer>
    </div>
  );
}