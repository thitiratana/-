/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SetupProfile, QuestLog, GameStats, SkillStats, CHARACTER_CLASSES, SKILL_METADATA, QuestCategory, QuestDifficulty } from '../types';
import { soundSynth } from '../utils/audio';
import RadarChart from './RadarChart';
import { Calendar, Plus, Trash2, Edit2, Zap, Search, HelpCircle, Trophy, Coins, Award, LogOut, CheckCircle, Flame, Sparkles } from 'lucide-react';

interface DashboardProps {
  profile: SetupProfile;
  logs: QuestLog[];
  stats: GameStats;
  skillStats: SkillStats;
  onAddQuest: (quest: {
    title: string;
    description: string;
    category: QuestCategory;
    difficulty: QuestDifficulty;
    date: string;
  }) => void;
  onDeleteQuest: (id: string) => void;
  onEditQuest: (quest: QuestLog) => void;
  onResetProfile: () => void;
}

// Preset fun co-op student quests suggestions
const QUEST_TEMPLATES = [
  { title: '💻 พัฒนาระบบ Auth ด้วย React' , desc: 'เขียนระบบเข้าสู่ระบบ ป้องกันความปลอดภัยอย่างดีเยี่ยม', category: 'technical', difficulty: 'medium' },
  { title: '🔮 ไขความลับอักขระประหลาด (Debug)', desc: 'ล่าบั๊กที่ยากลำบาก ค้นหาข้อผิดพลาดทางตรรกะคอมพิวเตอร์', category: 'technical', difficulty: 'hard' },
  { title: '🎨 ออกแบบ Figma Prototype คลีนตา', desc: 'จัดช่องไป วบวงอินเตอร์เฟซแถมความสบายตาให้ลูกค้า', category: 'design', difficulty: 'medium' },
  { title: '💬 รายงานความคืบหน้ากิลด์ (Sprint Review)', desc: 'พาสัตว์ร้ายตัวป่วนนำเสนอกลุ่มอาจารย์และหัวหน้าโครงการ', category: 'communication', difficulty: 'easy' },
  { title: '📐 วิเคราะห์สถิติวิศวกรรมข้อมูลรายวัน', desc: 'ดึงข้อมูลพฤติกรรมการเล่นและแปลงข้อมูลดิบให้สวยงาม', category: 'analytical', difficulty: 'hard' },
  { title: '🤝 ช่วยเพื่อนร่วมกิลด์ทบทวน Code (PR Review)', desc: 'ช่วยทีมงานตรวจทานโค้ดเพื่อหลีกเลี่ยงภัยพิบัติบนเซิร์ฟเวอร์', category: 'teamwork', difficulty: 'easy' },
  { title: '💼 วางไทม์ไลน์โครงการฝึกงาน (Gantt Chart)', desc: 'บริหารพลังชีวิตและวันสัมมนาให้ทันกําหนดส่งฉลุย', category: 'business', difficulty: 'medium' },
];

