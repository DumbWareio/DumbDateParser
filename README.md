# DumbDateParser

Part of the DumbWare suite - Why So DUMB?

A stupidly simple natural language date parser that somehow gets the job done. Like using a rock as a paperweight: it's not elegant, but hey, the dates aren't going anywhere.

## Why So DUMB?

We believe in the power of stupid simple solutions. This parser is:
- No dependencies
- Zero timezone handling (because timezones are hard)
- Simple pattern matching (who needs fancy algorithms?)
- Just works™ (most of the time)

## Installation

```bash
npm install dumbdateparser
```

## Usage

```javascript
import DumbDateParser from 'dumbdateparser';

// Create a parser instance
const parser = new DumbDateParser({
    pastDatesAllowed: false,  // Don't allow past dates by default
    defaultYear: 2024         // Optional: specify default year for dates
});

// Parse some dates
console.log(parser.parse('today'));              // => Date object for today
console.log(parser.parse('tomorrow'));           // => Date object for tomorrow
console.log(parser.parse('next tuesday'));       // => Date object for next Tuesday
console.log(parser.parse('in 5 days'));          // => Date object 5 days from now
console.log(parser.parse('3rd tuesday in march')); // => Date object for 3rd Tuesday in March
console.log(parser.parse('15 march'));           // => Date object for March 15th
console.log(parser.parse('not a date'));         // => null
```

## Supported Date Formats

- Relative dates:
  - `today`
  - `tomorrow`
  - `in X days`
  - `in X weeks`
- Next day:
  - `next monday` (or any day of the week)
- Ordinal days:
  - `3rd tuesday in march`
  - `2nd friday in september`
- Simple dates:
  - `15 march`
  - `march 15`
  - Any standard date format that JavaScript's Date.parse() understands

## Options

- `pastDatesAllowed` (boolean): Whether to allow dates in the past. If false, past dates will be moved to next year.
- `defaultYear` (number): The year to use when parsing dates without a year. Defaults to current year.

## Contributing

1. Fork it
2. Make it dumber
3. Create a pull request

## Disclaimer

This is part of the DumbWare suite - a collection of stupidly simple software that somehow gets the job done. Use at your own risk, and don't blame us when it parses "next christmas" as "null" because we were too lazy to implement holiday parsing. 