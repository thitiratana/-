/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SetupProfile, QuestLog, GameStats, SkillStats, CHARACTER_CLASSES } from './types';
import { soundSynth } from './utils/audio';
import SetupForm from './components/SetupForm';
import Dashboard from './components/Dashboard';
import Exporter from './components/Exporter';
import { LevelUpOverlay, MiniBurst } from './components/Particles';
import { Sparkles, BarChart2, FileText, Settings, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

export default function App() {
  // Application view states
  const [profile, setProfile] = useState<SetupProfile | null>(null);
  const [logs, setLogs] = useState<QuestLog[]>([]);
  const [stats, setStats] = useState<GameStats>({ level: 1, xp: 0, gold: 0 });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exporter'>('dashboard');

  // Sound toggle state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Overlay state for Level up celebrations
  const [levelUpForOverlay, setLevelUpForOverlay] = useState<number | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('coop_adventure_profile_v2');
      const storedLogs = localStorage.getItem('coop_adventure_logs_v2');
      const storedStats = localStorage.getItem('coop_adventure_stats_v2');

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
    }
  }, []);

  // Update sound synth enabled state immediately
  useEffect(() => {
    soundSynth.enabled = soundEnabled;
  }, [soundEnabled]);

  // Handle character Register creation
  const handleSetupComplete = (newProfile: SetupProfile) => {
    setProfile(newProfile);
    localStorage.setItem('coop_adventure_profile_v2', JSON.stringify(newProfile));

    // Reset stats & log history when creating a brand new character class
    const initialStats = { level: 1, xp: 0, gold: 0 };
    setStats(initialStats);
    setLogs([]);
    localStorage.setItem('coop_adventure_stats_v2', JSON.stringify(initialStats));
    localStorage.setItem('coop_adventure_logs_v2', JSON.stringify([]));

    // Play fanfare chime
    soundSynth.playLevelUp();
  };

  // Switch sound setting
  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundSynth.enabled = nextVal;
    if (nextVal) {
      soundSynth.playClick();
    }
  };

  // Add new Daily Quest log
  const handleAddQuest = (newQuest: {
    title: string;
    description: string;
    category: any;
    difficulty: any;
    date: string;
  }) => {
    if (!profile) return;

    // Calculate XP and Gold rewards base on difficulty
    const levelFactor = newQuest.difficulty === 'easy' ? 1 : newQuest.difficulty === 'medium' ? 2 : 3;
    const xpGained = levelFactor * 100;
    const goldGained = levelFactor * 50;

    // Calculate Week Number
    let weekNumber = 1;
    if (profile.startDate) {
      const start = new Date(profile.startDate);
      const taskDate = new Date(newQuest.date);
      const diffTime = taskDate.getTime() - start.getTime();
      if (diffTime > 0) {
        weekNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
      }
    }

    const log: QuestLog = {
      id: crypto.randomUUID(),
      title: newQuest.title,
      description: newQuest.description,
      category: newQuest.category,
      difficulty: newQuest.difficulty,
      xpGained,
      goldGained,
      date: newQuest.date,
      weekNumber: weekNumber < 1 ? 1 : weekNumber,
    };

    const updatedLogs = [log, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('coop_adventure_logs_v2', JSON.stringify(updatedLogs));

    // Trigger synth retro success chime
    soundSynth.playQuestComplete();

    // Sum details & check for Level up
    let currentXp = stats.xp + xpGained;
    let currentLevel = stats.level;
    let currentGold = stats.gold + goldGained;
    let didLevelUp = false;

    // L-to-L+1 required points = L * 500
    let nextLevelXpNeeded = currentLevel * 500;
    while (currentXp >= nextLevelXpNeeded) {
      currentXp -= nextLevelXpNeeded;
      currentLevel += 1;
      nextLevelXpNeeded = currentLevel * 500;
      didLevelUp = true;
    }

    const updatedStats = {
      level: currentLevel,
      xp: currentXp,
      gold: currentGold,
    };
    setStats(updatedStats);
    localStorage.setItem('coop_adventure_stats_v2', JSON.stringify(updatedStats));

    if (didLevelUp) {
      setLevelUpForOverlay(currentLevel);
    }
  };

  // Delete Quest log
  const handleDeleteQuest = (id: string) => {
    const updatedLogs = logs.filter((l) => l.id !== id);
    setLogs(updatedLogs);
    localStorage.setItem('coop_adventure_logs_v2', JSON.stringify(updatedLogs));

    // Recalculate stats chronologically to avoid any bugs
    const sortedChrono = [...updatedLogs].reverse(); // oldest to newest
    let currentLevel = 1;
    let currentXp = 0;
    let currentGold = 0;

    sortedChrono.forEach((l) => {
      currentGold += l.goldGained;
      let nextLevelXpNeeded = currentLevel * 500;
      currentXp += l.xpGained;
      while (currentXp >= nextLevelXpNeeded) {
        currentXp -= nextLevelXpNeeded;
        currentLevel += 1;
        nextLevelXpNeeded = currentLevel * 500;
      }
    });

    const updatedStats = {
      level: currentLevel,
      xp: currentXp,
      gold: currentGold,
    };
    setStats(updatedStats);
    localStorage.setItem('coop_adventure_stats_v2', JSON.stringify(updatedStats));
  };

  // Edit Quest Log details
  const handleEditQuest = (updatedLog: QuestLog) => {
    const updatedLogs = logs.map((l) => (l.id === updatedLog.id ? updatedLog : l));
    setLogs(updatedLogs);
    localStorage.setItem('coop_adventure_logs_v2', JSON.stringify(updatedLogs));

    // Chronologically recalculate levels and gold accumulated
    const sortedChrono = [...updatedLogs].reverse();
    let currentLevel = 1;
    let currentXp = 0;
    let currentGold = 0;

    sortedChrono.forEach((l) => {
      currentGold += l.goldGained;
      let nextLevelXpNeeded = currentLevel * 500;
      currentXp += l.xpGained;
      while (currentXp >= nextLevelXpNeeded) {
        currentXp -= nextLevelXpNeeded;
        currentLevel += 1;
        nextLevelXpNeeded = currentLevel * 500;
      }
    });

    const updatedStats = {
      level: currentLevel,
      xp: currentXp,
      gold: currentGold,
    };
    setStats(updatedStats);
    localStorage.setItem('coop_adventure_stats_v2', JSON.stringify(updatedStats));
  };

  // Full hard clear / restart character flow
  const handleResetProfile = () => {
    localStorage.removeItem('coop_adventure_profile_v2');
    localStorage.removeItem('coop_adventure_logs_v2');
    localStorage.removeItem('coop_adventure_stats_v2');
    setProfile(null);
    setLogs([]);
    setStats({ level: 1, xp: 0, gold: 0 });
    setActiveTab('dashboard');
  };

  // Dynamically compute student skills from logs securely
  const getComputedSkillStats = (): SkillStats => {
    const base: SkillStats = {
      technical: 0,
      design: 0,
      communication: 0,
      analytical: 0,
      teamwork: 0,
      business: 0,
    };

    if (profile) {
      const metadata = CHARACTER_CLASSES[profile.characterClass];
      if (metadata) {
        // Base starting boost points for selected guild class
        base[metadata.primarySkill] = 3;
      }
    }

    logs.forEach((log) => {
      const points = log.difficulty === 'easy' ? 1 : log.difficulty === 'medium' ? 2 : 3;
      base[log.category] = (base[log.category] || 0) + points;
    });

    return base;
  };

  const computedSkills = getComputedSkillStats();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-905 pb-12 transition-all">
      
      {/* 1. Global Navigation Frame (hidden on print view automatically) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 no-print">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-indigo-600 rounded-xl text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-display font-extrabold text-sm sm:text-base text-slate-900 leading-tight tracking-tight">
                CO-OP QUEST DIARY
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">บันทึกความสามารถ &amp; สรุปเล่มรายงานวิชาการ</p>
            </div>
          </div>

          {/* Sound & Navigation controls (Only visible if profile exists) */}
          <div className="flex items-center gap-3">
            {profile && (
              <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-200 gap-1 sm:gap-1.5">
                <button
                  onClick={() => {
                    soundSynth.playClick();
                    setActiveTab('dashboard');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-650 text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ตารางผจญภัย</span>
                </button>

                <button
                  onClick={() => {
                    soundSynth.playClick();
                    setActiveTab('exporter');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'exporter'
                      ? 'bg-indigo-655 text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">รายงานสหกิจ</span>
                </button>
              </div>
            )}

            {/* Retro Sound Switch */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Page Render Engine */}
      <main className="transition-all duration-300">
        {!profile ? (
          // Character Setup Stage
          <SetupForm onComplete={handleSetupComplete} />
        ) : activeTab === 'dashboard' ? (
          // Main interactive Game Dashboard view
          <Dashboard
            profile={profile}
            logs={logs}
            stats={stats}
            skillStats={computedSkills}
            onAddQuest={handleAddQuest}
            onDeleteQuest={handleDeleteQuest}
            onEditQuest={handleEditQuest}
            onResetProfile={handleResetProfile}
          />
        ) : (
          // Export report manager view
          <Exporter profile={profile} logs={logs} />
        )}
      </main>

      {/* 3. Level-Up Celebration modal popup overlay */}
      {levelUpForOverlay !== null && (
        <LevelUpOverlay
          level={levelUpForOverlay}
          onClose={() => setLevelUpForOverlay(null)}
        />
      )}
    </div>
  );
}
