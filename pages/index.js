import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import moment from 'moment-jalaali';
import * as THREE from 'three';

export default function Home() {
  const [zodiacs, setZodiacs] = useState([]);
  const [selectedZodiac, setSelectedZodiac] = useState('حمل');
  const [currentPersianDate, setCurrentPersianDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [horoscope, setHoroscope] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [points, setPoints] = useState(0);
  const [todayRead, setTodayRead] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const mountRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    const hour = new Date().getHours();
    setIsNightMode(hour >= 18 || hour < 6);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 4000; i++) {
      vertices.push((Math.random() - 0.5) * 2000);
      vertices.push((Math.random() - 0.5) * 2000);
      vertices.push((Math.random() - 0.5) * 2000);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 1000;

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      particles.rotation.y += 0.0003;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [isLoading, isNightMode]);

  useEffect(() => {
    fetch('/horoscopes.json')
      .then(res => res.json())
      .then(data => setZodiacs(data.zodiacs));
    const today = moment();
    const persianDateStr = today.format('jYYYY-jMM-jDD');
    setCurrentPersianDate(persianDateStr);
    setSelectedDate(persianDateStr);
  }, []);

  useEffect(() => {
    if (zodiacs.length > 0 && selectedDate) {
      const zodiacData = zodiacs.find(z => z.name === selectedZodiac);
      if (zodiacData && zodiacData.daily.length > 0) {
        const daily = zodiacData.daily.find(d => d.date === selectedDate);
        if (daily) {
          setHoroscope(daily);
        } else {
          const todayDaily = zodiacData.daily.find(d => d.date === currentPersianDate);
          setHoroscope(todayDaily || zodiacData.daily[0]);
        }
      }
    }
  }, [selectedZodiac, selectedDate, zodiacs, currentPersianDate]);

  const toPersianNumber = (num) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (d) => persianDigits[d]);
  };

  const getPersianWeekDay = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const jDate = moment(`${parts[0]}/${parts[1]}/${parts[2]}`, 'jYYYY/jMM/jDD');
    const weekDays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    return weekDays[jDate.day()];
  };

  const playAudio = () => {
    const text = document.getElementById('horoscope-text').textContent;
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fa-IR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const changeDate = (offset) => {
    const currentMoment = moment(selectedDate, 'jYYYY-jMM-jDD');
    const newDate = currentMoment.add(offset, 'days').format('jYYYY-jMM-jDD');
    setSelectedDate(newDate);
  };

  return (
    <div className={`min-h-screen text-white p-4 font-sans transition-colors duration-500 ${isNightMode ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-200'}`} dir="rtl">
      <Head>
        <title>فال و راز | پیش‌بینی و تحلیل با هوش مصنوعی</title>
        <meta name="description" content="فال روزانه، تطابق عشقی، کف‌شناسی و مشاوره ستاره‌شناسی با هوش مصنوعی به زبان فارسی" />
      </Head>

      <div ref={mountRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />

      {isLoading && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${isNightMode ? 'bg-slate-900' : 'bg-white'}`}>
          <div className="w-24 h-24 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mb-4" />
          <h1 className={`text-3xl font-bold ${isNightMode ? 'text-white' : 'text-purple-800'}`}>🔮 فال و راز</h1>
          <p className="text-gray-500 mt-2">در حال آماده‌سازی آسمان...</p>
        </div>
      )}

      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🔮</span>
          <h1 className={`text-2xl font-bold ${isNightMode ? 'text-white' : 'text-purple-900'}`}>فال و راز</h1>
        </div>
        <button onClick={() => setIsProfileOpen(true)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 text-xl">👤</button>
      </header>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {zodiacs.map(z => (
          <button
            key={z.id}
            onClick={() => setSelectedZodiac(z.name)}
            className={`px-3 py-1 rounded-full border transition-all text-sm ${selectedZodiac === z.name ? 'bg-purple-600 border-yellow-400 shadow-lg' : 'bg-gray-800/50 border-gray-600'}`}
          >
            {z.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 mb-6 bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/10 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <button onClick={() => changeDate(-1)} className="bg-purple-700/50 p-1 rounded-md">◀</button>
          <input type="text" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-center w-32 text-sm focus:border-purple-400 outline-none" />
          <button onClick={() => changeDate(1)} className="bg-purple-700/50 p-1 rounded-md">▶</button>
        </div>
        <span className="text-xs text-gray-400">{toPersianNumber(selectedDate)} - {getPersianWeekDay(selectedDate)}</span>
        <button onClick={() => setSelectedDate(currentPersianDate)} className="text-xs bg-blue-800/60 px-2 py-0.5 rounded-full">بازگشت به امروز</button>
      </div>

      {horoscope && (
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 mb-6">
          <h2 className="text-xl font-bold text-yellow-300 mb-2">فال امروز {selectedZodiac}</h2>
          <p id="horoscope-text" className="text-sm leading-relaxed mb-4 text-gray-100">{horoscope.text}</p>
          <div className="grid grid-cols-2 gap-2 text-xs bg-black/30 p-3 rounded-xl">
            <div>🔢 عدد: <span className="text-yellow-300 font-bold">{horoscope.lucky_number || '--'}</span></div>
            <div>🎨 رنگ: <span style={{color: horoscope.lucky_color}}>{horoscope.lucky_color || '--'}</span></div>
            <div>🧭 جهت: <span className="text-cyan-300">{horoscope.lucky_direction || '--'}</span></div>
            <div>⏰ زمان: <span className="text-green-300">{horoscope.best_time || '--'}</span></div>
            <div className="col-span-2">💎 سنگ: <span className="text-pink-300">{horoscope.gemstone || '--'}</span></div>
          </div>
          <button onClick={playAudio} className="mt-3 w-full py-2 bg-purple-700/80 hover:bg-purple-600 rounded-xl text-sm flex justify-center items-center gap-2">🎧 گوش دادن</button>
        </div>
      )}

      <footer className="text-center text-gray-400 text-[10px] mt-6 p-2">
        ✨ ساخته شده با هوش مصنوعی برای شما ✨
      </footer>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl p-6 border border-white/10 shadow-2xl">
            <button onClick={() => setIsProfileOpen(false)} className="float-left text-gray-400 hover:text-white text-2xl">✕</button>
            <h2 className="text-2xl font-bold text-white mb-4">👤 پروفایل کاربری</h2>
            <div className="bg-white/10 p-3 rounded-xl text-center mb-4">
              <p className="text-yellow-300 text-xl font-bold">⭐ {toPersianNumber(points)} امتیاز</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-purple-500/30 mb-4">
              <h3 className="text-lg font-bold text-white mb-2">🤝 دعوت از دوستان</h3>
              <div className="flex gap-2">
                <input type="text" value="https://faloraz.ir/ref/USER123" readOnly className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm outline-none" />
                <button className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white text-sm font-bold">کپی لینک</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
      }
