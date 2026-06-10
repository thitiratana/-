/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CHARACTER_CLASSES, CharacterClass, SetupProfile } from '../types';
import { soundSynth } from '../utils/audio';
import { Sparkles, ArrowRight, NotebookPen, Briefcase, Calendar } from 'lucide-react';

interface SetupFormProps {
  onComplete: (profile: SetupProfile) => void;
}

export default function SetupForm({ onComplete }: SetupFormProps) {
  const [studentName, setStudentName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('wizard');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundSynth.playClick();

    if (!studentName.trim()) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุล ของนักศึกษา');
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg('กรุณากรอกชื่อบริษัทหรือสถานประกอบการ');
      return;
    }
    if (!role.trim()) {
      setErrorMsg('กรุณากรอกตำแหน่งงานฝึกสอนสหกิจศึกษา');
      return;
    }
    if (!startDate) {
      setErrorMsg('กรุณาระบุวันที่เริ่มต้นการฝึกงาน');
      return;
    }
    if (!endDate) {
      setErrorMsg('กรุณาระบุวันที่สิ้นสุดการฝึกงาน');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('วันที่เริ่มต้นต้องอยู่ก่อนวันที่สิ้นสุดการฝึกงาน');
      return;
    }

    onComplete({
      studentName,
      companyName,
      role,
      startDate,
      endDate,
      characterClass: selectedClass,
      avatarId: selectedClass,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Intro visual banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3.5 bg-indigo-600 rounded-2xl shadow-md mb-4 animate-bounce">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          🚀 CO-OP QUEST COMPANION
        </h1>
        <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto font-sans">
          ยินดีต้อนรับสู่อู่อภิบาลสหกิจศึกษา! เปลี่ยนบันทึกความจำวันอันแสนน่าเบื่อให้กลายเป็นบอร์ดเกมสะสมแต้ม XP ออกผจญภัยในชีวิตการฝึกงานอย่างเฉียบคม
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 text-slate-800"
      >
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-indigo-650 font-display flex items-center gap-2">
            👤 Character Register (ข้อมูลตัวละครและระยะเวลาผจญภัย)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ข้อมูลสำหรับการกรอกหน้าเล่มรายงานและตั้งค่าตัวตนหลัก
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-750 text-xs py-2.5 px-4 rounded-xl flex items-center gap-2">
            ⚠️ <span className="font-sans">{errorMsg}</span>
          </div>
        )}

        {/* Input grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <NotebookPen className="w-3.5 h-3.5 text-indigo-500" /> ชื่อ-นามสกุล นักศึกษา
            </label>
            <input
              type="text"
              placeholder="เช่น นายปราชญ์ รหัสเทวะ"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> ชื่อสถานประกอบการ / บริษัท
            </label>
            <input
              type="text"
              placeholder="เช่น บริษัท อะเมซิ่ง เทคโนโลยี จำกัด"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              💡 ตำแหน่งงาน / ขอบข่ายหน้าที่หลัก
            </label>
            <input
              type="text"
              placeholder="เช่น Full-Stack Developer Intern, Graphic Designer trainee"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-550" /> วันที่เริ่มต้นฝึกงาน
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-550" /> วันที่สิ้นสุดฝึกงาน
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white text-slate-900 rounded-xl text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Character Class Selector */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800 font-display">
              ⚔️ CHOOSE YOUR CLASS (เลือกสายวิชาชีพตัวละคร)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              เลือกเผ่าคลาสตั้งต้นที่สะท้อนถึงตำแหน่งหรือแนวทางทักษะของคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(CHARACTER_CLASSES).map((item) => {
              const isSelected = selectedClass === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundSynth.playClick();
                    setSelectedClass(item.id);
                  }}
                  className={`cursor-pointer rounded-2xl border p-4 text-center transition-all flex flex-col items-center select-none ${
                    isSelected
                      ? `bg-indigo-50/50 border-indigo-500 ring-2 ring-indigo-500/20`
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {/* Styled Avatar Holder */}
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl p-1 mb-3 flex items-center justify-center">
                    <div
                      className="w-12 h-12"
                      dangerouslySetInnerHTML={{ __html: item.avatarSvg }}
                    />
                  </div>

                  <h4
                    className={`text-xs font-bold font-sans tracking-wide leading-tight ${
                      isSelected ? 'text-indigo-650' : 'text-slate-700'
                    }`}
                  >
                    {item.nameTh.split(' (')[0]}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase block">
                    {item.nameEn}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detailed description of selected Class */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h5 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">
              คำอธิบายความสามารถ:
            </h5>
            <p className="text-xs text-slate-650 font-sans leading-relaxed">
              {CHARACTER_CLASSES[selectedClass].description}
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-[10.5px]">
              <span className="text-indigo-600 font-bold">✨ ทักษะเด่นเริ่มต้น:</span>
              <span className="text-slate-600 font-medium">
                {selectedClass === 'wizard' && '🔮 การเขียนโค้ดและพัฒนาระบบเชิงลึก'}
                {selectedClass === 'rogue' && '🎨 การออกแบบส่วนหน้า ความคิดสุนทรียภาพ'}
                {selectedClass === 'paladin' && '💬 การสื่อสาร นำเสนอ และเชื่อมประสานกระบวนการ'}
                {selectedClass === 'ranger' && '📐 ตรรกะความคิด ค้นหาบั๊ก ยุทธศาสตร์และการวิเคราะห์'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 block">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold font-display rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all uppercase tracking-wider text-sm cursor-pointer mx-auto"
          >
            สร้างตัวละคร &amp; เริ่มเดินทาง
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
