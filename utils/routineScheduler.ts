import { RoutineStep, DayRoutine } from '@/types/routine';

const morningRoutine: RoutineStep[] = [
  {
    id: 'morning-1',
    name: 'Rinse Face',
    description: 'Rinse face with lukewarm water (no cleanser)',
    waitTime: 0,
  },
  {
    id: 'morning-2',
    name: 'Hyaluronic Acid',
    description: 'Apply on damp skin',
    waitTime: 0,
  },
  {
    id: 'morning-3',
    name: 'Super Glow Vitamin C Serum',
    description: '1-2 drops, gently press in',
    waitTime: 0.5, // 30 seconds
  },
  {
    id: 'morning-4',
    name: 'Niacinamide 10% + Zinc',
    description: 'Optional step',
    waitTime: 0,
    isOptional: true,
  },
  {
    id: 'morning-5',
    name: 'CeraVe AM Moisturizer with SPF 30',
    description: 'Apply evenly to face and neck',
    waitTime: 0,
  },
  {
    id: 'morning-6',
    name: 'Minoxidil 5% for Eyebrows',
    description: 'Apply with clean cotton swab on brows only, once daily',
    waitTime: 0,
  },
  {
    id: 'morning-7',
    name: 'Castor Oil',
    description: 'Optional - on brows or lashes (alternate days with minoxidil)',
    waitTime: 0,
    isOptional: true,
    warning: 'Avoid layering directly with minoxidil; alternate days or apply at night',
  },
  {
    id: 'morning-8',
    name: 'Whitening Strips',
    description: 'Use after skin routine, not before food or drinks',
    waitTime: 30,
    isOptional: true,
    warning: 'Use maximum 2-3 times per week',
  },
];

const lacticAcidEvening: RoutineStep[] = [
  {
    id: 'evening-cleanse',
    name: 'Rinse Face',
    description: 'Rinse face with water or gentle cleansing wipe',
    waitTime: 0,
  },
  {
    id: 'evening-ha',
    name: 'Hyaluronic Acid',
    description: 'Apply on damp skin',
    waitTime: 0,
  },
  {
    id: 'evening-lactic',
    name: 'The Ordinary Lactic Acid 10% + HA',
    description: 'Gentle exfoliation for even tone',
    waitTime: 2, // 1-2 minutes
    warning: 'Do not use with Retinol on the same night',
    incompatibleWith: ['retinol'],
  },
  {
    id: 'evening-moisturizer',
    name: 'Tiege Hanley PM Moisturizer',
    description: 'Apply evenly to face and neck',
    waitTime: 0,
  },
  {
    id: 'evening-minoxidil',
    name: 'Minoxidil 5% for Eyebrows',
    description: 'If not used in the morning',
    waitTime: 0,
    isOptional: true,
  },
  {
    id: 'evening-castor',
    name: 'Castor Oil',
    description: 'If alternating with minoxidil, not layered',
    waitTime: 0,
    isOptional: true,
  },
];

const retinolEvening: RoutineStep[] = [
  {
    id: 'evening-cleanse',
    name: 'Rinse Face',
    description: 'Rinse face with water or gentle cleansing wipe',
    waitTime: 0,
  },
  {
    id: 'evening-ha',
    name: 'Hyaluronic Acid',
    description: 'Apply on damp skin',
    waitTime: 2, // 1-2 minutes
  },
  {
    id: 'evening-retinol',
    name: 'CeraVe Resurfacing Retinol Serum',
    description: 'Apply a pea-sized amount',
    waitTime: 2, // 1-2 minutes
    warning: 'Do not use with Lactic Acid on the same night',
    incompatibleWith: ['lactic-acid'],
  },
  {
    id: 'evening-moisturizer',
    name: 'Tiege Hanley PM Moisturizer',
    description: 'Apply evenly to face and neck',
    waitTime: 0,
  },
  {
    id: 'evening-minoxidil-alt',
    name: 'Minoxidil or Castor Oil on Brows',
    description: 'Alternate from lactic night',
    waitTime: 0,
    isOptional: true,
  },
];

const recoveryEvening: RoutineStep[] = [
  {
    id: 'evening-cleanse',
    name: 'Cleanse Face',
    description: 'Cleanse face if needed',
    waitTime: 0,
  },
  {
    id: 'evening-ha',
    name: 'Hyaluronic Acid',
    description: 'Apply on damp skin',
    waitTime: 0,
  },
  {
    id: 'evening-niacinamide',
    name: 'Niacinamide 10% + Zinc',
    description: 'Skin barrier repair',
    waitTime: 0,
  },
  {
    id: 'evening-moisturizer',
    name: 'Tiege Hanley PM Moisturizer',
    description: 'Use this as a skin barrier repair day',
    waitTime: 0,
  },
];

export function getRoutineForDate(date: Date): DayRoutine {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  let eveningRoutine: RoutineStep[];
  
  // Weekly cycle: Mon-Lactic, Tue-Retinol, Wed-Recovery, Thu-Lactic, Fri-Retinol, Sat-Recovery, Sun-Optional
  switch (dayOfWeek) {
    case 1: // Monday - Lactic Acid Night
    case 4: // Thursday - Lactic Acid Night
      eveningRoutine = lacticAcidEvening;
      break;
    case 2: // Tuesday - Retinol Night
    case 5: // Friday - Retinol Night
      eveningRoutine = retinolEvening;
      break;
    case 3: // Wednesday - Recovery Night
    case 6: // Saturday - Recovery Night
      eveningRoutine = recoveryEvening;
      break;
    case 0: // Sunday - Optional (Recovery as default)
      eveningRoutine = recoveryEvening;
      break;
    default:
      eveningRoutine = recoveryEvening;
  }
  
  return {
    morning: morningRoutine,
    evening: eveningRoutine,
  };
}

export function getRoutineTypeForDay(dayOfWeek: number): string {
  switch (dayOfWeek) {
    case 1:
    case 4:
      return 'Lactic Acid Night - Exfoliation';
    case 2:
    case 5:
      return 'Retinol Night - Cell Turnover + Anti-Aging';
    case 3:
    case 6:
      return 'Recovery Night - Skin Barrier Repair';
    case 0:
      return 'Optional Night - Recovery or Rest';
    default:
      return 'Recovery Night - Skin Barrier Repair';
  }
}

export function getWeeklySchedule(): { day: string; routine: string }[] {
  return [
    { day: 'Monday', routine: 'Lactic Acid Night' },
    { day: 'Tuesday', routine: 'Retinol Night' },
    { day: 'Wednesday', routine: 'Recovery Night' },
    { day: 'Thursday', routine: 'Lactic Acid Night' },
    { day: 'Friday', routine: 'Retinol Night' },
    { day: 'Saturday', routine: 'Recovery Night' },
    { day: 'Sunday', routine: 'Optional (Repeat or Rest)' },
  ];
}