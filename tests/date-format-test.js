// Test the new date format support in DumbDateParser

import DumbDateParser from '../src/index.js';

// Helper function to format dates consistently for comparison
function formatDate(date) {
  return date ? 
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : 
    'null';
}

// More detailed formatting for logging
function formatDetailedDate(date) {
  if (!date) return 'null';
  
  return `${date.toISOString()} (${date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })})`;
}

// Basic test function
function test(input, expected, description = '') {
  // Do not set a default year, let the parser handle years directly
  const parser = new DumbDateParser({
    pastDatesAllowed: true // Allow past dates for consistent testing
  });
  
  console.log(`\n${description ? `[${description}] ` : ''}Testing: "${input}"`);
  
  try {
    const result = parser.parse(input);
    const formattedResult = formatDate(result);
    const success = formattedResult === expected;
    
    console.log(`Result: ${formatDetailedDate(result)}`);
    console.log(`Expected: ${expected}`);
    console.log(`Test: ${success ? '✅ PASS' : '❌ FAIL'}`);
    
    return { input, result: formattedResult, expected, success };
  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.log(`Test: ❌ FAIL (Error)`);
    return { input, result: 'error', expected, success: false };
  }
}

// Run groups of tests
function runTestGroup(title, tests) {
  console.log(`\n=== ${title} ===`);
  
  let passed = 0;
  const total = tests.length;
  
  tests.forEach(t => {
    const result = test(t.input, t.expected, t.description);
    if (result.success) passed++;
  });
  
  console.log(`\n📊 ${title}: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
}

// Define test groups
const testGroups = [
  {
    title: 'Relative Dates',
    tests: [
      { input: 'today', expected: formatDate(new Date()), description: 'Today' },
      { input: 'tod', expected: formatDate(new Date()), description: 'Today abbreviation' },
      { input: 'tomorrow', expected: formatDate(new Date(new Date().setDate(new Date().getDate() + 1))), description: 'Tomorrow' },
      { input: 'tom', expected: formatDate(new Date(new Date().setDate(new Date().getDate() + 1))), description: 'Tomorrow abbreviation' },
      { input: 'in 3 days', expected: formatDate(new Date(new Date().setDate(new Date().getDate() + 3))), description: 'In X days' },
      { input: 'in 1 week', expected: formatDate(new Date(new Date().setDate(new Date().getDate() + 7))), description: 'In X weeks' },
    ]
  },
  {
    title: 'Day Names',
    tests: [
      { input: 'monday', expected: formatDate(getNextDayOfWeek(1)), description: 'Full day name' },
      { input: 'mon', expected: formatDate(getNextDayOfWeek(1)), description: 'Abbreviated day name' },
      { input: 'next friday', expected: formatDate(getNextDayOfWeek(5)), description: 'Next + day name' },
      { input: 'this sunday', expected: formatDate(getThisDayOfWeek(0)), description: 'This + day name' },
    ]
  },
  {
    title: 'Month Day Year format',
    tests: [
      { input: 'jun 23 2026', expected: '2026-06-23', description: 'Short month name' },
      { input: 'december 31 2025', expected: '2025-12-31', description: 'Full month name' },
      { input: 'jan 1 2030', expected: '2030-01-01', description: 'Single digit day' }
    ]
  },
  {
    title: 'Day Month Year format',
    tests: [
      { input: '23 june 2026', expected: '2026-06-23', description: 'Full month name' },
      { input: '1 january 2030', expected: '2030-01-01', description: 'Single digit day' },
      { input: '12 feb 2028', expected: '2028-02-12', description: 'Short month name' }
    ]
  },
  {
    title: 'YYYYMMDD format',
    tests: [
      { input: '20260623', expected: '2026-06-23', description: 'Basic YYYYMMDD' },
      { input: '20301231', expected: '2030-12-31', description: 'Year end' },
      { input: '20300101', expected: '2030-01-01', description: 'Year start' }
    ]
  },
  {
    title: 'Ordinal formats',
    tests: [
      { input: '23rd june 2026', expected: '2026-06-23', description: 'Day + ordinal + month + year' },
      { input: 'jun 23rd 2026', expected: '2026-06-23', description: 'Month + day + ordinal + year' },
      { input: '1st of january', expected: formatDate(getNextMonthDay(0, 1)), description: 'Ordinal with "of"' }
    ]
  },
  {
    title: 'Combined with time',
    tests: [
      { input: 'tomorrow at 3pm', expected: formatDate(new Date(new Date().setDate(new Date().getDate() + 1))), description: 'Tomorrow + time' },
      { input: 'june 23 2026 at 15:30', expected: '2026-06-23', description: 'Date + 24hr time' },
      { input: 'mon at noon', expected: formatDate(getNextDayOfWeek(1)), description: 'Day + noon' }
    ]
  },
  {
    title: 'Time of day',
    tests: [
      { input: 'tomorrow morning', expected: formatDate(new Date(new Date().setDate(new Date().getDate() + 1))), description: 'With morning' },
      { input: 'june 23 evening', expected: '2026-06-23', description: 'With evening' },
    ]
  },
  {
    title: 'Edge cases',
    tests: [
      { input: 'jun 32 2026', expected: 'null', description: 'Invalid day' },
      { input: '20261332', expected: 'null', description: 'Invalid month' },
      { input: '2026', expected: '2026-01-01', description: 'Just a year' },
      { input: '', expected: 'null', description: 'Empty input' }
    ]
  },
  {
    title: 'Mixed formats',
    tests: [
      { input: 'jun 23, 2026', expected: '2026-06-23', description: 'With comma' },
      { input: '23/jun/2026', expected: '2026-06-23', description: 'With slashes' },
      { input: '23-jun-2026', expected: '2026-06-23', description: 'With hyphens' }
    ]
  }
];

// Helper functions for day calculations
function getNextDayOfWeek(dayIndex) {
  const today = new Date();
  const todayDayIndex = today.getDay();
  
  // Calculate days to add
  let daysToAdd = dayIndex - todayDayIndex;
  if (daysToAdd <= 0) daysToAdd += 7; // If the day is today or in the past, get next week
  
  const result = new Date(today);
  result.setDate(today.getDate() + daysToAdd);
  return result;
}

function getThisDayOfWeek(dayIndex) {
  const today = new Date();
  const todayDayIndex = today.getDay();
  
  // Calculate days to add
  let daysToAdd = dayIndex - todayDayIndex;
  if (daysToAdd < 0) daysToAdd += 7; // If the day is in the past, get next week
  
  const result = new Date(today);
  result.setDate(today.getDate() + daysToAdd);
  return result;
}

function getNextMonthDay(monthIndex, day) {
  const today = new Date();
  const currentMonth = today.getMonth();
  
  let targetMonth = monthIndex;
  let targetYear = today.getFullYear();
  
  // If the target month is earlier than the current month, go to next year
  if (targetMonth < currentMonth) {
    targetYear++;
  } else if (targetMonth === currentMonth && day < today.getDate()) {
    // If same month but day has passed, go to next year
    targetYear++;
  }
  
  return new Date(targetYear, targetMonth, day);
}

// Run the tests
console.log('=== DumbDateParser Test Suite ===\n');

testGroups.forEach(group => runTestGroup(group.title, group.tests));

// Final summary
const totalTests = testGroups.reduce((sum, group) => sum + group.tests.length, 0);
console.log(`\n=== Test Summary ===`);
console.log(`Ran ${totalTests} tests across ${testGroups.length} categories`);
console.log(`Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
console.log(`Current date: ${new Date().toLocaleString()}`); 