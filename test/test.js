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