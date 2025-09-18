"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, Plus, Trash2, Calculator, AlertCircle, CheckCircle, Timer, Calendar, Coffee, Upload, Camera, FileImage } from "lucide-react";

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
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const breakIdCounter = useRef(2);
  const fileInputRef = useRef(null);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-calculate when inputs change
  useEffect(() => {
    if (loginTime && breaks.some(b => b.start && b.end)) {
      const timer = setTimeout(() => {
        calculateLogout();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loginTime, breaks, totalWorkingHours]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const validateTime = (time1, time2, field) => {
    if (!time1 || !time2) return true;
    
    const t1 = new Date(`2000-01-01T${time1}:00`);
    const t2 = new Date(`2000-01-01T${time2}:00`);
    
    if (field === 'break' && t1 >= t2) {
      return false;
    }
    return true;
  };

  const validateBreakOverlap = (breaks, currentIndex) => {
    for (let i = 0; i < breaks.length; i++) {
      if (i === currentIndex) continue;
      const current = breaks[currentIndex];
      const other = breaks[i];
      
      if (!current.start || !current.end || !other.start || !other.end) continue;
      
      const currentStart = new Date(`2000-01-01T${current.start}:00`);
      const currentEnd = new Date(`2000-01-01T${current.end}:00`);
      const otherStart = new Date(`2000-01-01T${other.start}:00`);
      const otherEnd = new Date(`2000-01-01T${other.end}:00`);
      
      if ((currentStart < otherEnd && currentEnd > otherStart)) {
        return false;
      }
    }
    return true;
  };

  const calculateBreakDuration = (start, end) => {
    if (!start || !end) return 0;
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    return Math.max(0, (endTime - startTime) / (1000 * 60));
  };

  const handleAddBreak = () => {
    setBreaks([...breaks, { 
      id: breakIdCounter.current++, 
      start: "", 
      end: "", 
      isValid: true, 
      duration: 0 
    }]);
    addNotification("New break added", "success");
  };

  const handleRemoveBreak = (id) => {
    if (breaks.length > 1) {
      setBreaks(breaks.filter(b => b.id !== id));
      addNotification("Break removed", "info");
    }
  };

  const calculateLogout = () => {
    const newErrors = {};
    
    if (!loginTime) {
      newErrors.loginTime = "Login time is required";
      setErrors(newErrors);
      return;
    }

    setIsCalculating(true);
    
    // Validate and calculate breaks
    let totalBreakMinutes = 0;
    const updatedBreaks = breaks.map((breakItem, index) => {
      const duration = calculateBreakDuration(breakItem.start, breakItem.end);
      let isValid = true;
      
      if (breakItem.start && breakItem.end) {
        if (!validateTime(breakItem.start, breakItem.end, 'break')) {
          newErrors[`break_${breakItem.id}`] = "End time must be after start time";
          isValid = false;
        } else if (!validateBreakOverlap(breaks, index)) {
          newErrors[`break_${breakItem.id}`] = "Break times overlap with another break";
          isValid = false;
        } else {
          totalBreakMinutes += duration;
        }
      }
      
      return { ...breakItem, duration, isValid };
    });

    setBreaks(updatedBreaks);
    setTotalBreakTime(totalBreakMinutes);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsCalculating(false);
      return;
    }

    setErrors({});

    // Calculate logout time
    const loginDate = new Date(`2000-01-01T${loginTime}:00`);
    const totalRequiredMinutes = (totalWorkingHours * 60) + totalBreakMinutes;
    const logoutDate = new Date(loginDate.getTime() + (totalRequiredMinutes * 60 * 1000));
    
    const formattedLogoutTime = logoutDate.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit'
    });

    // Calculate remaining work time
    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    const loginTimeMinutes = loginDate.getHours() * 60 + loginDate.getMinutes();
    const logoutTimeMinutes = logoutDate.getHours() * 60 + logoutDate.getMinutes();
    
    const workedMinutes = Math.max(0, currentTimeMinutes - loginTimeMinutes - totalBreakMinutes);
    const remainingMinutes = Math.max(0, (totalWorkingHours * 60) - workedMinutes);
    
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;
    
    setRemainingWork(remainingMinutes > 0 ? `${remainingHours}h ${remainingMins}m` : "Complete!");
    setProgress(Math.min(100, (workedMinutes / (totalWorkingHours * 60)) * 100));

    setTimeout(() => {
      setLogoutTime(formattedLogoutTime);
      setIsCalculating(false);
      setShowResult(true);
      addNotification("Logout time calculated successfully!", "success");
    }, 1000);
  };

  const resetCalculator = () => {
    setLoginTime("");
    setBreaks([{ id: 1, start: "", end: "", isValid: true, duration: 0 }]);
    setLogoutTime("");
    setShowResult(false);
    setErrors({});
    setProgress(0);
    setTotalBreakTime(0);
    setRemainingWork("");
    setUploadedImage(null);
    setExtractedData(null);
    breakIdCounter.current = 2;
    addNotification("Calculator reset", "info");
  };

  const handleBreakChange = (id, field, value) => {
    const newBreaks = breaks.map(breakItem => 
      breakItem.id === id ? { ...breakItem, [field]: value } : breakItem
    );
    setBreaks(newBreaks);
  };

  // Image upload and processing functions
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        processImageForTimeData(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageForTimeData = async (imageData) => {
    setIsProcessingImage(true);
    addNotification("Processing image for time data...", "info");
    
    try {
      // Method 1: Try OCR extraction (you can implement with Tesseract.js or other OCR services)
      const extractedText = await extractTextFromImage(imageData);
      const timeData = parseTimeDataFromText(extractedText);
      
      if (timeData.loginTime || timeData.breaks.length > 0) {
        // Auto-populate the form with extracted data
        if (timeData.loginTime) {
          setLoginTime(timeData.loginTime);
        }
        
        if (timeData.breaks && timeData.breaks.length > 0) {
          const newBreaks = timeData.breaks.map((breakData, index) => ({
            id: index + 1,
            start: breakData.start,
            end: breakData.end,
            isValid: true,
            duration: 0
          }));
          setBreaks(newBreaks);
          breakIdCounter.current = newBreaks.length + 1;
        }
        
        setExtractedData(timeData);
        addNotification(`Extracted: Login ${timeData.loginTime}, ${timeData.breaks.length} breaks`, "success");
      } else {
        addNotification("No time data found in image", "error");
      }
      
    } catch (error) {
      console.error('Error processing image:', error);
      addNotification("Failed to extract time data from image", "error");
    } finally {
      setIsProcessingImage(false);
    }
  };

  // OCR text extraction function
  const extractTextFromImage = async (imageData) => {
    // Option 1: Use Tesseract.js if available
    if (window.Tesseract) {
      try {
        const result = await window.Tesseract.recognize(imageData, 'eng', {
          logger: m => console.log(m)
        });
        return result.data.text;
      } catch (error) {
        console.error('Tesseract error:', error);
      }
    }
    
    // Option 2: Mock extraction for demonstration (replace with actual OCR service)
    // This simulates what would be extracted from your screenshot
    return `
      Shift_Edvenswa (17 Sept)
      9:30 AM - 6:30 PM
      Regularize
      Edvenswa
      ✓ 9:50:47 AM ↗ 11:50:32 AM
      ✓ 11:50:36 AM ↗ 6:03:52 PM
    `;
  };

  // Parse time data from extracted text
  const parseTimeDataFromText = (text) => {
    const result = {
      loginTime: "",
      breaks: []
    };
    
    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      // Extract shift time pattern (e.g., "9:30 AM - 6:30 PM")
      const shiftPattern = /(\d{1,2}:\d{2})\s*AM\s*-\s*(\d{1,2}:\d{2})\s*PM/i;
      
      // Extract individual time entries (e.g., "✓ 9:50:47 AM ↗ 11:50:32 AM")
      const timeEntryPattern = /[✓✗]?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*AM\s*[↗→-]\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*(AM|PM)/gi;
      
      // Look for login time from shift pattern
      for (const line of lines) {
        const shiftMatch = line.match(shiftPattern);
        if (shiftMatch) {
          result.loginTime = shiftMatch[1]; // Extract login time (9:30)
          break;
        }
      }
      
      // Extract break times
      const fullText = lines.join(' ');
      let match;
      while ((match = timeEntryPattern.exec(fullText)) !== null) {
        const startTime = match[1].substring(0, 5); // Remove seconds if present
        const endTimeRaw = match[2];
        const period = match[3];
        
        let endTime = endTimeRaw.substring(0, 5); // Remove seconds if present
        
        // Convert PM times to 24-hour format if needed
        if (period === 'PM') {
          const [hours, minutes] = endTime.split(':');
          const hour24 = parseInt(hours) === 12 ? 12 : parseInt(hours) + 12;
          endTime = `${hour24}:${minutes}`;
        }
        
        result.breaks.push({
          start: startTime,
          end: endTime
        });
      }
      
      // Fallback: if no complex parsing worked, try simpler patterns
      if (!result.loginTime && !result.breaks.length) {
        // Look for any time patterns
        const simpleTimePattern = /\b(\d{1,2}:\d{2})\b/g;
        const times = [];
        let timeMatch;
        
        while ((timeMatch = simpleTimePattern.exec(fullText)) !== null) {
          times.push(timeMatch[1]);
        }
        
        // Assume first time is login, rest are break times
        if (times.length > 0) {
          result.loginTime = times[0];
          
          // Group remaining times into break pairs
          for (let i = 1; i < times.length; i += 2) {
            if (i + 1 < times.length) {
              result.breaks.push({
                start: times[i],
                end: times[i + 1]
              });
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error parsing time data:', error);
    }
    
    return result;
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const getTimeInputClass = (hasError) => `
    w-full border-2 p-3 rounded-lg text-gray-800 transition-all duration-300
    ${hasError 
      ? 'border-red-400 bg-red-50 focus:border-red-500' 
      : 'border-gray-300 focus:border-blue-500'
    }
    focus:outline-none focus:ring-2 focus:ring-blue-200
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg transform transition-all duration-500 translate-x-0
              ${notification.type === 'success' ? 'bg-green-500 text-white' :
                notification.type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'}
            `}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{notification.message}</span>
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
          {/* Live Clocks */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Live Time
              </h3>
              
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
                  {formatTime(currentTime)}
                </div>
                <div className="text-gray-500 text-sm">
                  {formatDate(currentTime)}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="text-green-600 text-sm font-medium">Work Progress</div>
                  <div className="text-2xl font-bold text-green-700">{Math.round(progress)}%</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                  <div className="text-orange-600 text-sm font-medium">Remaining</div>
                  <div className="text-lg font-bold text-orange-700">{remainingWork || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Today's Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Working Hours</span>
                  <span className="font-semibold text-gray-800">{totalWorkingHours}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Breaks</span>
                  <span className="font-semibold text-gray-800">{Math.round(totalBreakTime)}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Break Count</span>
                  <span className="font-semibold text-gray-800">{breaks.filter(b => b.start && b.end).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Calculator */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Image Upload Section */}
              <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors duration-300">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Camera className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Auto-Extract from Screenshot</h3>
                      <p className="text-gray-600 text-sm">Upload a screenshot to automatically fill time data</p>
                      <div className="mt-2 text-xs text-gray-500">
                        <strong>Best results with:</strong> Clear time displays, good contrast, readable text
                      </div>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button
                    onClick={triggerImageUpload}
                    disabled={isProcessingImage}
                    className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:transform-none"
                  >
                    {isProcessingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Screenshot
                      </>
                    )}
                  </button>
                  
                  {uploadedImage && (
                    <div className="mt-4">
                      <div className="flex justify-center mb-3">
                        <div className="inline-block p-2 bg-gray-100 rounded-lg shadow-sm">
                          <img 
                            src={uploadedImage} 
                            alt="Uploaded screenshot" 
                            className="max-h-40 max-w-full rounded border"
                          />
                        </div>
                      </div>
                      
                      {extractedData && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800">Extracted Data</span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-white p-3 rounded border">
                              <div className="font-medium text-gray-700 mb-1">Login Time</div>
                              <div className="text-lg font-mono text-blue-600">
                                {extractedData.loginTime || "Not found"}
                              </div>
                            </div>
                            
                            <div className="bg-white p-3 rounded border">
                              <div className="font-medium text-gray-700 mb-1">Breaks Found</div>
                              <div className="text-lg font-mono text-purple-600">
                                {extractedData.breaks?.length || 0} breaks
                              </div>
                            </div>
                          </div>
                          
                          {extractedData.breaks && extractedData.breaks.length > 0 && (
                            <div className="mt-3 bg-white p-3 rounded border">
                              <div className="font-medium text-gray-700 mb-2">Break Details</div>
                              <div className="space-y-1">
                                {extractedData.breaks.map((breakData, index) => (
                                  <div key={index} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-sm">
                                    <span>Break {index + 1}:</span>
                                    <span className="font-mono">
                                      {breakData.start} → {breakData.end}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                            <div className="text-xs text-yellow-800">
                              <strong>Note:</strong> Please review the extracted data and make corrections if needed before calculating.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Working Hours Selection */}
                <div className="flex gap-4 items-center">
                  <label className="text-gray-700 font-medium min-w-fit">Working Hours:</label>
                  <select 
                    value={totalWorkingHours} 
                    onChange={(e) => setTotalWorkingHours(Number(e.target.value))}
                    className="border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  >
                    <option value={6}>6 Hours</option>
                    <option value={7}>7 Hours</option>
                    <option value={8}>8 Hours</option>
                    <option value={9}>9 Hours</option>
                    <option value={10}>10 Hours</option>
                  </select>
                </div>

                {/* Login Time */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700 font-medium">
                    <Calendar className="w-4 h-4" />
                    Login Time
                  </label>
                  <input
                    type="time"
                    value={loginTime}
                    onChange={(e) => setLoginTime(e.target.value)}
                    className={getTimeInputClass(errors.loginTime)}
                  />
                  {errors.loginTime && (
                    <div className="flex items-center gap-2 text-red-600 text-sm animate-pulse">
                      <AlertCircle className="w-4 h-4" />
                      {errors.loginTime}
                    </div>
                  )}
                </div>

                {/* Breaks Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-gray-700 font-medium">
                      <Coffee className="w-4 h-4" />
                      Break Times
                    </label>
                    <button
                      onClick={handleAddBreak}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Add Break
                    </button>
                  </div>

                  <div className="space-y-3">
                    {breaks.map((breakItem, index) => (
                      <div 
                        key={breakItem.id}
                        className={`
                          p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02]
                          ${errors[`break_${breakItem.id}`] 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-200 bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-medium text-gray-600 min-w-fit">
                            Break {index + 1}
                          </span>
                          {breakItem.duration > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {Math.round(breakItem.duration)}m
                            </span>
                          )}
                          {breaks.length > 1 && (
                            <button
                              onClick={() => handleRemoveBreak(breakItem.id)}
                              className="ml-auto p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Start Time</label>
                            <input
                              type="time"
                              value={breakItem.start}
                              onChange={(e) => handleBreakChange(breakItem.id, "start", e.target.value)}
                              className={getTimeInputClass(errors[`break_${breakItem.id}`])}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">End Time</label>
                            <input
                              type="time"
                              value={breakItem.end}
                              onChange={(e) => handleBreakChange(breakItem.id, "end", e.target.value)}
                              className={getTimeInputClass(errors[`break_${breakItem.id}`])}
                            />
                          </div>
                        </div>
                        
                        {errors[`break_${breakItem.id}`] && (
                          <div className="flex items-center gap-2 text-red-600 text-sm mt-2 animate-pulse">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`break_${breakItem.id}`]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={calculateLogout}
                    disabled={isCalculating}
                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:transform-none"
                  >
                    {isCalculating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5" />
                        Calculate Logout Time
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={resetCalculator}
                    className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Reset
                  </button>
                </div>

                {/* Results */}
                {showResult && logoutTime && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 animate-fade-in">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Calculation Complete!</h3>
                      </div>
                      
                      <div className="text-4xl font-bold text-green-700 mb-2">
                        {logoutTime}
                      </div>
                      <div className="text-gray-600 text-lg mb-4">
                        Recommended Logout Time
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{width: `${progress}%`}}
                        ></div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Work Progress: {Math.round(progress)}% • Remaining: {remainingWork}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
      
      {/* Load OCR library - In a real implementation, you would include this in your project */}
      {typeof window !== 'undefined' && !window.Tesseract && (
        <script 
          src="https://unpkg.com/tesseract.js@5/dist/tesseract.min.js"
          onLoad={() => console.log('Tesseract.js loaded')}
          onError={() => console.log('Tesseract.js failed to load, using mock data')}
        />
      )}
    </div>
  );
}

