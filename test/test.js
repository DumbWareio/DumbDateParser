import DumbDateParser from '../src/index.js';

// Simple test framework because we're too DUMB for real testing frameworks
function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
    } catch (error) {
        console.log(`❌ ${name}`);
        console.error(`   ${error.message}\n`);
        process.exitCode = 1;
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

const parser = new DumbDateParser();

// Core functionality tests
test('parses today', () => {
    const result = parser.parse('today');
    assert(result instanceof Date, 'Should return a Date object');
    assert(result.toDateString() === new Date().toDateString(), 'Should match today\'s date');
});

test('parses tomorrow', () => {
    const result = parser.parse('tomorrow');
    const expected = new Date();
    expected.setDate(expected.getDate() + 1);
    assert(result.toDateString() === expected.toDateString(), 'Should be tomorrow\'s date');
});

test('parses next day', () => {
    const result = parser.parse('next friday');
    assert(result instanceof Date, 'Should return a Date object');
    assert(result.getDay() === 5, 'Should be a Friday');
    assert(result > new Date(), 'Should be in the future');
});

test('parses relative days', () => {
    const result = parser.parse('in 5 days');
    const expected = new Date();
    expected.setDate(expected.getDate() + 5);
    assert(result.toDateString() === expected.toDateString(), 'Should be 5 days from now');
});

test('parses ordinal days', () => {
    const result = parser.parse('3rd tuesday in march');
    assert(result instanceof Date, 'Should return a Date object');
    assert(result.getDay() === 2, 'Should be a Tuesday');
    assert(result.getMonth() === 2, 'Should be in March');
});

test('handles invalid input', () => {
    assert(parser.parse('not a date') === null, 'Should return null for invalid input');
    assert(parser.parse('') === null, 'Should return null for empty input');
    assert(parser.parse(null) === null, 'Should return null for null input');
});

// Time parsing tests
test('parses time with at keyword', () => {
    const result = parser.parse('today at 3pm');
    assert(result instanceof Date, 'Should return a Date object');
    assert(result.getHours() === 15, 'Should be 3 PM');
    assert(result.getMinutes() === 0, 'Should have 0 minutes');
});

test('parses 24-hour time', () => {
    const result = parser.parse('today at 15:30');
    assert(result instanceof Date, 'Should return a Date object');
    assert(result.getHours() === 15, 'Should be 15:00');
    assert(result.getMinutes() === 30, 'Should be 30 minutes');
});

test('parses time periods', () => {
    let result = parser.parse('tomorrow morning');
    assert(result.getHours() === 5, 'Morning should be 5 AM');

    result = parser.parse('today afternoon');
    assert(result.getHours() === 12, 'Afternoon should be 12 PM');

    result = parser.parse('today evening');
    assert(result.getHours() === 17, 'Evening should be 5 PM');

    result = parser.parse('today night');
    assert(result.getHours() === 20, 'Night should be 8 PM');
});

test('parses complex date and time', () => {
    const result = parser.parse('next tuesday in the afternoon');
    assert(result instanceof Date, 'Should return a Date object');
    assert(result.getDay() === 2, 'Should be a Tuesday');
    assert(result.getHours() === 12, 'Should be 12 PM');
    assert(result > new Date(), 'Should be in the future');
});

test('handles invalid time', () => {
    const result = parser.parse('today at 25:00');
    assert(result instanceof Date, 'Should return a Date object');
    assert(result.getHours() === 0, 'Should default to midnight for invalid time');
});

// Timezone tests
test('parses time with timezone', () => {
    const result = parser.parse('today at 3pm pst');
    assert(result instanceof Date, 'Should return a Date object');
    
    // Convert result to UTC hours for comparison
    const utcHours = result.getUTCHours();
    // 3PM PST = 23:00 UTC (PST is UTC-8)
    assert(utcHours === 23, 'Should convert PST to UTC correctly');
});

test('handles default timezone', () => {
    const tzParser = new DumbDateParser({ defaultTimezone: 'est' });
    const result = tzParser.parse('today at 15:00');
    assert(result instanceof Date, 'Should return a Date object');
    
    // Convert result to UTC hours for comparison
    const utcHours = result.getUTCHours();
    // 3PM EST = 20:00 UTC (EST is UTC-5)
    assert(utcHours === 20, 'Should apply default timezone correctly');
});

test('handles timezone in complex expressions', () => {
    const result = parser.parse('next friday at 2pm est');
    assert(result instanceof Date, 'Should return a Date object');
    assert(result.getDay() === 5, 'Should be a Friday');
    
    // Convert result to UTC hours for comparison
    const utcHours = result.getUTCHours();
    // 2PM EST = 19:00 UTC (EST is UTC-5)
    assert(utcHours === 19, 'Should handle timezone in complex expressions');
});

test('parses day with time-of-day', () => {
    const result = parser.parse('thurs afternoon');
    assert(result instanceof Date, 'Should return a Date object');
    assert(result.getDay() === 4, 'Should be a Thursday');
    assert(result.getHours() === 12, 'Should be 12 PM');
    assert(result > new Date(), 'Should be in the future');

    const result2 = parser.parse('friday morning');
    assert(result2 instanceof Date, 'Should return a Date object');
    assert(result2.getDay() === 5, 'Should be a Friday');
    assert(result2.getHours() === 5, 'Should be 5 AM');
    assert(result2 > new Date(), 'Should be in the future');
}); 