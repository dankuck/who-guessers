const _ = require('lodash');

class Board
{
    constructor(whos)
    {
        this.remaining = _.cloneDeep(whos);
        this.rejected = [];
    }

    rejectMatches(matcher)
    {
        var separate = this.separate(matcher);
        this.remaining = separate.misses;
        this.rejected = this.rejected.concat(separate.matches);
    }

    rejectMisses(matcher)
    {
        var separate = this.separate(matcher);
        this.remaining = separate.matches;
        this.rejected = this.rejected.concat(separate.misses);
    }

    separate(matcher)
    {
        var matches = [];
        var misses = [];
        this.remaining.map((object) => {
            if (matcher.test(object)) {
                matches.push(object);
            } else {
                misses.push(object);
            }
        });
        return {matches, misses};
    }
}

module.exports = Board;