export default function Dashboard({
  profile,
  logs,
  stats,
  skillStats,
  onAddQuest,
  onDeleteQuest,
  onEditQuest,
  onResetProfile,
}: DashboardProps) {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('technical');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('easy');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<QuestCategory | 'all'>('all');
  const [activeChartCategory, setActiveChartCategory] = useState<QuestCategory | null>(null);

  const characterClassMetadata = CHARACTER_CLASSES[profile.characterClass];

  // XP required for next level
  const xpNeeded = stats.level * 500;
  const xpPercentage = Math.min(100, Math.floor((stats.xp / xpNeeded) * 100));

  // Suggest random fun quest text helper
  const handleSuggestQuest = () => {
    soundSynth.playClick();
    const rand = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
    setTitle(rand.title);
    setDescription(rand.desc);
    setCategory(rand.category as QuestCategory);
    setDifficulty(rand.difficulty as QuestDifficulty);
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundSynth.playClick();

    if (!title.trim()) {
      alert('กรุณากรอกชื่องานหรือภารกิจหลัก!');
      return;
    }

    if (editingId) {
      // Create recalculated log
      const levelFactor = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
      const originalLog = logs.find((l) => l.id === editingId);
      if (originalLog) {
        onEditQuest({
          ...originalLog,
          title,
          description,
          category,
          difficulty,
          xpGained: levelFactor * 100,
          goldGained: levelFactor * 50,
          date,
        });
      }
      setEditingId(null);
    } else {
      onAddQuest({
        title,
        description,
        category,
        difficulty,
        date,
      });
    }

    // Reset Form fields
    setTitle('');
    setDescription('');
    setDifficulty('easy');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Click edit handler
  const handleStartEdit = (log: QuestLog) => {
    soundSynth.playClick();
    setEditingId(log.id);
    setTitle(log.title);
    setDescription(log.description);
    setCategory(log.category);
    setDifficulty(log.difficulty);
    setDate(log.date);
  };

  const handleCancelEdit = () => {
    soundSynth.playClick();
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDifficulty('easy');
  };

  const handleResetConfirm = () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการเริ่มตัวละครใหม่? ข้อมูลสเตตัสระดับและบันทึกทั้งหมดจะถูกรีเซ็ตอย่างถาวร!')) {
      onResetProfile();
    }
  };

  // Filter logs list based on search and selected filter
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());

    const chosenCat = activeChartCategory !== null ? activeChartCategory : categoryFilter;
    const matchesCategory = chosenCat === 'all' || chosenCat === null ? true : log.category === chosenCat;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 py-6 max-w-7xl mx-auto font-sans bg-slate-50 text-slate-800 rounded-3xl min-h-[80vh]">
      {/* 1. Left hand: Hero Profile Info, Character Avatar & Skill Radar Stats (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* CHARACTER STAT CARD */}
        <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          {/* Neon side border indicating class color */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{ backgroundColor: characterClassMetadata.color }}
          />

          <div className="flex items-start gap-4">
            {/* Avatar block */}
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl p-1 flex-shrink-0 flex items-center justify-center relative shadow-sm">
              <div
                className="w-12 h-12"
                dangerouslySetInnerHTML={{ __html: characterClassMetadata.avatarSvg }}
              />
              {/* Level indicator badge */}
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 border border-white text-white font-mono text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                {stats.level}
              </div>
            </div>

            {/* Profile Text */}
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-slate-900 truncate flex items-center gap-1.5 leading-tight">
                {profile.studentName}
              </h2>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none mt-1">
                🛡️ {characterClassMetadata.nameTh.split(' (')[0]}
              </p>
              <div className="mt-2 space-y-1 text-xs text-slate-600 font-medium">
                <p className="truncate">🏰 {profile.companyName}</p>
                <p className="truncate text-slate-400">🎯 {profile.role}</p>
              </div>
            </div>
          </div>

          {/* XP & Level Progress Bar */}
          <div className="mt-5 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 animate-pulse" /> EXP PROGRESS
              </span>
              <span className="font-mono text-slate-700">
                {stats.xp} / {xpNeeded} XP ({xpPercentage}%)
              </span>
            </div>
            {/* Energy bar container */}
            <div className="h-4 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden p-0.5 relative">
              <div
                className="h-full bg-indigo-650 rounded-sm transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${xpPercentage}%` }}
              >
                {xpPercentage > 25 && (
                  <span className="text-[9px] font-black text-white font-mono">
                    Lvl {stats.level}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Secondary stats counters (Gold, Completed Quests) */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-[10.5px] font-bold text-slate-600 font-sans">เหรียญทอง</span>
              </div>
              <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-205/30">
                {stats.gold} G
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                <span className="text-[10.5px] font-bold text-slate-600 font-sans">เควสสำเร็จ</span>
              </div>
              <span className="font-mono text-xs font-black text-emerald-750 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-205/30">
                {logs.length}
              </span>
            </div>
          </div>

          {/* Reset character btn */}
          <button
            onClick={handleResetConfirm}
            className="w-full mt-4 py-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-[10.5px] uppercase font-bold tracking-widest text-slate-500 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> รีเซ็ตตัวละครใหม่
          </button>
        </div>

        {/* RADAR CHART COMPONENT */}
        <RadarChart
          stats={skillStats}
          activeCategory={activeChartCategory}
          onSelectCategory={(cat) => {
            soundSynth.playClick();
            setActiveChartCategory(cat);
          }}
        />
      </div>

      {/* 2. Middle & Right: Quest Logging and History Lists (8 cols) */}
      <div className="lg:col-span-8 space-y-6">

        {/* QUEST CREATION FORM */}
        <div className="bg-white border border-slate-205 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                📜 {editingId ? '⚡ EDIT QUEST LOG (แก้ไขภารกิจหลัก)' : '⚔️ REGISTER NEW QUEST (บันทึกเควสประจำวัน)'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                เติมพลังงานให้เลเวลเติบโตด้วยการเขียนงานลงบันทึกอนุทินที่ทำเสร็จในวันนี้
              </p>
            </div>
            
            {!editingId && (
              <button
                type="button"
                onClick={handleSuggestQuest}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-[11px] font-sans font-bold text-indigo-700 rounded-xl transition-all cursor-pointer flex items-center gap-1 outline-none self-start sm:self-center"
              >
                🔮 สุ่มงานยอดนิยม
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Task Name */}
              <div className="md:col-span-8 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  ชื่องาน / เควสภารกิจหลัก
                </label>
                <input
                  type="text"
                  placeholder="เช่น เขียนโค้ดปรับแก้ระบบ CSS, เข้าตู้ประชุม Agile Standup ..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-805 rounded-xl text-xs sm:text-sm outline-none transition-all"
                  required
                />
              </div>

              {/* Task Date */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  วันที่ปฏิบัติงาน
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-805 rounded-xl text-xs sm:text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="col-span-1 md:col-span-6 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  หมวดหมู่ทักษะหลักที่เน้นซ้อม
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as QuestCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-805 rounded-xl text-xs sm:text-sm outline-none transition-all"
                >
                  {Object.entries(SKILL_METADATA).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {key === 'technical' && '🔮 '}
                      {key === 'design' && '🎨 '}
                      {key === 'communication' && '💬 '}
                      {key === 'analytical' && '📐 '}
                      {key === 'teamwork' && '🤝 '}
                      {key === 'business' && '💼 '}
                      {meta.labelTh.split(' (')[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty selector */}
              <div className="col-span-1 md:col-span-6 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  ระดับความยากของภารกิจ (คิดคูณสเตตัส XP / Gold)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as QuestDifficulty[]).map((dif) => {
                    const isSelected = difficulty === dif;
                    let difLabel = '';
                    let difColor = '';
                    switch (dif) {
                      case 'easy':
                        difLabel = '⭐ ง่าย (+100)';
                        difColor = isSelected ? 'bg-emerald-50 border-emerald-555 text-emerald-800' : 'bg-slate-50 text-slate-555 border-slate-200';
                        break;
                      case 'medium':
                        difLabel = '⭐⭐ ปานกลาง (+200)';
                        difColor = isSelected ? 'bg-amber-50 border-amber-555 text-amber-800' : 'bg-slate-50 text-slate-555 border-slate-200';
                        break;
                      case 'hard':
                        difLabel = '⭐⭐⭐ ยากมาก (+300)';
                        difColor = isSelected ? 'bg-rose-50 border-rose-555 text-rose-800' : 'bg-slate-50 text-slate-555 border-slate-200';
                        break;
                    }

                    return (
                      <button
                        key={dif}
                        type="button"
                        onClick={() => {
                          soundSynth.playClick();
                          setDifficulty(dif);
                        }}
                        className={`py-2 px-1 text-[10px] sm:text-xs font-bold border rounded-xl text-center cursor-pointer transition-all ${difColor}`}
                      >
                        {difLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Details Text */}
              <div className="col-span-1 md:col-span-12 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  รายละเอียดการผจญภัยงานสั้น ๆ (สำหรับสรุปทำเล่มส่งอาจารย์)
                </label>
                <textarea
                  placeholder="เขียนอธิบายบทเรียน เทคโนโลยี ความล้มเหลว หรือวิธีการแก้จุดขัดข้องให้เรียบร้อย..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-805 rounded-xl text-xs sm:text-sm outline-none transition-all resize-none font-sans"
                />
              </div>

            </div>

            {/* Submit Action items */}
            <div className="pt-2 flex justify-end gap-3 font-sans">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl border border-slate-200 text-xs transition-all cursor-pointer outline-none"
                >
                  ยกเลิกแก้ไข
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-sm text-xs uppercase cursor-pointer"
              >
                {editingId ? '⚡ อัปเดตเควส' : '⚔️ บันทึกสำเร็จภารกิจประจำวัน'}
              </button>
            </div>
          </form>
        </div>

        {/* QUEST LIST WITH FILTERS */}
        <div className="bg-white border border-slate-205 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                ⚔️ QUEST LOG HISTORY (ตารางการผจญภัยย้อนหลัง)
              </h3>
              {activeChartCategory ? (
                <p className="text-xs text-indigo-700 mt-1 flex items-center gap-1.5">
                  🔍 ฟิลเตอร์หมวดเฉพาะ: {SKILL_METADATA[activeChartCategory].labelTh.split(' (')[0]}
                  <button
                    onClick={() => setActiveChartCategory(null)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline bg-slate-50 px-2 py-0.5 rounded-md border border-slate-205 cursor-pointer font-medium"
                  >
                    แสดงทั้งหมด
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  ส่องดูสเตตัสงานที่คุณทำสำเร็จ พร้อมรางวัลที่ถูกสะสมอย่างงดงาม
                </p>
              )}
            </div>

            {/* Small Filters and Search Input */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
              {/* Search box */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหางาน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 text-xs rounded-xl outline-none transition-all font-sans"
                />
              </div>

              {!activeChartCategory && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as QuestCategory | 'all')}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 text-slate-650 text-xs rounded-xl outline-none font-sans cursor-pointer focus:border-indigo-500"
                >
                  <option value="all">กรองความสามารถทั้งหมด</option>
                  {Object.entries(SKILL_METADATA).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.labelTh.split(' (')[0]}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Logs List render */}
          <div className="space-y-3.5">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <CheckCircle className="w-10 h-10 text-slate-650 mx-auto mb-2 opacity-30" />
                <p className="text-slate-500 text-xs font-bold font-sans">ยังไม่มีข้อมูลภารกิจที่ตรงกับการค้นหาของคุณ</p>
                <p className="text-slate-400 text-[10px] mt-1 font-sans">บันทึกภารกิจแรกเพื่อเริ่มสะสมแถบพลังงาน XP และเหรียญทองเลย!</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const skillMeta = SKILL_METADATA[log.category];

                // Badge colors for difficulties
                let difficultyBadge = '';
                switch (log.difficulty) {
                  case 'easy':
                    difficultyBadge = 'text-emerald-700 border-emerald-200 bg-emerald-50';
                    break;
                  case 'medium':
                    difficultyBadge = 'text-amber-700 border-amber-200 bg-amber-50';
                    break;
                  case 'hard':
                    difficultyBadge = 'text-rose-700 border-rose-200 bg-rose-50';
                    break;
                }

                return (
                  <div
                    key={log.id}
                    className="border border-slate-200 bg-white rounded-xl p-4 transition-all hover:border-slate-300 hover:shadow-xs group relative overflow-hidden"
                  >
                    {/* Visual accent left side bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: skillMeta.color }}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Quest metadata and context texts */}
                      <div className="space-y-1.5 flex-1 min-w-0 pl-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md text-white border"
                            style={{
                              backgroundColor: skillMeta.color,
                              borderColor: `${skillMeta.color}35`,
                            }}
                          >
                            {log.category === 'technical' && '🔮 เทคนิคคอล'}
                            {log.category === 'design' && '🎨 ดีไซน์'}
                            {log.category === 'communication' && '💬 สื่อสาร'}
                            {log.category === 'analytical' && '📐 วิเคราะห์'}
                            {log.category === 'teamwork' && '🤝 ร่วมมือ'}
                            {log.category === 'business' && '💼 แผนงาน'}
                          </span>
                          
                          <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-md border ${difficultyBadge}`}>
                            {log.difficulty === 'easy' && 'ง่าย (Easy)'}
                            {log.difficulty === 'medium' && 'ปานกลาง (Medium)'}
                            {log.difficulty === 'hard' && 'ยากมาก (Hard)'}
                          </span>

                          <span className="text-[10.5px] text-slate-400 font-mono flex items-center gap-1 ml-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-350" />
                            {log.date}
                          </span>

                          <span className="text-[10px] font-bold text-amber-700 border border-amber-200 bg-amber-50 px-1.5 py-0.5 rounded">
                            สัปดาห์ที่ {log.weekNumber}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                          {log.title}
                        </h4>

                        {log.description && (
                          <p className="text-xs text-slate-600 font-sans leading-relaxed whitespace-pre-line mt-1">
                            {log.description}
                          </p>
                        )}
                      </div>

                      {/* Right: Quest Rewards stats outputs & Actions */}
                      <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        {/* Rewards badges */}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            +{log.xpGained} XP
                          </span>
                          <span className="inline-flex items-center gap-0.5 font-mono text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            +{log.goldGained} G
                          </span>
                        </div>

                        {/* Edit & Delete Action indicators */}
                        <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(log)}
                            className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-650 rounded-lg border border-slate-200 transition-colors cursor-pointer text-[10px] outline-none flex items-center gap-1"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3 h-3" /> แก้ไข
                          </button>
                          <button
                            onClick={() => {
                              soundSynth.playClick();
                              if (confirm('กรุณายืนยันการละทิ้งภารกิจนี้? XP และเหรียญทองจะถูกยึดคืนตามสัดส่วน')) {
                                onDeleteQuest(log.id);
                              }
                            }}
                            className="p-1 px-2.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 hover:border-rose-300 transition-colors cursor-pointer text-[10px] outline-none flex items-center gap-1"
                            title="ลบ"
                          >
                            <Trash2 className="w-3 h-3" /> ลบ
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
