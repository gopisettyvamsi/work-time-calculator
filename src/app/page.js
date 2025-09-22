"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  Timer, 
  CheckCircle, 
  BarChart3, 
  Coffee, 
  Hourglass, 
  LogOut, 
  TrendingUp,
  AlertCircle,
  Loader2,
  Mountain
} from "lucide-react";

export default function SimpleWorkCalculator() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // time-of-day (clock)
  const [loginTime, setLoginTime] = useState("");

  // durations (HH/MM)
  const [twH, setTwH] = useState(8);  // Total Work default 8h
  const [twM, setTwM] = useState(1);  // Total Work default 1m
  const [grossH, setGrossH] = useState(0);
  const [grossM, setGrossM] = useState(0);
  const [effH, setEffH] = useState(0);
  const [effM, setEffM] = useState(0);

  // results
  const [breakTime, setBreakTime] = useState("");
  const [remainingTime, setRemainingTime] = useState("");
  const [logoutTime, setLogoutTime] = useState("");
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);

  // live clock & mount animation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setTimeout(() => setMounted(true), 100);
    return () => clearInterval(timer);
  }, []);

  const toMinutes = (h, m) => (Math.max(0, parseInt(h || 0)) * 60) + Math.max(0, Math.min(59, parseInt(m || 0)));
  const fmt = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

  const calculate = async () => {
    setCalculating(true);
    setError("");
    setBreakTime("");
    setRemainingTime("");
    setLogoutTime("");

    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!loginTime) {
      setError("Please enter Login Time.");
      setCalculating(false);
      return;
    }

    const totalWorkMin = toMinutes(twH, twM);
    const grossMin = toMinutes(grossH, grossM);
    const effMin = toMinutes(effH, effM);

    if (effMin > grossMin) {
      setError("Effective time cannot be greater than Gross time.");
      setCalculating(false);
      return;
    }

    const breakMin = Math.max(0, grossMin - effMin);
    const remainingMin = Math.max(0, totalWorkMin - effMin);

    setBreakTime(fmt(breakMin));
    setRemainingTime(fmt(remainingMin));

    // Logout = Login + Gross + Remaining
    const [lh, lm] = loginTime.split(":").map(Number);
    const loginDate = new Date();
    loginDate.setHours(lh, lm, 0, 0);

    const logoutDate = new Date(loginDate.getTime() + (grossMin + remainingMin) * 60000);
    const out = logoutDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    setLogoutTime(out);
    setCalculating(false);
  };

