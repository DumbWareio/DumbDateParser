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