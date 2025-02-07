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

class DumbDateParser {
    constructor(options = {}) {
        this.defaultYear = options.defaultYear || new Date().getFullYear();
        this.pastDatesAllowed = options.pastDatesAllowed || false;
    }

    parse(text) {
        if (!text) return null;
        text = text.toLowerCase().trim();
        
        // Try all our dumb parsing methods
        return this._parseRelative(text) ||
               this._parseSingleDay(text) ||
               this._parseNextDay(text) ||
               this._parseOrdinalDay(text) ||
               this._parseSimpleDate(text) ||
               this._parseDirectDate(text);
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