const Logo = () => (
  <div className="flex items-center justify-center space-x-3 mb-8">
    {/* Logo image */}
    <div className="relative p-2 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
      <img
        src="/1679347395065-removebg-preview.png" // place the logo inside /public
        alt="Edvenswa Logo"
        className="h-10 w-auto"
      />
      <div className="absolute inset-0 bg-blue-400 opacity-20 blur-xl rounded-2xl animate-pulse"></div>
    </div>

    {/* Text */}
    <div>
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 tracking-wide">
        Edvenswa
      </h1>
      <p className="text-xs text-gray-400 tracking-wider uppercase">Work Calculator</p>
    </div>
  </div>
);

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.15); }
          50% { box-shadow: 0 0 50px rgba(59, 130, 246, 0.3); }
        }
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .float { animation: float 4s ease-in-out infinite; }
        .glow { animation: glow 3s ease-in-out infinite; }
        .slide-in { animation: slideIn 0.6s ease-out; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-cyan-500/5 rounded-full blur-3xl float"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl animate-bounce"></div>
        </div>

        <div className={`relative w-full max-w-lg transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Main Card */}
          <div className="bg-gray-900/40 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl glow">
            
            <Logo />

            {/* Live Clock */}
            <div className="text-center mb-8 p-6 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-2xl border border-gray-600/30 float">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400 uppercase tracking-wide">Current Time</span>
              </div>
              <div className="text-4xl font-mono font-bold text-white mb-2 tracking-wider">
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
                })}
              </div>
              <div className="text-sm text-gray-300">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long", month: "short", day: "numeric"
                })}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              
              {/* Login Time */}
              <div className="group">
                <label className="flex items-center space-x-3 text-gray-300 mb-3 group-hover:text-white transition-colors duration-200">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">Login Time</span>
                </label>
                <input
                  type="time"
                  value={loginTime}
                  onChange={(e) => setLoginTime(e.target.value)}
                  className="w-full bg-gray-800/30 border border-gray-600/50 rounded-2xl px-4 py-4 text-white text-lg font-mono tracking-wider focus:outline-none focus:border-blue-400 focus:bg-gray-800/50 transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-500/70"
                />
              </div>

              {/* Total Work */}
              <div className="group">
                <label className="flex items-center space-x-3 text-gray-300 mb-3 group-hover:text-white transition-colors duration-200">
                  <Timer className="w-4 h-4 text-green-400" />
                  <span className="font-medium">Total Work Time</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0" 
                      value={twH} 
                      onChange={(e) => setTwH(e.target.value)}
                      className="w-full bg-gray-800/30 border border-gray-600/50 rounded-2xl px-4 py-4 text-white text-center font-mono text-lg focus:outline-none focus:border-green-400 focus:bg-gray-800/50 transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-500/70" 
                    />
                    <span className="absolute right-3 top-4 text-gray-400 text-sm">hrs</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0" 
                      max="59" 
                      value={twM} 
                      onChange={(e) => setTwM(e.target.value)}
                      className="w-full bg-gray-800/30 border border-gray-600/50 rounded-2xl px-4 py-4 text-white text-center font-mono text-lg focus:outline-none focus:border-green-400 focus:bg-gray-800/50 transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-500/70" 
                    />
                    <span className="absolute right-3 top-4 text-gray-400 text-sm">min</span>
                  </div>
                </div>
              </div>

              {/* Effective Time */}
              <div className="group">
                <label className="flex items-center space-x-3 text-gray-300 mb-3 group-hover:text-white transition-colors duration-200">
                  <CheckCircle className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium">Effective Time</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0" 
                      value={effH} 
                      onChange={(e) => setEffH(e.target.value)}
                      className="w-full bg-gray-800/30 border border-gray-600/50 rounded-2xl px-4 py-4 text-white text-center font-mono text-lg focus:outline-none focus:border-yellow-400 focus:bg-gray-800/50 transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-500/70" 
                    />
                    <span className="absolute right-3 top-4 text-gray-400 text-sm">hrs</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0" 
                      max="59" 
                      value={effM} 
                      onChange={(e) => setEffM(e.target.value)}
                      className="w-full bg-gray-800/30 border border-gray-600/50 rounded-2xl px-4 py-4 text-white text-center font-mono text-lg focus:outline-none focus:border-yellow-400 focus:bg-gray-800/50 transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-500/70" 
                    />
                    <span className="absolute right-3 top-4 text-gray-400 text-sm">min</span>
                  </div>
                </div>
              </div>

              {/* Gross Time */}
              <div className="group">
                <label className="flex items-center space-x-3 text-gray-300 mb-3 group-hover:text-white transition-colors duration-200">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">Gross Time</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0" 
                      value={grossH} 
                      onChange={(e) => setGrossH(e.target.value)}
                      className="w-full bg-gray-800/30 border border-gray-600/50 rounded-2xl px-4 py-4 text-white text-center font-mono text-lg focus:outline-none focus:border-purple-400 focus:bg-gray-800/50 transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-500/70" 
                    />
                    <span className="absolute right-3 top-4 text-gray-400 text-sm">hrs</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0" 
                      max="59" 
                      value={grossM} 
                      onChange={(e) => setGrossM(e.target.value)}
                      className="w-full bg-gray-800/30 border border-gray-600/50 rounded-2xl px-4 py-4 text-white text-center font-mono text-lg focus:outline-none focus:border-purple-400 focus:bg-gray-800/50 transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-500/70" 
                    />
                    <span className="absolute right-3 top-4 text-gray-400 text-sm">min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculate}
              disabled={calculating}
              className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className={`flex items-center justify-center space-x-2 relative z-10 transition-opacity duration-300 ${calculating ? 'opacity-0' : 'opacity-100'}`}>
                <TrendingUp className="w-5 h-5" />
                <span>Calculate Work Schedule</span>
              </span>
              {calculating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-200 slide-in">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Results */}
            {logoutTime && !error && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-2xl slide-in">
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Work Summary</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-4 bg-gray-800/20 rounded-xl border border-gray-700/30">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Coffee className="w-5 h-5 text-yellow-400" />
                      </div>
                      <span className="text-gray-300 font-medium">Break Time</span>
                    </div>
                    <span className="text-xl font-mono font-bold text-yellow-400">{breakTime}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-800/20 rounded-xl border border-gray-700/30">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Hourglass className="w-5 h-5 text-orange-400" />
                      </div>
                      <span className="text-gray-300 font-medium">Remaining</span>
                    </div>
                    <span className="text-xl font-mono font-bold text-orange-400">{remainingTime}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-xl border-2 border-green-500/30">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <LogOut className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="text-gray-300 font-medium">Logout Time</span>
                    </div>
                    <span className="text-xl font-mono font-bold text-green-400">{logoutTime}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
