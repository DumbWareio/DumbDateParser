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
            
            // Check for 4-digit year pattern and prioritize date formats with explicit years
            const hasYear = /\b\d{4}\b/.test(text);
            
            // Split into date and time parts if "at" is present
            const parts = text.split(' at ');
            let date = null;
            
            // Parse the date part
            if (parts.length > 0) {
                // If the text contains a year, try date formats with years first
                if (hasYear) {
                    date = this._parseFormattedDate(parts[0]) || 
                           this._parseDirectDate(parts[0]);
                }
                
                // If no date was found or no year was present, try the other formats
                if (!date) {
                    date = this._parseRelative(parts[0]) ||
                           this._parseSingleDay(parts[0]) ||
                           this._parseNextDay(parts[0]) ||
                           this._parseOrdinalDay(parts[0]) ||
                           this._parseSimpleDate(parts[0]);
                    
                    // As a last resort, try the date formats with years and direct parsing
                    if (!date && !hasYear) {
                        date = this._parseFormattedDate(parts[0]) || 
                               this._parseDirectDate(parts[0]);
                    }
                }
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
                const tzOffset = TIMEZONE_OFFSETS[tz];
                if (tzOffset !== undefined) {
                    // Get the difference between local timezone and input timezone
                    const localOffset = -date.getTimezoneOffset() / 60; // Convert to hours and invert sign
                    const hoursDiff = localOffset - tzOffset;
                    
                    // Adjust the time by the difference in hours
                    date.setHours(date.getHours() + hoursDiff);
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
                // Default to midnight for invalid time
                date.setHours(0, 0, 0, 0);
                return true;
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
                // Default to midnight for invalid time
                date.setHours(0, 0, 0, 0);
                return true;
            }
            
            // Try time-of-day words using instance-specific defaults
            if (timeStr in this.timeDefaults) {
                date.setHours(this.timeDefaults[timeStr], 0, 0, 0);
                return true;
            }
            
            // Default to midnight for invalid time
            date.setHours(0, 0, 0, 0);
            return false;
        }

        _parseRelative(text) {
            // Handle today/tomorrow with shorthand
            if (text === 'today' || text === 'tod') return this._createDate();
            if (text === 'tomorrow' || text === 'tom') {
                const date = this._createDate();
                date.setDate(date.getDate() + 1);
                return date;
            }
            if (text === 'yesterday') {
                const date = this._createDate();
                date.setDate(date.getDate() - 1);
                return date;
            }

            // Handle "in X days/weeks"
            const inDaysMatch = text.match(/in (\d+) days?/);
            if (inDaysMatch) {
                const date = this._createDate();
                date.setDate(date.getDate() + parseInt(inDaysMatch[1]));
                return date;
            }

            const inWeeksMatch = text.match(/in (\d+) weeks?/);
            if (inWeeksMatch) {
                const date = this._createDate();
                date.setDate(date.getDate() + (parseInt(inWeeksMatch[1]) * 7));
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
            const ordinalMatch = text.match(/(\d+)(st|nd|rd|th) (sun|mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday) (?:in |of )?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)?/);
            if (!ordinalMatch) {
                // Try simpler format if complex one fails
                const simpleMatch = text.match(/^(\d+)(st|nd|rd|th) (of )?([a-z]+)$/);
                if (!simpleMatch) return null;

                const day = parseInt(simpleMatch[1]);
                const monthName = simpleMatch[4];
                const monthNum = MONTHS[monthName];

                if (monthNum === undefined || day < 1 || day > 31) return null;

                const date = this._createDate();
                date.setMonth(monthNum);
                date.setDate(day);

                if (!this.pastDatesAllowed && date < new Date()) {
                    date.setFullYear(date.getFullYear() + 1);
                }

                return date;
            }

            const ordinal = parseInt(ordinalMatch[1]);
            const targetDay = DAYS[ordinalMatch[3]];
            const targetMonth = ordinalMatch[4] ? MONTHS[ordinalMatch[4]] : new Date().getMonth();
            
            const result = new Date(this.defaultYear, targetMonth, 1);
            
            while (result.getDay() !== targetDay) {
                result.setDate(result.getDate() + 1);
            }
            
            result.setDate(result.getDate() + (ordinal - 1) * 7);
            
            if (!this.pastDatesAllowed && result < new Date()) {
                result.setFullYear(result.getFullYear() + 1);
            }
            
            return result;
        }

        _parseSimpleDate(text) {
            // Check if input is just a month name
            if (text in MONTHS) {
                const result = new Date(this.defaultYear, MONTHS[text], 1);
                
                // If date is in the past and past dates aren't allowed, move to next year
                if (!this.pastDatesAllowed && result < new Date()) {
                    result.setFullYear(result.getFullYear() + 1);
                }
                
                return result;
            }

            // Handle day + month (e.g., "15 march" or "march 15" or "15th march" or "march 15th")
            const dateMatch = text.match(/(?:(\d{1,2})(?:st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december))|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s*(\d{1,2})(?:st|nd|rd|th)?/);
            if (!dateMatch) return null;

            let day, month;
            if (dateMatch[1]) {
                day = parseInt(dateMatch[1]);
                month = MONTHS[dateMatch[2]];
            } else {
                day = parseInt(dateMatch[4]);
                month = MONTHS[dateMatch[3]];
            }
            
            // Basic validation before creating the date
            if (month === undefined || day < 1 || day > 31) return null;

            const result = new Date(this.defaultYear, month, day);
            
            // Validate that the date is actually valid
            // If the month or day in the result doesn't match what we set,
            // it means the date was invalid (e.g., Feb 31, Jun 32)
            if (result.getMonth() !== month || result.getDate() !== day) return null;
            
            // If date is in the past and past dates aren't allowed, move to next year
            if (!this.pastDatesAllowed && result < new Date()) {
                result.setFullYear(result.getFullYear() + 1);
            }
            
            return result;
        }

        _parseFormattedDate(text) {
            // First check for year patterns in the text - very strict to avoid false positives
            const yearPattern = /\b(\d{4})\b/;
            const yearMatch = text.match(yearPattern);
            if (!yearMatch) return null;
            
            const year = parseInt(yearMatch[1]);
            if (year < 1000) return null;
            
            // Match formats like "jun 23 2026" or "jun 23, 2026" (with optional comma)
            const monthDayYearMatch = text.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(\d{4})$/);
            if (monthDayYearMatch) {
                const month = MONTHS[monthDayYearMatch[1]];
                const day = parseInt(monthDayYearMatch[2]);
                const year = parseInt(monthDayYearMatch[3]);

                if (month === undefined || day < 1 || day > 31 || year < 1000) return null;
                
                // Explicitly create a date with the specified year
                const result = new Date(year, month, day);
                
                // Check if the resulting date is valid (e.g., not Feb 31)
                if (result.getMonth() !== month || result.getDate() !== day) return null;
                
                return result;
            }

            // Match formats like "23 june 2026" or "23, june 2026" (with optional comma)
            const dayMonthYearMatch = text.match(/^(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)(?:,)?\s+(\d{4})$/);
            if (dayMonthYearMatch) {
                const day = parseInt(dayMonthYearMatch[1]);
                const month = MONTHS[dayMonthYearMatch[2]];
                const year = parseInt(dayMonthYearMatch[3]);

                if (month === undefined || day < 1 || day > 31 || year < 1000) return null;
                
                // Explicitly create a date with the specified year
                const result = new Date(year, month, day);
                
                // Check if the resulting date is valid (e.g., not Feb 31)
                if (result.getMonth() !== month || result.getDate() !== day) return null;
                
                return result;
            }

            // Match slash-separated formats like "23/jun/2026" or "23/june/2026"
            const slashDateMatch = text.match(/^(\d{1,2})[\/\\]+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[\/\\]+(\d{4})$/);
            if (slashDateMatch) {
                const day = parseInt(slashDateMatch[1]);
                const month = MONTHS[slashDateMatch[2]];
                const year = parseInt(slashDateMatch[3]);

                if (month === undefined || day < 1 || day > 31 || year < 1000) return null;
                
                // Explicitly create a date with the specified year
                const result = new Date(year, month, day);
                
                // Check if the resulting date is valid
                if (result.getMonth() !== month || result.getDate() !== day) return null;
                
                return result;
            }

            // Also match formats with ordinals like "jun 23rd 2026" or "23rd june 2026"
            const monthOrdinalYearMatch = text.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)\s+(\d{4})$/);
            if (monthOrdinalYearMatch) {
                const month = MONTHS[monthOrdinalYearMatch[1]];
                const day = parseInt(monthOrdinalYearMatch[2]);
                const year = parseInt(monthOrdinalYearMatch[4]);

                if (month === undefined || day < 1 || day > 31 || year < 1000) return null;
                
                // Explicitly create a date with the specified year
                const result = new Date(year, month, day);
                
                // Check if the resulting date is valid (e.g., not Feb 31)
                if (result.getMonth() !== month || result.getDate() !== day) return null;
                
                return result;
            }

            const ordinalMonthYearMatch = text.match(/^(\d{1,2})(st|nd|rd|th)\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s+(\d{4})$/);
            if (ordinalMonthYearMatch) {
                const day = parseInt(ordinalMonthYearMatch[1]);
                const month = MONTHS[ordinalMonthYearMatch[3]];
                const year = parseInt(ordinalMonthYearMatch[4]);

                if (month === undefined || day < 1 || day > 31 || year < 1000) return null;
                
                // Explicitly create a date with the specified year
                const result = new Date(year, month, day);
                
                // Check if the resulting date is valid (e.g., not Feb 31)
                if (result.getMonth() !== month || result.getDate() !== day) return null;
                
                return result;
            }

            // If none of the specific patterns matched but we found a year,
            // check for "month day year" or "day month year" in any format
            const genericMonthDayYearMatch = text.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\d{4})/);
            if (genericMonthDayYearMatch) {
                const month = MONTHS[genericMonthDayYearMatch[1]];
                const day = parseInt(genericMonthDayYearMatch[2]);
                const year = parseInt(genericMonthDayYearMatch[3]);
                
                if (month === undefined || day < 1 || day > 31 || year < 1000) return null;
                
                const result = new Date(year, month, day);
                if (result.getMonth() !== month || result.getDate() !== day) return null;
                
                return result;
            }
            
            const genericDayMonthYearMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s+(\d{4})/);
            if (genericDayMonthYearMatch) {
                const day = parseInt(genericDayMonthYearMatch[1]);
                const month = MONTHS[genericDayMonthYearMatch[2]];
                const year = parseInt(genericDayMonthYearMatch[3]);
                
                if (month === undefined || day < 1 || day > 31 || year < 1000) return null;
                
                const result = new Date(year, month, day);
                if (result.getMonth() !== month || result.getDate() !== day) return null;
                
                return result;
            }

            return null;
        }

        _parseDirectDate(text) {
            // Match formats like "yyyy/mm/dd", "yyyy-mm-dd", "yyyy.mm.dd"
            const match = text.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]) - 1;
                const day = parseInt(match[3]);

                if (month < 0 || month > 11 || day < 1 || day > 31) return null;
                
                // Create a date with the specified year
                const result = new Date(year, month, day);
                
                // Check if the resulting date is valid (e.g., not Feb 31)
                if (result.getMonth() !== month || result.getDate() !== day) return null;
                
                return result;
            }

            // Match compact YYYYMMDD format
            const compactMatch = text.match(/^(\d{4})(\d{2})(\d{2})$/);
            if (compactMatch) {
                const year = parseInt(compactMatch[1]);
                const month = parseInt(compactMatch[2]) - 1;
                const day = parseInt(compactMatch[3]);

                if (month < 0 || month > 11 || day < 1 || day > 31) return null;
                
                // Create a date with the specified year
                const result = new Date(year, month, day);
                
                // Check if the resulting date is valid (e.g., not Feb 31)
                if (result.getMonth() !== month || result.getDate() !== day) return null;
                
                return result;
            }

            // Match cases with a year and possibly incomplete date
            // BUT ONLY when the string consists of just a 4-digit year
            const yearMatch = text.match(/^(\d{4})$/);
            if (yearMatch) {
                const year = parseInt(yearMatch[1]);
                if (year < 1000) return null;
                
                // Return the first day of the year if only the year is provided
                return new Date(year, 0, 1);
            }

            // Do NOT try to parse arbitrary text containing years
            // Like "jun 32 2026" - there's no standard for this
            
            return null;
        }
    }

    // Export to global scope for browser
    global.DumbDateParser = DumbDateParser;
})(typeof window !== 'undefined' ? window : this); 