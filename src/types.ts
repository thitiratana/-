/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CharacterClass = 'wizard' | 'rogue' | 'paladin' | 'ranger';

export interface SetupProfile {
  studentName: string;
  companyName: string;
  role: string;
  startDate: string;
  endDate: string;
  characterClass: CharacterClass;
  avatarId: string;
}

export type QuestDifficulty = 'easy' | 'medium' | 'hard';

export type QuestCategory =
  | 'technical'
  | 'design'
  | 'communication'
  | 'analytical'
  | 'teamwork'
  | 'business';

export interface QuestLog {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  xpGained: number;
  goldGained: number;
  date: string;
  weekNumber: number;
}

export type SkillStats = Record<QuestCategory, number>;

export interface GameStats {
  level: number;
  xp: number;
  gold: number;
}

export interface ClassMetadata {
  id: CharacterClass;
  nameTh: string;
  nameEn: string;
  description: string;
  primarySkill: QuestCategory;
  color: string; // Tailwind hex or class name
  borderColor: string;
  icon: string;
  avatarSvg: string;
}

export const CHARACTER_CLASSES: Record<CharacterClass, ClassMetadata> = {
  wizard: {
    id: 'wizard',
    nameTh: 'นักเวทย์สายเทค (Tech Wizard)',
    nameEn: 'Tech Wizard',
    description: 'เน้นงานเขียนโค้ด พัฒนาระบบ และแก้ไขปัญหาทางเทคนิคที่ซับซ้อนด้วยพลังปัญญาประดิษฐ์',
    primarySkill: 'technical',
    color: '#a855f7', // purple
    borderColor: 'border-purple-500',
    icon: 'Sparkles',
    avatarSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-full h-full text-purple-400">
      <rect x="24" y="16" width="16" height="16" fill="#a855f7" />
      <rect x="28" y="20" width="8" height="8" fill="#e9d5ff" />
      <rect x="20" y="32" width="24" height="20" fill="#7e22ce" />
      <!-- Star crown -->
      <polygon points="32,6 35,12 41,12 36,16 38,22 32,18 26,22 28,16 23,12 29,12" fill="#eab308" />
      <!-- Glasses -->
      <rect x="26" y="22" width="4" height="2" fill="#000" />
      <rect x="34" y="22" width="4" height="2" fill="#000" />
      <line x1="30" y1="23" x2="34" y2="23" stroke="#000" stroke-width="1" />
      <!-- Beard/Smile -->
      <rect x="30" y="28" width="4" height="2" fill="#f472b6" />
    </svg>`,
  },
  rogue: {
    id: 'rogue',
    nameTh: 'จอมโจรดีไซน์ (UI Rogue)',
    nameEn: 'UI Rogue',
    description: 'โดดเด่นเรื่องการสอดส่องพฤติกรรมผู้ใช้ วาดสายเส้น UI/UX ที่เฉียบคม และขโมยหัวใจด้วยความสวยงาม',
    primarySkill: 'design',
    color: '#e11d48', // rose
    borderColor: 'border-rose-500',
    icon: 'Palette',
    avatarSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-full h-full text-rose-400">
      <rect x="24" y="16" width="16" height="16" fill="#e11d48" />
      <rect x="28" y="20" width="8" height="8" fill="#ffe4e6" />
      <rect x="18" y="32" width="28" height="20" fill="#be123c" />
      <!-- Hood/Mask -->
      <rect x="20" y="14" width="24" height="6" fill="#4c0519" />
      <rect x="22" y="24" width="20" height="4" fill="#4c0519" />
      <!-- Glowing Eyes -->
      <rect x="27" y="21" width="2" height="2" fill="#facc15" />
      <rect x="35" y="21" width="2" height="2" fill="#facc15" />
    </svg>`,
  },
  paladin: {
    id: 'paladin',
    nameTh: 'อัศวินประสานงาน (Co-op Paladin)',
    nameEn: 'Co-op Paladin',
    description: 'มีทักษะปกป้องทีมด้วยการสื่อสารที่ยอดเยี่ยม ถือโล่ห์ชนปัญหา และจัดการประชุมอย่างมีเกียรติ',
    primarySkill: 'communication',
    color: '#d97706', // amber
    borderColor: 'border-amber-500',
    icon: 'Users',
    avatarSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-full h-full text-amber-400">
      <rect x="24" y="16" width="16" height="16" fill="#d97706" />
      <rect x="28" y="20" width="8" height="8" fill="#fef3c7" />
      <rect x="16" y="32" width="32" height="20" fill="#b45309" />
      <!-- Helmet -->
      <rect x="22" y="12" width="20" height="6" fill="#78350f" />
      <path d="M32,8 L35,14 L29,14 Z" fill="#e11d48" />
      <!-- Eyes behind helmet -->
      <rect x="28" y="21" width="8" height="2" fill="#1e293b" />
    </svg>`,
  },
  ranger: {
    id: 'ranger',
    nameTh: 'นักล่าวิเคราะห์ (Strategic Ranger)',
    nameEn: 'Strategic Ranger',
    description: 'แม่นยำด้านการวิเคราะห์ข้อมูล ล่าบั๊ก วางกลยุทธ์เชิงลึก และประสิทธิผลงานที่ไม่เคยพลาดเป้า',
    primarySkill: 'analytical',
    color: '#059669', // emerald
    borderColor: 'border-emerald-500',
    icon: 'TrendingUp',
    avatarSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-full h-full text-emerald-400">
      <rect x="24" y="16" width="16" height="16" fill="#059669" />
      <rect x="28" y="20" width="8" height="8" fill="#d1fae5" />
      <rect x="20" y="32" width="24" height="20" fill="#047857" />
      <!-- Ranger Hat -->
      <path d="M18,16 L46,16 L37,10 L27,10 Z" fill="#064e3b" />
      <rect x="16" y="15" width="32" height="2" fill="#d97706" />
      <!-- Eye patches / Focused face -->
      <rect x="27" y="21" width="3" height="3" fill="#000" />
      <rect x="34" y="21" width="3" height="3" fill="#000" stroke="#059669" stroke-width="0.5" />
    </svg>`,
  },
};

