// DumbDateParser - Because sometimes the dumbest solution is the best solution
// Part of the DumbWare suite - Why So DUMB?

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
        this.defaultYear = options.defaultYear || new Date().getFullYear();
        this.pastDatesAllowed = options.pastDatesAllowed || false;
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
        // Handle today/tomorrow with shorthand
        if (text === 'today' || text === 'tod') return new Date();
        if (text === 'tomorrow' || text === 'tom') {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            return date;
        }

        // Handle "in X days/weeks"
        const inDaysMatch = text.match(/in (\d+) days?/);
        if (inDaysMatch) {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(inDaysMatch[1]));
            return date;
        }

        const inWeeksMatch = text.match(/in (\d+) weeks?/);
        if (inWeeksMatch) {
            const date = new Date();
            date.setDate(date.getDate() + (parseInt(inWeeksMatch[1]) * 7));
            return date;
        }

        return null;
    }

    _parseSingleDay(text) {
        // Check if the input is just a day name
        if (text in DAYS) {
            const targetDay = DAYS[text];
            const today = new Date();
            const result = new Date(today);
            
            result.setDate(result.getDate() + (7 + targetDay - result.getDay()) % 7);
            if (result <= today) {
                result.setDate(result.getDate() + 7);
            }
            
            return result;
        }
        return null;
    }

    _parseNextDay(text) {
        const nextDayMatch = text.match(/next (sun|mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
        if (!nextDayMatch) return null;

        const targetDay = DAYS[nextDayMatch[1]];
        const today = new Date();
        const result = new Date(today);
        
        result.setDate(result.getDate() + (7 + targetDay - result.getDay()) % 7);
        if (result <= today) {
            result.setDate(result.getDate() + 7);
        }
        
        return result;
    }

    _parseOrdinalDay(text) {
        const ordinalMatch = text.match(/(\d+)(st|nd|rd|th) (sun|mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday) (?:in |of )?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)?/);
        if (!ordinalMatch) return null;

        const ordinal = parseInt(ordinalMatch[1]);
        const targetDay = DAYS[ordinalMatch[3]];
        const targetMonth = ordinalMatch[4] ? MONTHS[ordinalMatch[4]] : new Date().getMonth();
        
        const result = new Date(this.defaultYear, targetMonth, 1);
        
        // Find the first occurrence of the day
        while (result.getDay() !== targetDay) {
            result.setDate(result.getDate() + 1);
        }
        
        // Add weeks to get to the nth occurrence
        result.setDate(result.getDate() + (ordinal - 1) * 7);
        
        // If date is in the past and past dates aren't allowed, move to next year
        if (!this.pastDatesAllowed && result < new Date()) {
            result.setFullYear(result.getFullYear() + 1);
        }
        
        return result;
    }

    _parseSimpleDate(text) {
        // Handle day + month (e.g., "15 march" or "march 15")
        const dateMatch = text.match(/(?:(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december))|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s*(\d{1,2})/);
        if (!dateMatch) return null;

        let day, month;
        if (dateMatch[1]) {
            day = parseInt(dateMatch[1]);
            month = MONTHS[dateMatch[2]];
        } else {
            day = parseInt(dateMatch[4]);
            month = MONTHS[dateMatch[3]];
        }

        const result = new Date(this.defaultYear, month, day);
        
        // If date is in the past and past dates aren't allowed, move to next year
        if (!this.pastDatesAllowed && result < new Date()) {
            result.setFullYear(result.getFullYear() + 1);
        }
        
        return result;
    }

    _parseDirectDate(text) {
        // Last resort: try direct parsing
        const date = new Date(text);
        if (!isNaN(date.getTime())) {
            return date;
        }
        return null;
    }
}

export default DumbDateParser; 