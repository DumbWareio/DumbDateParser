# DumbDateParser

Part of the DumbWare suite - Why So DUMB?

A stupidly simple date parser that just works. No fancy algorithms, no complex rules - just parse dates like a human would.

## Installation

```bash
npm install dumbdateparser
```

## Usage

### Node.js

```javascript
import DumbDateParser from 'dumbdateparser';

// Use the static method
const date = DumbDateParser.parseDate('tomorrow');

// Or create an instance
const parser = new DumbDateParser();
const date = parser.parse('next friday');
```

### Browser

```html
<script src="node_modules/dumbdateparser/src/browser.js"></script>
<script>
    // The parser is available globally as DumbDateParser
    const date = DumbDateParser.parseDate('tomorrow');
</script>
```

## Supported Date Formats

- Relative dates:
  - `today`
  - `tomorrow`
  - `yesterday`
  - `next week`
  - `next month`
  - `next year`

- Days of the week:
  - `monday` (or `mon`)
  - `tuesday` (or `tue`, `tues`)
  - `wednesday` (or `wed`, `weds`)
  - `thursday` (or `thu`, `thur`, `thurs`)
  - `friday` (or `fri`)
  - `saturday` (or `sat`)
  - `sunday` (or `sun`)

- Next specific day:
  - `next monday`
  - `next friday`
  - etc.

- Ordinal dates:
  - `1st of january`
  - `15th march`
  - `23rd of december`

- Month Day Year formats:
  - `jun 23 2026`
  - `december 31 2025`
  
- Day Month Year formats:
  - `23 june 2026`
  - `1 january 2030`

- Simple dates:
  - `mm/dd`
  - `mm-dd`
  - `mm.dd`

- Full dates:
  - `yyyy/mm/dd`
  - `yyyy-mm-dd`
  - `yyyy.mm.dd`
  - `yyyymmdd` (compact format, e.g., `20260623`)

## Time and Timezone Support

### Time Formats

- 24-hour format: `15:00`, `9:30`
- 12-hour format: `3pm`, `9:30am`
- Time of day words:
  - `morning` (5 AM by default)
  - `afternoon` (12 PM by default)
  - `evening` (5 PM by default)
  - `night` (8 PM by default)

### Timezone Support

The parser supports common timezone abbreviations and handles conversions automatically:

```javascript
// EST input will be converted to your local timezone
const parser = new DumbDateParser();
const date = parser.parse('mar 2 at 2pm est');

// Set a default timezone for all parsing
const tzParser = new DumbDateParser({ defaultTimezone: 'pst' });
const date = tzParser.parse('tomorrow at 3pm'); // Will be interpreted as PST
```

Supported timezones:
- PST/PDT (Pacific Time)
- MST/MDT (Mountain Time)
- CST/CDT (Central Time)
- EST/EDT (Eastern Time)
- UTC/GMT
- BST (British Summer Time)
- CET (Central European Time)
- IST (Indian Standard Time)

If no timezone is specified, the parser assumes the input is in your local timezone.

### Customizing Time Defaults

You can override the default times for morning, afternoon, evening, and night:

```javascript
const parser = new DumbDateParser({
    timeDefaults: {
        morning: 7,     // 7 AM
        afternoon: 13,  // 1 PM
        evening: 18,    // 6 PM
        night: 22      // 10 PM
    }
});
```

You can also set these via environment variables:
- `DUMB_TIME_MORNING`
- `DUMB_TIME_AFTERNOON`
- `DUMB_TIME_EVENING`
- `DUMB_TIME_NIGHT`

### Examples with Time and Timezone

```javascript
const parser = new DumbDateParser();

// Different time formats
parser.parse('tomorrow at 15:00');        // 24-hour format
parser.parse('friday at 3:30pm');         // 12-hour format
parser.parse('monday morning');           // Time of day word

// Timezone handling
parser.parse('mar 2 at 2pm est');         // EST converted to local time
parser.parse('tomorrow at 3pm pst');      // PST converted to local time
parser.parse('friday at 12pm utc');       // UTC converted to local time

// Default timezone
const tzParser = new DumbDateParser({ defaultTimezone: 'est' });
tzParser.parse('tomorrow at 3pm');        // Interpreted as 3 PM EST
```

## Why So Dumb?

At DumbWare, we believe in the power of stupid simple solutions. This date parser doesn't try to be clever - it just does what you'd expect. No fancy algorithms, no complex rules, just pure, unadulterated simplicity that somehow gets the job done.

## Dual-File Structure

This library includes two main files:

- `index.js`: For Node.js and modern bundlers (supports ES modules)
- `browser.js`: For direct browser usage without bundling (exposes a global `DumbDateParser` object)

This design gives you flexibility in how you use the library:

```javascript
// Modern JavaScript with bundlers or Node.js
import DumbDateParser from 'dumbdateparser';

// Direct browser usage via <script> tag
// window.DumbDateParser is available globally
const parser = new DumbDateParser();
```

Both files provide identical functionality with environment-appropriate implementations.

## License

MIT

## Contributing

1. Fork it
2. Make it dumber
3. Create a pull request

## Disclaimer

This is part of the DumbWare suite - a collection of stupidly simple software that somehow gets the job done. Use at your own risk, and don't blame us when it parses "next christmas" as "null" because we were too lazy to implement holiday parsing. 