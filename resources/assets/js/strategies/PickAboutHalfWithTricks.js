const _ = require('lodash');
const Searcher = require('../Searcher.js');

/**
 * Attempts to (quickly) find a set of questions that will result in about
 * half of the remaining characters being rejected.
 */
class PickAboutHalfWithTricks
{

    move(me, other, log) {
        this.me = me;
        this.other = other;
        this.log = log;
        this.logRemaining();
        if (this.iHaveTheAnswer()) {
            this.log('Answering: ' + this.theAnswer());
            return this.theAnswer();
        } else if (this.otherGuyIsAboutToWin()) {
            this.log('Answering randomly: ' + this.theAnswer());
            return this.theAnswer();
        } else {
            var target = Math.floor(this.me.board.remaining.length / 2);
            return this.findSearchThatGivesAboutTarget(target);
        }
    }

    logRemaining()
    {
        this.log('Remaining: ' + this.me.board.remaining.length + ' vs ' + this.other.board.remaining.length);
    }

    iHaveTheAnswer()
    {
        return this.me.board.remaining.length == 1;
    }

    theAnswer()
    {
        return this.me.board.remaining[0].name;
    }

    otherGuyIsAboutToWin()
    {
        return this.other.board.remaining.length === 1;
    }

    findSearchThatGivesAboutTarget(target)
    {
        this.log('Trying to cut down to: ' + target);
        var searcher = this.getTraitLessThan(target);
        var old = searcher;
        var ttl = 1000;
        while (this.searcherCount(searcher) < target && ttl-- > 0) {
            old = searcher;
            var add = this.pickAnyTrait();
            searcher = Searcher.or([old, add]);
        }
        var searcher = this.closerToTarget(target, old, searcher);
        var count = this.searcherCount(searcher);
        this.log('Breaking down to ' + count + ' or ' + (this.me.board.remaining.length - count));
        return searcher;
    }

    getTraitLessThan(target)
    {
        var searcher;
        do {
            searcher = this.pickAnyTrait();
        } while (this.searcherCount(searcher) > target);
        return searcher;
    }

    pickAnyTrait() {
        if (!this.fields || this.fields.length === 0) {
            this.fields = _(this.me.board.remaining)
                .map((who) => Object.keys(who))
                .flatten()
                .unique()
                .shuffle()
                .value();
        }
        var field = this.fields.shift();
        var value = _(this.me.board.remaining)
            .map((who) => who[field])
            .filter(value => value)
            .shuffle()
            .value()[0];
        this.log('Filtering on ' + field + ' = ' + value);
        return Searcher.where(field, value);
    }

    searcherCount(searcher) {
        return this.me.board.remaining.filter(who => searcher.test(who)).length;
    }

    closerToTarget(target, old, searcher)
    {
        var searcherCount = this.searcherCount(searcher);
        var oldCount = this.searcherCount(old);
        if (Math.abs(searcherCount - target) > Math.abs(oldCount - target)) {
            return old;
        } else {
            return searcher;
        }
    }
}

PickAboutHalfWithTricks.description = "Pick half the board at a time, with a few tricks";
PickAboutHalfWithTricks.author = "Dan Kuck";

module.exports = PickAboutHalfWithTricks;
