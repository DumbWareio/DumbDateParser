// DumbDateParser - Browser Version
// Part of the DumbWare suite - Why So DUMB?

(function(global) {
    const DAYS = {
        'sun': 0, 'sunday': 0,
        'mon': 1, 'monday': 1,
        'tue': 2, 'tues': 2, 'tuesday': 2,
        'wed': 3, 'weds': 3, 'wednesday': 3,
        'thu': 4, 'thur': 4, 'thurs': 4, 'thursday': 4,
        'fri': 5, 'friday': 5,
        'sat': 6, 'saturday': 6
    };

    const MONTHS = {
        'jan': 0, 'january': 0,
        'feb': 1, 'february': 1,
        'mar': 2, 'march': 2,
        'apr': 3, 'april': 3,
        'may': 4,
        'jun': 5, 'june': 5,
        'jul': 6, 'july': 6,
        'aug': 7, 'august': 7,
        'sep': 8, 'sept': 8, 'september': 8,
        'oct': 9, 'october': 9,
        'nov': 10, 'november': 10,
        'dec': 11, 'december': 11
    };

    class DumbDateParser {
        constructor(options = {}) {
            this.options = options;
        }

        static parseDate(text) {
            return new DumbDateParser().parse(text);
        }

        parse(text) {
            if (!text) return null;
            text = text.toLowerCase().trim();

            // Try each parsing method
            return this._parseRelative(text) ||
                   this._parseSingleDay(text) ||
                   this._parseNextDay(text) ||
                   this._parseOrdinalDay(text) ||
                   this._parseSimpleDate(text) ||
                   this._parseDirectDate(text);
        }

        _parseRelative(text) {
            const today = new Date();
            
            if (text === 'today') return today;
            if (text === 'tomorrow') {
                today.setDate(today.getDate() + 1);
                return today;
            }
            if (text === 'yesterday') {
                today.setDate(today.getDate() - 1);
                return today;
            }

            const nextMatch = text.match(/^next (week|month|year)$/);
            if (nextMatch) {
                const unit = nextMatch[1];
                if (unit === 'week') today.setDate(today.getDate() + 7);
                if (unit === 'month') today.setMonth(today.getMonth() + 1);
                if (unit === 'year') today.setFullYear(today.getFullYear() + 1);
                return today;
            }

            return null;
        }

        _parseSingleDay(text) {
            for (const [day, value] of Object.entries(DAYS)) {
                if (text === day) {
                    const date = new Date();
                    const currentDay = date.getDay();
                    const diff = value - currentDay;
                    date.setDate(date.getDate() + (diff <= 0 ? diff + 7 : diff));
                    return date;
                }
            }
            return null;
        }

        _parseNextDay(text) {
            for (const [day, value] of Object.entries(DAYS)) {
                if (text === `next ${day}`) {
                    const date = new Date();
                    const currentDay = date.getDay();
                    const diff = value - currentDay;
                    date.setDate(date.getDate() + (diff <= 0 ? diff + 7 : diff));
                    return date;
                }
            }
            return null;
        }

        _parseOrdinalDay(text) {
            const match = text.match(/^(\d+)(st|nd|rd|th) (of )?([a-z]+)$/);
            if (!match) return null;

            const day = parseInt(match[1]);
            const monthName = match[4];
            const monthNum = MONTHS[monthName];

            if (monthNum === undefined || day < 1 || day > 31) return null;

            const date = new Date();
            date.setMonth(monthNum);
            date.setDate(day);

            // If the date is in the past, move to next year
            if (date < new Date()) {
                date.setFullYear(date.getFullYear() + 1);
            }

            return date;
        }

        _parseSimpleDate(text) {
            // Match formats like "mm/dd", "mm-dd", "mm.dd"
            const match = text.match(/^(\d{1,2})[\/\-\.](\d{1,2})$/);
            if (!match) return null;

            const month = parseInt(match[1]) - 1;
            const day = parseInt(match[2]);

            if (month < 0 || month > 11 || day < 1 || day > 31) return null;

            const date = new Date();
            date.setMonth(month);
            date.setDate(day);

            // If the date is in the past, move to next year
            if (date < new Date()) {
                date.setFullYear(date.getFullYear() + 1);
            }

            return date;
        }

        _parseDirectDate(text) {
            // Match formats like "yyyy/mm/dd", "yyyy-mm-dd", "yyyy.mm.dd"
            const match = text.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
            if (!match) return null;

            const year = parseInt(match[1]);
            const month = parseInt(match[2]) - 1;
            const day = parseInt(match[3]);

            if (month < 0 || month > 11 || day < 1 || day > 31) return null;

            return new Date(year, month, day);
        }
    }

    // Export to global scope for browser
    global.DumbDateParser = DumbDateParser;
})(typeof window !== 'undefined' ? window : this); 