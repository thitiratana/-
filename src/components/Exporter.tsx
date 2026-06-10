/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SetupProfile, QuestLog, SKILL_METADATA } from '../types';
import { soundSynth } from '../utils/audio';
import { Printer, Copy, Check, BookOpen, Download, FileSpreadsheet, Save, GraduationCap, ClipboardCheck, Award, FileDown, X } from 'lucide-react';

interface ExporterProps {
  profile: SetupProfile;
  logs: QuestLog[];
}

export default function Exporter({ profile, logs }: ExporterProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [copied, setCopied] = useState(false);

  // Local state for reflections (student)
  const [reflectionLearned, setReflectionLearned] = useState(() => {
    return localStorage.getItem(`coop_reflection_learned_${profile.studentName}`) || '';
  });
  const [reflectionProblems, setReflectionProblems] = useState(() => {
    return localStorage.getItem(`coop_reflection_problems_${profile.studentName}`) || '';
  });

  // Local state for evaluations (officer)
  const [evalSupervisor, setEvalSupervisor] = useState(() => {
    return localStorage.getItem(`coop_eval_supervisor_${profile.studentName}`) || '';
  });
  const [evalScore, setEvalScore] = useState(() => {
    return localStorage.getItem(`coop_eval_score_${profile.studentName}`) || '';
  });
  const [evalVerdict, setEvalVerdict] = useState(() => {
    return localStorage.getItem(`coop_eval_verdict_${profile.studentName}`) || 'pass';
  });
  const [evaluatorName, setEvaluatorName] = useState(() => {
    return localStorage.getItem(`coop_evaluator_name_${profile.studentName}`) || '';
  });
  const [advisorName, setAdvisorName] = useState(() => {
    return localStorage.getItem(`coop_advisor_name_${profile.studentName}`) || '';
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPdfGuide, setShowPdfGuide] = useState(false);

  const handleDownloadPdfClick = () => {
    soundSynth.playClick();
    setShowPdfGuide(true);
  };

  const handleConfirmPdfDownload = () => {
    setShowPdfGuide(false);
    setTimeout(() => {
      const element = document.getElementById('coop-print-area');
      if (!element) return;

      const weekText = selectedWeek === 'all' ? 'ทุกสัปดาห์' : `สัปดาห์ที่_${selectedWeek}`;
      const opt = {
        margin:       [0.4, 0.4, 0.4, 0.4], // Margins (top, left, bottom, right) in inches
        filename:     `ใบบันทึกผลปฏิบัติงานสหกิจ_${profile.studentName}_${weekText}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { 
          scale: 2.5, // High resolution scale for extremely clean thai typography
          useCORS: true, 
          letterRendering: true,
          logging: false,
          ignoreElements: (el: any) => el.classList && el.classList.contains('no-print')
        },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      if ((window as any).html2pdf) {
        // Direct programmatic PDF compilation and triggers instant browser download window
        (window as any).html2pdf().set(opt).from(element).save();
      } else {
        // Fallback to standard print in case of offline/loading limits
        window.print();
      }
    }, 400);
  };

  // Group logs by week number
  const logsByWeek = logs.reduce<Record<number, QuestLog[]>>((acc, log) => {
    if (!acc[log.weekNumber]) {
      acc[log.weekNumber] = [];
    }
    acc[log.weekNumber].push(log);
    return acc;
  }, {});

  // Sort logs in each week by date ascending
  Object.keys(logsByWeek).forEach((wk) => {
    logsByWeek[Number(wk)].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  const weeksAvailable = Object.keys(logsByWeek).map(Number).sort((a, b) => a - b);

  // Dynamic statistics calculation
  const totalQuests = logs.length;
  const totalXp = logs.reduce((sum, l) => sum + l.xpGained, 0);
  const totalGold = logs.reduce((sum, l) => sum + l.goldGained, 0);
  
  // Calculate average hours (easy=2, medium=4, hard=8)
  const totalHours = logs.reduce((sum, l) => {
    if (l.difficulty === 'easy') return sum + 2;
    if (l.difficulty === 'medium') return sum + 4;
    return sum + 8;
  }, 0);

  // Calculate Level dynamically
  let calculatedLevel = 1;
  let runningXp = 0;
  const sortedLogsChrono = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  sortedLogsChrono.forEach((l) => {
    let nextLevelXpNeeded = calculatedLevel * 500;
    runningXp += l.xpGained;
    while (runningXp >= nextLevelXpNeeded) {
      runningXp -= nextLevelXpNeeded;
      calculatedLevel += 1;
      nextLevelXpNeeded = calculatedLevel * 500;
    }
  });

  // Local preservation handler
  const handleSaveData = () => {
    soundSynth.playClick();
    localStorage.setItem(`coop_reflection_learned_${profile.studentName}`, reflectionLearned);
    localStorage.setItem(`coop_reflection_problems_${profile.studentName}`, reflectionProblems);
    localStorage.setItem(`coop_eval_supervisor_${profile.studentName}`, evalSupervisor);
    localStorage.setItem(`coop_eval_score_${profile.studentName}`, evalScore);
    localStorage.setItem(`coop_eval_verdict_${profile.studentName}`, evalVerdict);
    localStorage.setItem(`coop_evaluator_name_${profile.studentName}`, evaluatorName);
    localStorage.setItem(`coop_advisor_name_${profile.studentName}`, advisorName);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Format reports for clipboard copy-paste
  const generatePlainTextReport = () => {
    let output = `=========================================\n`;
    output += `รายงานสรุปผลการปฏิบัติงานสหกิจศึกษา / ฝึกงาน\n`;
    output += `=========================================\n\n`;
    output += `👤 ผู้นำเสนอ: ${profile.studentName}\n`;
    output += `🏰 สถานที่ฝึกงาน: ${profile.companyName}\n`;
    output += `🎯 ตำแหน่งงาน: ${profile.role}\n`;
    output += `📅 ระยะเวลาผจญภัย: ${profile.startDate} ถึง ${profile.endDate}\n\n`;
    output += `-----------------------------------------\n\n`;

    const weeksToInclude = selectedWeek === 'all' ? weeksAvailable : [selectedWeek];

    if (weeksToInclude.length === 0 || logs.length === 0) {
      output += `(ยังไม่มีข้อมูลบันทึกความสามารถตามที่เลือก)\n`;
      return output;
    }

    weeksToInclude.forEach((wk) => {
      const wkLogs = logsByWeek[wk] || [];
      output += `📍 [สัปดาห์ที่ ${wk}]\n`;
      output += `-----------------------------------------\n`;
      
      if (wkLogs.length === 0) {
        output += `- ไม่มีรายงานการปฏิบัติงานในสัปดาห์นี้\n`;
      } else {
        wkLogs.forEach((l, index) => {
          output += `${index + 1}. ชื่องาน: ${l.title}\n`;
          output += "   วันที่ทำ: " + l.date + "\n";
          output += `   ทักษะวิชาชีพหลัก: ${SKILL_METADATA[l.category].labelTh}\n`;
          output += `   ระดับความยาก: ${l.difficulty.toUpperCase()}\n`;
          if (l.description) {
            output += `   รายละเอียดการทำงาน: ${l.description}\n`;
          }
          output += `\n`;
        });
      }
      output += `\n`;
    });

    // Appendix for dynamic reflections & evaluation metrics
    if (reflectionLearned || reflectionProblems || evalSupervisor || evalScore) {
      output += `=========================================\n`;
      output += `บันทึกสรุปผลการปฏิบัติตามมาตรฐานและประเมินผล\n`;
      output += `=========================================\n\n`;

      if (reflectionLearned) {
        output += `📝 สรุปการเรียนรู้และความสำเร็จเด่นของนักศึกษา:\n`;
        output += `${reflectionLearned}\n\n`;
      }
      if (reflectionProblems) {
        output += `⚠️ อุปสรรค ปัญหาสำคัญที่พบ และวิธีแก้ไข:\n`;
        output += `${reflectionProblems}\n\n`;
      }
      if (evalSupervisor || evalScore) {
        output += `🎓 ส่วนงานพี่เลี้ยง & คณะกรรมการประเมินผล:\n`;
        output += `- คะแนนความประเมินสะสม: ${evalScore || '-'}/100 คะแนน\n`;
        output += `- ผลวินิจฉัยสัมฤทธิผล: ${
          evalVerdict === 'pass'
            ? 'ผ่านตามเกณฑ์มาตรฐานดีเลิศ (Passed with Excellence)'
            : evalVerdict === 'revise'
            ? 'ผ่านตามเกณฑ์ระดับปรับปรุงแก้ไขงาน (Passed with Minor Revisions)'
            : 'ยังไม่ผ่านหลักเกณฑ์มาตรฐานขั้นต่ำ (Revision Required)'
        }\n`;
        if (evalSupervisor) {
          output += `- บันทึกความคิดเห็นประกอบ: ${evalSupervisor}\n`;
        }
        output += `\n`;
      }
      if (evaluatorName) {
        output += `👤 ผู้นิเทศสถานประกอบการ (พี่เลี้ยง): ${evaluatorName}\n`;
      }
      if (advisorName) {
        output += `🎓 อาจารย์นิเทศมหาวิทยาลัย: ${advisorName}\n`;
      }
    }

    return output;
  };

  // Trigger clipboard copy action
  const handleCopyToClipboard = () => {
    soundSynth.playClick();
    const text = generatePlainTextReport();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Browser print window trigger
  const handlePrint = () => {
    soundSynth.playClick();
    window.print();
  };

  // Download Plain Text Report File (TXT)
  const handleDownloadTxt = () => {
    soundSynth.playClick();
    const text = generatePlainTextReport();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานสหกิจ_${profile.studentName}_สัปดาห์ที่_${selectedWeek}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download Spreadsheet File (CSV) with UTF-8 BOM so Excel displays Thai characters correctly
  const handleDownloadCsv = () => {
    soundSynth.playClick();
    
    let csvContent = '\uFEFF'; // UTF-8 Byte Order Mark (BOM)
    csvContent += 'สัปดาห์ที่,วันที่ปฏิบัติ,ชื่องาน/ภารกิจ,ทักษะวิชาชีพหลัก,ระดับความยาก,คำอธิบายงาน/ข้อเรียนรู้,XP ที่ได้รับ,เหรียญทองที่ได้รับ\n';
    
    const weeksToInclude = selectedWeek === 'all' ? weeksAvailable : [selectedWeek];
    
    weeksToInclude.forEach((wk) => {
      const wkLogs = logsByWeek[wk] || [];
      wkLogs.forEach((l) => {
        const skillMeta = SKILL_METADATA[l.category];
        const titleEscaped = `"${l.title.replace(/"/g, '""')}"`;
        const categoryEscaped = `"${skillMeta.labelTh.split(' (')[0].replace(/"/g, '""')}"`;
        const difficultyText = l.difficulty === 'easy' ? 'ง่าย' : l.difficulty === 'medium' ? 'ปานกลาง' : 'ยากมาก';
        const descEscaped = `"${(l.description || '').replace(/"/g, '""')}"`;
        
        csvContent += `${wk},${l.date},${titleEscaped},${categoryEscaped},${difficultyText},${descEscaped},${l.xpGained},${l.goldGained}\n`;
      });
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ตารางปฏิบัติงาน_${profile.studentName}_สัปดาห์ที่_${selectedWeek}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-sans">
      {/* PDF Download Guidance Dialog Modal */}
      {showPdfGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 text-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <FileDown className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-slate-900 text-[14px]">
                  คำแนะนำดาวน์โหลดใบบันทึกแบบไฟล์ PDF
                </h3>
              </div>
              <button
                onClick={() => setShowPdfGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-3">
              <p>
                เพื่อให้ได้เอกสาร <strong className="text-slate-900">ใบบันทึกการปฏิบัติงานรายวันตามเควส</strong> ที่มีดีไซน์สวยงามและสากล ตรงตามมาตรฐานระเบียบการสหกิจศึกษาพร้อมข้อความภาษาไทยครบถ้วนสมบูรณ์:
              </p>
              
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2">
                <div className="flex items-start gap-2 text-slate-700">
                  <span className="w-5 h-5 bg-rose-100 text-rose-700 font-bold rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>เมื่อกดปุ่ม <strong className="text-slate-900">"ยืนยันและเปิดเครื่องมือพิมพ์"</strong> ด้านล่างนี้ หน้าต่างพิมพ์ของเบราว์เซอร์จะเปิดขึ้น</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <span className="w-5 h-5 bg-rose-100 text-rose-700 font-bold rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span>ให้คุณเลือกปลายทาง (Destination) เป็น <strong className="text-rose-650 font-bold">"บันทึกเป็น PDF" (Save as PDF)</strong></span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <span className="w-5 h-5 bg-rose-100 text-rose-700 font-bold rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span>ติ๊กถูกที่ปุ่ม <strong className="text-slate-900">"รูปภาพพื้นหลัง" (Background graphics)</strong> เพื่อให้สีสันกรอบเควสและแถบตารางแสดงคมชัด</span>
                </div>
              </div>
              
              <p className="text-[10px] text-slate-450 italic leading-snug">
                *ระบบคัดลอกจะทำการจัดโครงสร้างฟอร์มอย่างเป็นระเบียบ สะท้อนข้อคิด แฟ้มสะสมงาน และความคิดเห็นผู้คุมงานโดยผู้ใช้จะได้รับไฟล์ PDF ที่สะอาดอย่างเป็นธรรมชาติ
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPdfGuide(false)}
                className="w-1/3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer bg-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmPdfDownload}
                className="w-2/3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer border-0"
              >
                <Download className="w-3.5 h-3.5" /> ยืนยันเริ่มต้นพิมพ์ PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intro section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            🏆 CO-OP REPORT EXPORTER (ระบบพิมพ์เล่มและคัดลอกส่งอาจารย์)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            ดึงข้อมูลรายสัปดาห์ออกมาอย่างเป็นระเบียบตามมาตรฐานวิชาการมหาวิทยาลัย พร้อมกดก๊อปปี้หรือสั่งปริ้นต์เป็น PDF ได้ทันที
          </p>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <button
            onClick={handleCopyToClipboard}
            className="px-4 py-2 bg-white text-indigo-600 hover:bg-slate-50 border border-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all outline-none cursor-pointer shadow-sm animate-fade-in"
            id="btn-copy-report"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" /> คัดลอกแล้ว!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> พรีวิวข้อความคัดลอกลงบอร์ด
              </>
            )}
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-4 py-2 bg-white text-slate-750 hover:bg-slate-50 border border-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all outline-none cursor-pointer shadow-sm"
            id="btn-download-txt"
          >
            <Download className="w-4 h-4 text-slate-500" /> ดาวน์โหลดข้อความ (.txt)
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all outline-none cursor-pointer shadow-sm"
            id="btn-download-csv"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> ดาวน์โหลดตาราง Excel (.csv)
          </button>

          <button
            onClick={handleDownloadPdfClick}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all outline-none cursor-pointer border-0 animate-pulse relative"
            id="btn-download-pdf-guide"
          >
            <FileDown className="w-4 h-4" /> ดาวน์โหลดใบบันทึกแบบ PDF (.pdf)
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all outline-none cursor-pointer border-0"
            id="btn-print-pdf"
          >
            <Printer className="w-4 h-4" /> ปริ้นต์และบันทึกแบบจัดหน้า (Print / PDF)
          </button>
        </div>
      </div>

      {/* Week Selector Tab Rails */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => {
            soundSynth.playClick();
            setSelectedWeek('all');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex-shrink-0 border cursor-pointer ${
            selectedWeek === 'all'
              ? 'bg-indigo-600 border-indigo-605 text-white font-extrabold shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'
          }`}
        >
          📂 ทุกสัปดาห์ (ทั้งหมด {logs.length} เควส)
        </button>

        {weeksAvailable.map((wk) => (
          <button
            key={wk}
            onClick={() => {
              soundSynth.playClick();
              setSelectedWeek(wk);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex-shrink-0 border cursor-pointer ${
              selectedWeek === wk
                ? 'bg-indigo-600 border-indigo-605 text-white font-extrabold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'
            }`}
          >
            📍 สัปดาห์ที่ {wk} ({logsByWeek[wk]?.length || 0} เควส)
          </button>
        ))}
      </div>

      {/* Dynamic Statistics dashboard (no-print) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6 no-print">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">🏆 เกียรติประวัติสะสม</span>
          <span className="mt-1.5 text-base font-black text-indigo-700 font-display">Level {calculatedLevel}</span>
          <span className="text-[9px] text-slate-400 mt-0.5">{profile.characterClass.toUpperCase()} Class</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">⚔️ เควสสหกิจทั้งหมด</span>
          <span className="mt-1.5 text-base font-black text-slate-900 font-display">{totalQuests} เควส</span>
          <span className="text-[9px] text-slate-400 mt-0.5">รวมประวัติการส่ง</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">⏳ เวลาทำงานสะสม</span>
          <span className="mt-1.5 text-base font-black text-emerald-700 font-display">{totalHours} ชั่วโมง</span>
          <span className="text-[9px] text-slate-400 mt-0.5">ประเมินตามความยากงาน</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">🔮 แต้มฝึกฝนรวม (XP)</span>
          <span className="mt-1.5 text-base font-black text-violet-700 font-display">{totalXp.toLocaleString()} XP</span>
          <span className="text-[9px] text-slate-400 mt-0.5">รวมแต้มสะสมทั้งหมด</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">🪙 โบนัสเหรียญรางวัล</span>
          <span className="mt-1.5 text-base font-black text-amber-600 font-display">{totalGold.toLocaleString()} g</span>
          <span className="text-[9px] text-slate-400 mt-0.5">ทองสะสมภายในเกณฑ์</span>
        </div>
      </div>

      {/* Student & Officer Recording and Evaluation Forms (no-print) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm no-print space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                📝 แผงบันทึกผลและประเมินงานสหกิจศึกษา (สำหรับนักศึกษา &amp; เจ้าหน้าที่)
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                พิมพ์สรุปการเรียนรู้ ผลประเมิน และคะแนนสะสม เพื่อบันทึกลงพิมพ์ในเอกสาร PDF ทางวิการ
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSaveData}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto shrink-0 border-0"
          >
            <Save className="w-3.5 h-3.5" />
            {saveSuccess ? 'บันทึกสำเร็จเรียบร้อย!' : 'เซฟข้อมูลประเมิน'}
          </button>
        </div>

        {/* Input elements form panels split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Student Panel */}
          <div className="space-y-4 bg-slate-50/60 p-4 border border-slate-200/50 rounded-xl">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              👨‍🎓 ส่วนสรุปผลและรายงานตนเอง (สำหรับนักศึกษา)
            </h4>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                1. สิ่งสำคัญที่เรียนรู้ได้และภารกิจเด่นชัดที่สำเร็จ:
              </label>
              <textarea
                value={reflectionLearned}
                onChange={(e) => setReflectionLearned(e.target.value)}
                placeholder="เช่น ได้ศึกษาขั้นตอนการต่อเชื่อมเชื่อมโยง REST API และสรุปรายงาน ออกแบบระบบเว็บบอร์ดให้ตอบสนองเร็ว..."
                className="w-full h-20 p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-slate-750 font-sans leading-relaxed text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                2. อุปสรรค ปัญหาเด่น และวิธีวางกลยุทธ์แก้ไขปัญหา:
              </label>
              <textarea
                value={reflectionProblems}
                onChange={(e) => setReflectionProblems(e.target.value)}
                placeholder="เช่น เกิดข้อผิดพลาดของ Library เว็บเบื้องต้น ได้แก้ไขโดยศึกษาคู่มือและตั้งค่าตั้งตรรกะใหม่ร่วมกับพี่เลี้ยง..."
                className="w-full h-20 p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-slate-750 font-sans leading-relaxed text-xs"
              />
            </div>
          </div>

          {/* Officer / Supervisor Panel */}
          <div className="space-y-4 bg-slate-50/60 p-4 border border-slate-200/50 rounded-xl">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              🎓 ส่วนการประเมินวิชาการ (สำหรับพี่เลี้ยง / เจ้าหน้าที่มหาวิทยาลัย)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  คะแนนประเมิน (เต็ม 100):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evalScore}
                  onChange={(e) => setEvalScore(e.target.value)}
                  placeholder="กรอกคะแนนผลรวม..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-slate-750 text-xs font-sans"
                />
              </div>
              
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  การตัดสินประเมินภาพรวม:
                </label>
                <select
                  value={evalVerdict}
                  onChange={(e) => setEvalVerdict(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-slate-755 text-xs font-sans"
                >
                  <option value="pass">ผ่านเกณฑ์ยอดเยี่ยม (Passed)</option>
                  <option value="revise">ผ่านแบบร่วมส่งแก้ไขปรับปรุง (Revisions)</option>
                  <option value="fail">ไม่ผ่านหลักเกณฑ์ประเมิน (Failed)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                ความคิดเห็นและข้อเสนอแนะเพิ่มเติมจากผู้ตรวจ:
              </label>
              <textarea
                value={evalSupervisor}
                onChange={(e) => setEvalSupervisor(e.target.value)}
                placeholder="เช่น นักศึกษามีทักษะเขียนโปรแกรมที่ดีมาก มีทัศนคติเรียนรู้ตลอดเวลา นำเสนอผลคืบหน้าตรงเวลา..."
                className="w-full h-14 p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-slate-750 font-sans leading-relaxed text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  ชื่อพี่เลี้ยงฝึกงาน:
                </label>
                <input
                  type="text"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  placeholder="ลงชื่อพี่เลี้ยงดูแล..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-slate-750 text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  ชื่ออาจารย์นิเทศตรวจบท:
                </label>
                <input
                  type="text"
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                  placeholder="ลงชื่อผู้ตรวจมหาวิทยาลัย..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-slate-750 text-xs font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Preview Block (Mocking Official A4 Academic Layout) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-sm overflow-hidden">
        
        {/* Info Box Tip */}
        <div className="bg-slate-50 border border-slate-200/65 p-3.5 rounded-xl mb-6 text-xs text-slate-650 flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-slate-800">💡 เคล็ดลับการส่งรายงาน:</p>
            <p className="mt-0.5 leading-relaxed text-slate-605">
              เมื่อกด <span className="text-indigo-600 font-bold">สั่งปริ้นต์บันทึก PDF</span> ระบบจะจัดการล้างแถบเมนูและปุ่มควบคุมทั้งหมดออกโดยอัตโนมัติ เหลือเฉพาะแผงรายงานสากลขาวสะอาดและส่วนงานสะท้อนความคิด + ผลการประเมินรายบุคคลที่ได้เซฟไว้ด้านบน เพื่อรันจัดหน้ากระดาษพอร์ทฟอลิโออย่างสมบูรณ์แบบ
            </p>
          </div>
        </div>

        {/* printable-region container */}
        <div id="coop-print-area" className="bg-white text-slate-900 p-6 sm:p-10 border border-slate-200 rounded-xl shadow-inner font-sans printable-region">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              /* Remove all extraneous web elements */
              body * {
                visibility: hidden;
              }
              #coop-print-area, #coop-print-area * {
                visibility: visible;
              }
              #coop-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                border: 0;
                box-shadow: none;
                padding: 0;
                margin: 0;
                background: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          {/* Academic Document Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-950 font-serif">
              บันทึกการปฏิบัติงานรายวันแบบเควส
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">
              DAILY INTERNSHIP QUEST &amp; DIARY REPORT
            </p>
          </div>

          {/* Student Profile Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-8 bg-slate-50 p-4 border border-slate-200 rounded-xl">
            <div>
              <p className="mb-1.5">
                <strong className="text-slate-600">ชื่อ-นามสกุล นักศึกษา:</strong>{' '}
                <span className="text-slate-900 font-bold">{profile.studentName}</span>
              </p>
              <p className="mb-1.5">
                <strong className="text-slate-600">ตำแหน่งสหกิจศึกษา:</strong>{' '}
                <span className="text-slate-850">{profile.role}</span>
              </p>
              <p>
                <strong className="text-slate-600">คลาสทักษะ (Character Class):</strong>{' '}
                <span className="text-slate-805 font-semibold">{profile.characterClass.toUpperCase()}</span>
              </p>
            </div>
            <div>
              <p className="mb-1.5">
                <strong className="text-slate-600">สถานประกอบการ:</strong>{' '}
                <span className="text-slate-900 font-bold">{profile.companyName}</span>
              </p>
              <p>
                <strong className="text-slate-600">ระยะเวลาการฝึกงาน:</strong>{' '}
                <span className="text-slate-850 font-mono">
                  {profile.startDate} ถึง {profile.endDate}
                </span>
              </p>
            </div>
          </div>

          {/* Render Weekly lists */}
          <div className="space-y-8">
            {(() => {
              const weeksToShow = selectedWeek === 'all' ? weeksAvailable : [selectedWeek];

              if (weeksToShow.length === 0 || logs.length === 0) {
                return (
                  <p className="text-center text-xs text-slate-400 py-6 font-sans">
                    (ไม่มีประวัติรายงานการปฏิบัติงานในระบบสรุปตามที่ระบุ)
                  </p>
                );
              }

              return weeksToShow.map((wk) => {
                const wkLogs = logsByWeek[wk] || [];
                return (
                  <div key={wk} className="space-y-3.5">
                    {/* Week Title Block */}
                    <div className="bg-slate-100 border border-slate-200 text-slate-800 px-4 py-2 rounded-lg flex justify-between items-center no-print">
                      <span className="text-[12px] font-extrabold font-mono uppercase tracking-wider">
                        สัปดาห์ที่ {wk} (Week {wk})
                      </span>
                      <span className="text-[11px] font-sans font-medium text-slate-600">
                        สำเร็จทั้งหมด {wkLogs.length} งาน
                      </span>
                    </div>

                    {/* Printer-safe static Week Header */}
                    <div className="hidden print:block border-b-2 border-slate-300 pb-1 mt-6 text-sm font-bold text-slate-950">
                      📅 รายงานประจำสัปดาห์ที่ {wk}
                    </div>

                    {/* Quests table within this week */}
                    {wkLogs.length === 0 ? (
                      <p className="text-xs text-slate-500 pl-4 font-sans italic">
                        - ไม่มีประวัติข้อมูลบันทึกภารกิจในหมวดหมู่นี้ในขณะนี้
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] sm:text-xs text-left border-collapse border border-slate-300">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-300 text-slate-750">
                              <th className="p-2 border-r border-slate-300 w-24">วันที่ปฏิบัติ</th>
                              <th className="p-2 border-r border-slate-300 w-44">ชื่องาน/ภารกิจ</th>
                              <th className="p-2 border-r border-slate-300 w-32">ทักษะวิชาชีพหลัก</th>
                              <th className="p-2 border-r border-slate-300 w-16">ความยาก</th>
                              <th className="p-2">คำอธิบายงาน / ข้อเรียนรู้</th>
                            </tr>
                          </thead>
                          <tbody>
                            {wkLogs.map((l) => {
                              const skillMeta = SKILL_METADATA[l.category];
                              return (
                                <tr key={l.id} className="border-b border-slate-200 hover:bg-slate-50 transition-all font-sans">
                                  <td className="p-2 border-r border-slate-300 font-mono text-slate-600">
                                    {l.date}
                                  </td>
                                  <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">
                                    {l.title}
                                  </td>
                                  <td className="p-2 border-r border-slate-300 text-slate-800">
                                    {skillMeta.labelTh.split(' (')[0]}
                                  </td>
                                  <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-700">
                                    {l.difficulty === 'easy' && '⭐'}
                                    {l.difficulty === 'medium' && '⭐⭐'}
                                    {l.difficulty === 'hard' && '⭐⭐⭐'}
                                  </td>
                                  <td className="p-2 text-slate-705 whitespace-pre-line leading-relaxed">
                                    {l.description || '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          {/* Academic Evaluation Summary Details (Printed Element) */}
          {(reflectionLearned || reflectionProblems || evalSupervisor || evalScore) && (
            <div className="mt-14 pt-8 border-t-2 border-slate-900 page-break-inside-avoid text-left">
              <div className="text-slate-950 font-bold text-sm uppercase tracking-wider mb-5 pb-1 border-b border-slate-300">
                📝 ส่วนพิจารณาสะท้อนคิด &amp; ผลการประเมินวิชาการสหกิจศึกษา (CO-OP EVALUATION REPORT)
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] sm:text-xs">
                {/* Reflections column */}
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1 border-b border-slate-200 pb-1 font-extrabold">
                      👨‍🎓 บันทึกสรุปการเรียนรู้และความคิดเห็น (นักศึกษา):
                    </strong>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed italic">
                      {reflectionLearned ? `"${reflectionLearned}"` : '-(ไม่ได้ระบุรายละเอียด)-'}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1 border-b border-slate-200 pb-1 font-extrabold">
                      ⚠️ ปัญหา อุปสรรค และวิธีการดำเนินการแก้ไขสำคัญ:
                    </strong>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed italic">
                      {reflectionProblems ? `"${reflectionProblems}"` : '-(ไม่ได้ระบุรายละเอียด)-'}
                    </p>
                  </div>
                </div>

                {/* Scorecard and verdict column */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-4">
                  <div>
                    <strong className="block text-slate-800 border-b border-slate-200 pb-1 mb-2 font-extrabold">
                      🏆 คะแนนผลสัมฤทธิ์ประเมินผลสะสม:
                    </strong>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-slate-600 font-bold">ผลรวมคะแนน:</span>
                      <span className="px-3 py-1 bg-white border-2 border-slate-800 rounded font-mono font-black text-xs text-slate-950">
                        {evalScore ? `${evalScore} / 100` : '- / 100'} คะแนน
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <strong className="block text-slate-800 pb-1 mb-1 font-bold">
                      📊 สถานภาพความสำเร็จภาพรวม:
                    </strong>
                    <div className="space-y-1 pl-1">
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="w-3.5 h-3.5 border border-slate-400 rounded flex items-center justify-center bg-white font-bold font-mono">
                          {evalVerdict === 'pass' ? '✓' : ''}
                        </span>
                        <span className={evalVerdict === 'pass' ? 'font-bold text-slate-900' : 'text-slate-500'}>
                          ผ่านประเมินระดับดีเยี่ยมมาตรฐานสากล (Passed)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="w-3.5 h-3.5 border border-slate-400 rounded flex items-center justify-center bg-white font-bold font-mono">
                          {evalVerdict === 'revise' ? '✓' : ''}
                        </span>
                        <span className={evalVerdict === 'revise' ? 'font-bold text-slate-900' : 'text-slate-500'}>
                          ผ่านระดับร่วมนำส่งแก้ไขงานเพิ่มเติม (Revisions)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="w-3.5 h-3.5 border border-slate-400 rounded flex items-center justify-center bg-white font-bold font-mono">
                          {evalVerdict === 'fail' ? '✓' : ''}
                        </span>
                        <span className={evalVerdict === 'fail' ? 'font-bold text-slate-900' : 'text-slate-500'}>
                          ยังไม่ผ่านการประเมินประจำเกณฑ์หลัก (Failed)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2 text-[10.5px]">
                    <strong className="text-slate-800 font-bold">ความคิดเห็นประกอบการพิจารณาเพิ่มเติม:</strong>
                    <p className="text-slate-705 italic mt-1.5 leading-relaxed">
                      {evalSupervisor ? `"${evalSupervisor}"` : '-(ไม่มีข้อแนะนำประเมินผลเพิ่มเติม)-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Signature Lines at bottom for teachers and supervisors */}
          <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-10 text-center text-xs page-break-inside-avoid">
            <div>
              <div className="w-48 border-b-0 border-slate-300 mx-auto mb-2 h-10 flex items-end justify-center">
                {evaluatorName ? (
                  <span className="font-sans font-bold text-slate-900 text-[11.5px] border-b border-slate-400 pb-0.5 px-3 italic">
                    {evaluatorName}
                  </span>
                ) : (
                  <div className="w-48 border-b border-slate-300 h-1" />
                )}
              </div>
              <p className="text-slate-700 font-semibold text-[11px]">ลงชื่อ ................................................................</p>
              <p className="text-slate-500 mt-1 font-sans">
                ( {evaluatorName || '................................................................'} )
              </p>
              <p className="text-slate-450 text-[10px] mt-0.5 font-sans">พี่เลี้ยงประจำสถานประกอบการ (Supervisor)</p>
            </div>
            <div>
              <div className="w-48 border-b-0 border-slate-305 mx-auto mb-2 h-10 flex items-end justify-center">
                {advisorName ? (
                  <span className="font-sans font-bold text-slate-900 text-[11.5px] border-b border-slate-400 pb-0.5 px-3 italic">
                    {advisorName}
                  </span>
                ) : (
                  <div className="w-48 border-b border-slate-300 h-1" />
                )}
              </div>
              <p className="text-slate-700 font-semibold text-[11px]">ลงชื่อ ................................................................</p>
              <p className="text-slate-500 mt-1 font-sans">
                ( {advisorName || '................................................................'} )
              </p>
              <p className="text-slate-450 text-[10px] mt-0.5 font-sans">อาจารย์นิเทศสหกิจศึกษามหาวิทยาลัย</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
