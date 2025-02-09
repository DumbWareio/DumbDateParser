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

- Simple dates:
  - `mm/dd`
  - `mm-dd`
  - `mm.dd`

- Full dates:
  - `yyyy/mm/dd`
  - `yyyy-mm-dd`
  - `yyyy.mm.dd`

## Why So Dumb?

At DumbWare, we believe in the power of stupid simple solutions. This date parser doesn't try to be clever - it just does what you'd expect. No fancy algorithms, no complex rules, just pure, unadulterated simplicity that somehow gets the job done.

## License

MIT

## Contributing

1. Fork it
2. Make it dumber
3. Create a pull request

## Disclaimer

This is part of the DumbWare suite - a collection of stupidly simple software that somehow gets the job done. Use at your own risk, and don't blame us when it parses "next christmas" as "null" because we were too lazy to implement holiday parsing. 