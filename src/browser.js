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

    // Default times that can be overridden
    const DEFAULT_TIMES = {
        'morning': 5,    // 5 AM
        'afternoon': 12, // 12 PM
        'evening': 17,   // 5 PM
        'night': 20     // 8 PM
    };

    // Simple timezone offsets in hours (positive = ahead of UTC, negative = behind UTC)
    const TIMEZONE_OFFSETS = {
        'pst': -8, 'pdt': -7,
        'mst': -7, 'mdt': -6,
        'cst': -6, 'cdt': -5,
        'est': -5, 'edt': -4,
        'utc': 0, 'gmt': 0,
        'bst': 1,  // British Summer Time
        'cet': 1,  // Central European Time
        'ist': 5.5 // Indian Standard Time
    };

    class DumbDateParser {
        constructor(options = {}) {
            this.options = options;
            this.defaultYear = options.defaultYear || new Date().getFullYear();
            this.pastDatesAllowed = options.pastDatesAllowed || false;
            this.defaultTimezone = options.defaultTimezone || null;
            // Allow overriding time defaults through constructor options
            this.timeDefaults = {
                ...DEFAULT_TIMES,
                ...(options.timeDefaults || {})
            };
            // Store the reference date to ensure consistency
            this._referenceDate = new Date();
        }

        static parseDate(text) {
            return new DumbDateParser().parse(text);
        }

        // Helper to create dates relative to reference date
        _createDate() {
            const date = new Date(this._referenceDate);
            return date;
        }

        parse(text) {
            if (!text) return null;
            text = text.toLowerCase().trim();

            // Reset reference date for each parse
            this._referenceDate = new Date();

            // Extract timezone if present
            let timezone = null;
            Object.keys(TIMEZONE_OFFSETS).forEach(tz => {
                if (text.includes(` ${tz}`)) {
                    timezone = tz;
                    text = text.replace(` ${tz}`, '');
                }
            });

            // Extract time-of-day indicators before splitting
            let timeOfDay = null;
            const timeMatch = text.match(/(morning|afternoon|evening|night)/);
            if (timeMatch) {
                timeOfDay = timeMatch[1];
                text = text.replace(` ${timeOfDay}`, '').replace(`${timeOfDay}`, '').trim();
            }
            
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
            } else if (timeOfDay) {
                // Apply extracted time-of-day
                date.setHours(this.timeDefaults[timeOfDay], 0, 0, 0);
            }

            // Apply timezone offset if specified
            if (timezone || this.defaultTimezone) {
                const tz = timezone || this.defaultTimezone;
                const offset = TIMEZONE_OFFSETS[tz];
                if (offset !== undefined) {
                    // Convert to UTC, then apply the timezone offset
                    const localOffset = date.getTimezoneOffset();
                    date.setMinutes(date.getMinutes() + localOffset); // Convert to UTC
                    date.setMinutes(date.getMinutes() - (offset * 60)); // Apply timezone offset
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
            
            // Try time-of-day words using instance-specific defaults
            if (timeStr in this.timeDefaults) {
                date.setHours(this.timeDefaults[timeStr], 0, 0, 0);
                return true;
            }
            
            return false;
        }

        _parseRelative(text) {
            if (text === 'today') return this._createDate();
            if (text === 'tomorrow') {
                const date = this._createDate();
                date.setDate(date.getDate() + 1);
                return date;
            }
            if (text === 'yesterday') {
                const date = this._createDate();
                date.setDate(date.getDate() - 1);
                return date;
            }

            const nextMatch = text.match(/^next (week|month|year)$/);
            if (nextMatch) {
                const date = this._createDate();
                const unit = nextMatch[1];
                if (unit === 'week') date.setDate(date.getDate() + 7);
                if (unit === 'month') date.setMonth(date.getMonth() + 1);
                if (unit === 'year') date.setFullYear(date.getFullYear() + 1);
                return date;
            }

            return null;
        }

        _parseSingleDay(text) {
            for (const [day, value] of Object.entries(DAYS)) {
                if (text === day) {
                    const date = this._createDate();
                    const diff = (7 + value - date.getDay()) % 7;
                    date.setDate(date.getDate() + (diff === 0 ? 7 : diff));
                    return date;
                }
            }
            return null;
        }

        _parseNextDay(text) {
            for (const [day, value] of Object.entries(DAYS)) {
                if (text === `next ${day}`) {
                    const date = this._createDate();
                    const diff = (7 + value - date.getDay()) % 7;
                    date.setDate(date.getDate() + (diff === 0 ? 7 : diff));
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

            const date = this._createDate();
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

            const date = this._createDate();
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