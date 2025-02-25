'use client';

import { useEffect, useState } from 'react';

export function LastCheckedTime({ date }: { date: Date | null }) {
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    if (date) {
      setFormattedTime(date.toLocaleTimeString());
    }
  }, [date]);

  if (!formattedTime) return null;

  return <span className="text-xs text-gray-400">Last checked: {formattedTime}</span>;
}