export const SKILL_METADATA: Record<
  QuestCategory,
  { labelTh: string; labelEn: string; color: string; description: string }
> = {
  technical: {
    labelTh: 'การทำงานเชิงเทคนิค (Technical Skills)',
    labelEn: 'Technical Skills',
    color: '#a855f7', // purple
    description: 'การเขียนโค้ด ออกแบบระบบ จัดการฐานข้อมูล หรือทักษะวิชาชีพตรงสายงาน',
  },
  design: {
    labelTh: 'การออกแบบและความคิดสร้างสรรค์ (Design & Creative)',
    labelEn: 'Design & Creative',
    color: '#e11d48', // rose
    description: 'การออกแบบ User Interface, User Experience, กราฟิก และความคิดสร้างสรรค์',
  },
  communication: {
    labelTh: 'การสื่อสารและนำเสนอ (Communication & Presentation)',
    labelEn: 'Communication & Presentation',
    color: '#3b82f6', // blue
    description: 'การพูดคุยกับลูกค้า การอธิบายงาน นำเสนอ หรือเสนอร่างความคิดให้ผู้อื่นเข้าใจ',
  },
  analytical: {
    labelTh: 'การคิดวิเคราะห์และแก้ปัญหา (Analytical & Problem Solving)',
    labelEn: 'Analytical & Problem Solving',
    color: '#10b981', // emerald
    description: 'การวิเคราะห์ข้อมูล การหาตรรกะผิดพลาด การแก้บั๊ก หรือวางทิศทางทางสถิติ',
  },
  teamwork: {
    labelTh: 'การร่วมมือและสร้างอาณาจักรทีม (Teamwork & Collaboration)',
    labelEn: 'Teamwork & Collaboration',
    color: '#f59e0b', // amber
    description: 'การประชุมร่วมวางแผน การสนับสนุนเพื่อนร่วมงาน การปรับตัวให้เข้ากับวัฒนธรรมองค์กร',
  },
  business: {
    labelTh: 'การวางแผนและการสร้างผลงาน (Planning & Productivity)',
    labelEn: 'Planning & Productivity',
    color: '#06b6d4', // cyan
    description: 'การบริหารเวลาให้ทัน Deadline การเข้าฝึกอบรมระเบียบ หรือความรู้ความเข้าใจธุรกิจ',
  },
};
