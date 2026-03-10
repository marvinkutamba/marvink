export function getToday(): string {
  return formatDate(new Date());
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

export function getDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function calculateStreak(
  completionDates: string[],
  today: string
): { current: number; best: number } {
  if (completionDates.length === 0) return { current: 0, best: 0 };

  const sorted = [...new Set(completionDates)].sort().reverse();

  let current = 0;
  let best = 0;
  let tempStreak = 0;

  // Check if today or yesterday is in the list to start current streak
  let checkDate = today;
  if (!sorted.includes(today)) {
    checkDate = getPreviousDay(today);
    if (!sorted.includes(checkDate)) {
      // No completion today or yesterday — current streak is 0
      // Still calculate best streak
      tempStreak = 1;
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === getPreviousDay(sorted[i - 1])) {
          tempStreak++;
        } else {
          best = Math.max(best, tempStreak);
          tempStreak = 1;
        }
      }
      best = Math.max(best, tempStreak);
      return { current: 0, best };
    }
  }

  // Calculate current streak from checkDate backwards
  let expectedDate = checkDate;
  for (const date of sorted) {
    if (date === expectedDate) {
      current++;
      expectedDate = getPreviousDay(expectedDate);
    } else if (date < expectedDate) {
      break;
    }
  }

  // Calculate best streak across all dates
  tempStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === getPreviousDay(sorted[i - 1])) {
      tempStreak++;
    } else {
      best = Math.max(best, tempStreak);
      tempStreak = 1;
    }
  }
  best = Math.max(best, tempStreak);
  best = Math.max(best, current);

  return { current, best };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthDates(year: number, month: number): string[] {
  const days = getDaysInMonth(year, month);
  const dates: string[] = [];
  for (let d = 1; d <= days; d++) {
    const m = String(month + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    dates.push(`${year}-${m}-${day}`);
  }
  return dates;
}
