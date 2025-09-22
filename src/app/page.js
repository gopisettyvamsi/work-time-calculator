"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Calculator,
  AlertCircle,
  CheckCircle,
  Timer,
  Calendar,
  Coffee,
} from "lucide-react";

export default function AdvancedLogoutCalculator() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginTime, setLoginTime] = useState("");
  const [breaks, setBreaks] = useState([{ id: 1, start: "", end: "", isValid: true, duration: 0 }]);
  const [logoutTime, setLogoutTime] = useState("");
  const [totalWorkingHours, setTotalWorkingHours] = useState(8);
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [remainingWork, setRemainingWork] = useState("");
  const [progress, setProgress] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const breakIdCounter = useRef(2);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger calculation when inputs change
  useEffect(() => {
    if (loginTime && breaks.some((b) => b.start && b.end)) {
      const timer = setTimeout(() => {
        calculateLogout();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loginTime, breaks, totalWorkingHours]);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const validateTime = (start, end) => {
    if (!start || !end) return true;
    return new Date(`2000-01-01T${start}:00`) < new Date(`2000-01-01T${end}:00`);
  };

  const validateBreakOverlap = (breaks, currentIndex) => {
    const current = breaks[currentIndex];
    if (!current.start || !current.end) return true;

    const currentStart = new Date(`2000-01-01T${current.start}:00`);
    const currentEnd = new Date(`2000-01-01T${current.end}:00`);

    return !breaks.some((other, i) => {
      if (i === currentIndex || !other.start || !other.end) return false;
      const otherStart = new Date(`2000-01-01T${other.start}:00`);
      const otherEnd = new Date(`2000-01-01T${other.end}:00`);
      return currentStart < otherEnd && currentEnd > otherStart;
    });
  };

  const calculateBreakDuration = (start, end) => {
    if (!start || !end) return 0;
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    return Math.max(0, (endTime - startTime) / (1000 * 60));
  };

  const handleAddBreak = () => {
    setBreaks([
      ...breaks,
      { id: breakIdCounter.current++, start: "", end: "", isValid: true, duration: 0 },
    ]);
    addNotification("New break added", "success");
  };

  const handleRemoveBreak = (id) => {
    if (breaks.length > 1) {
      setBreaks(breaks.filter((b) => b.id !== id));
      addNotification("Break removed", "info");
    }
  };

  const calculateLogout = useCallback(() => {
    const newErrors = {};
    if (!loginTime) {
      newErrors.loginTime = "Login time is required";
      setErrors(newErrors);
      return;
    }

    setIsCalculating(true);

    let totalBreakMinutes = 0;
    const updatedBreaks = breaks.map((breakItem, index) => {
      const duration = calculateBreakDuration(breakItem.start, breakItem.end);
      let isValid = true;

      if (breakItem.start && breakItem.end) {
        if (!validateTime(breakItem.start, breakItem.end)) {
          newErrors[`break_${breakItem.id}`] = "End time must be after start time";
          isValid = false;
        } else if (!validateBreakOverlap(breaks, index)) {
          newErrors[`break_${breakItem.id}`] = "Break times overlap";
          isValid = false;
        } else {
          totalBreakMinutes += duration;
        }
      }
      return { ...breakItem, duration, isValid };
    });

    setBreaks(updatedBreaks);
    setTotalBreakTime(totalBreakMinutes);

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setIsCalculating(false);
      return;
    }

    setErrors({});
    const loginDate = new Date(`2000-01-01T${loginTime}:00`);
    const logoutDate = new Date(
      loginDate.getTime() + (totalWorkingHours * 60 + totalBreakMinutes) * 60000
    );

    const formattedLogoutTime = logoutDate.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });

    const now = new Date();
    const workedMinutes =
      Math.max(
        0,
        now.getHours() * 60 + now.getMinutes() - (loginDate.getHours() * 60 + loginDate.getMinutes())
      ) - totalBreakMinutes;
    const remainingMinutes = Math.max(0, totalWorkingHours * 60 - workedMinutes);

    setRemainingWork(
      remainingMinutes > 0
        ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`
        : "Complete!"
    );
    setProgress(Math.min(100, (workedMinutes / (totalWorkingHours * 60)) * 100));

    setTimeout(() => {
      setLogoutTime(formattedLogoutTime);
      setIsCalculating(false);
      setShowResult(true);
      addNotification("Logout time calculated successfully!", "success");
    }, 1000);
  }, [loginTime, breaks, totalWorkingHours]);

  const resetCalculator = () => {
    setLoginTime("");
    setBreaks([{ id: 1, start: "", end: "", isValid: true, duration: 0 }]);
    setLogoutTime("");
    setShowResult(false);
    setErrors({});
    setProgress(0);
    setTotalBreakTime(0);
    setRemainingWork("");
    breakIdCounter.current = 2;
    addNotification("Calculator reset", "info");
  };

  const handleBreakChange = (id, field, value) => {
    setBreaks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const getTimeInputClass = (hasError) =>
    `w-full border-2 p-3 rounded-lg text-gray-800 transition-all duration-300 ${
      hasError
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-gray-300 focus:border-blue-500"
    } focus:outline-none focus:ring-2 focus:ring-blue-200`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-3 rounded-lg shadow-lg ${
              n.type === "success"
                ? "bg-green-500 text-white"
                : n.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {n.type === "success" && <CheckCircle className="w-4 h-4" />}
              {n.type === "error" && <AlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{n.message}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced Work Calculator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Calculate your optimal logout time with precision and style
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Clock + Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" /> Live Time
              </h3>
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
                  {formatTime(currentTime)}
                </div>
                <div className="text-gray-500 text-sm">{formatDate(currentTime)}</div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-green-600 text-sm font-medium">Work Progress</div>
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round(progress)}%
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-orange-600 text-sm font-medium">Remaining</div>
                  <div className="text-lg font-bold text-orange-700">
                    {remainingWork || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5" /> Today&apos;s Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-black">
                  <span>Working Hours</span>
                  <span className="font-semibold text-black">{totalWorkingHours}h</span>
                </div>
                <div className="flex justify-between text-black">
                  <span>Total Breaks</span>
                  <span className="font-semibold text-black">{Math.round(totalBreakTime)}m</span>
                </div>
                <div className="flex justify-between text-black">
                  <span>Break Count</span>
                  <span className="font-semibold">
                    {breaks.filter((b) => b.start && b.end).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
              {/* Working Hours */}
              <div className="flex gap-4 items-center text-black">
                <label className="font-medium">Working Hours:</label>
                <select
                  value={totalWorkingHours}
                  onChange={(e) => setTotalWorkingHours(Number(e.target.value))}
                  className="border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {[6, 7, 8, 9, 10].map((h) => (
                    <option key={h} value={h}>
                      {h} Hours
                    </option>
                  ))}
                </select>
              </div>

              {/* Login Time */}
              <div>
                <label className="flex items-center gap-2 font-medium mb-2 text-black">
                  <Calendar className="w-4 h-4 text-black" /> Login Time
                </label>
                <input
                  type="time"
                  value={loginTime}
                  onChange={(e) => setLoginTime(e.target.value)}
                  className={getTimeInputClass(errors.loginTime)}
                />
                {errors.loginTime && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.loginTime}
                  </div>
                )}
              </div>

              {/* Breaks */}
              <div>
                <div className="flex justify-between mb-2 text-black">
                  <label className="flex items-center gap-2 font-medium text-black">
                    <Coffee className="w-4 h-4 text-black" /> Break Times
                  </label>
                  <button
                    onClick={handleAddBreak}
                    className="px-4 py-2 bg-green-600 text-black rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-black" /> Add Break
                  </button>
                </div>
                <div className="space-y-3">
                  {breaks.map((b, idx) => (
                    <div
                      key={b.id}
                      className={`p-4 rounded-xl border-2 ${
                        errors[`break_${b.id}`]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3 text-black">
                        <span>Break {idx + 1}</span>
                        {b.duration > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {Math.round(b.duration)}m
                          </span>
                        )}
                        {breaks.length > 1 && (
                          <button
                            onClick={() => handleRemoveBreak(b.id)}
                            className="ml-auto text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="time"
                          value={b.start}
                          onChange={(e) => handleBreakChange(b.id, "start", e.target.value)}
                          className={getTimeInputClass(errors[`break_${b.id}`])}
                        />
                        <input
                          type="time"
                          value={b.end}
                          onChange={(e) => handleBreakChange(b.id, "end", e.target.value)}
                          className={getTimeInputClass(errors[`break_${b.id}`])}
                        />
                      </div>
                      {errors[`break_${b.id}`] && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors[`break_${b.id}`]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={calculateLogout}
                  disabled={isCalculating}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  {isCalculating ? (
                    <span>Calculating...</span>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" /> Calculate Logout Time
                    </>
                  )}
                </button>
                <button
                  onClick={resetCalculator}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>

              {/* Results */}
              {showResult && logoutTime && (
                <div className="mt-6 p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center">
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-semibold">Calculation Complete!</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-700 mb-2">{logoutTime}</div>
                  <div className="text-gray-600 mb-4">Recommended Logout Time</div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Work Progress: {Math.round(progress)}% • Remaining: {remainingWork}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
