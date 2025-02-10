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

    const TIME_DEFAULTS = {
        'morning': 5,    // 5 AM
        'afternoon': 12, // 12 PM
        'evening': 17,   // 5 PM
        'night': 20     // 8 PM
    };

    class DumbDateParser {
        constructor(options = {}) {
            this.options = options;
            this.defaultYear = options.defaultYear || new Date().getFullYear();
            this.pastDatesAllowed = options.pastDatesAllowed || false;
        }

        static parseDate(text) {
            return new DumbDateParser().parse(text);
        }

        parse(text) {
            if (!text) return null;
            text = text.toLowerCase().trim();

            // Split into date and time parts if "at" is present
            const parts = text.split(' at ');
            let date = null;
            
            // Parse the date part
            if (parts.length > 0) {
                date = this._parseRelative(parts[0]) ||
                       this._parseSingleDay(parts[0]) ||
                       this._parseNextDay(parts[0]) ||
                       this._parseOrdinalDay(parts[0]) ||
                       this._parseSimpleDate(parts[0]) ||
                       this._parseDirectDate(parts[0]);
            }
            
            if (!date) return null;
            
            // Parse the time part if it exists
            if (parts.length > 1) {
                this._applyTime(date, parts[1]);
            } else {
                // Check if the original text contains time-of-day indicators
                const timeMatch = text.match(/(morning|afternoon|evening|night)/);
                if (timeMatch) {
                    date.setHours(TIME_DEFAULTS[timeMatch[1]], 0, 0, 0);
                }
            }
            
            return date;
        }

        _applyTime(date, timeStr) {
            timeStr = timeStr.trim();
            
            // Try 24-hour format first (15:00)
            const militaryMatch = timeStr.match(/^(\d{1,2}):?(\d{2})?$/);
            if (militaryMatch) {
                const hours = parseInt(militaryMatch[1]);
                const minutes = militaryMatch[2] ? parseInt(militaryMatch[2]) : 0;
                if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                    date.setHours(hours, minutes, 0, 0);
                    return true;
                }
            }
            
            // Try 12-hour format (3pm, 3:30pm)
            const twelveHourMatch = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
            if (twelveHourMatch) {
                let hours = parseInt(twelveHourMatch[1]);
                const minutes = twelveHourMatch[2] ? parseInt(twelveHourMatch[2]) : 0;
                const isPM = twelveHourMatch[3].toLowerCase() === 'pm';
                
                if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes < 60) {
                    if (isPM && hours !== 12) hours += 12;
                    if (!isPM && hours === 12) hours = 0;
                    date.setHours(hours, minutes, 0, 0);
                    return true;
                }
            }
            
            // Try time-of-day words
            if (timeStr in TIME_DEFAULTS) {
                date.setHours(TIME_DEFAULTS[timeStr], 0, 0, 0);
                return true;
            }
            
            return false;
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