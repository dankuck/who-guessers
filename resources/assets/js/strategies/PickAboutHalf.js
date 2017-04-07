const _ = require('lodash');
const Searcher = require('../Searcher.js');

/**
 * Attempts to (quickly) find a set of questions that will result in about
 * half of the remaining characters being rejected.
 */
class PickAboutHalf
{

    move(me, other, log) {
        log('Remaining: ' + me.board.remaining.length + ' vs ' + other.board.remaining.length);
        if (me.board.remaining.length == 1) {
            log('Answering: ' + me.board.remaining[0].name);
            return me.board.remaining[0].name;
        } else {
            var target = Math.floor(me.board.remaining.length / 2);
            log('Trying to cut down to: ' + target);
            var searcher = this.pickAnyTrait(me, other, log);
            var old = searcher;
            var ttl = 100;
            while (this.searcherCount(me.board.remaining, searcher) < target && ttl-- > 0) {
                old = searcher;
                var add = this.pickAnyTrait(me, other, log);
                searcher = Searcher.or([old, add]);
            }
            var searcherCount = this.searcherCount(me.board.remaining, searcher);
            var oldCount = this.searcherCount(me.board.remaining, old);
            if (Math.abs(searcherCount - target) > Math.abs(oldCount - target)) {
                log('Breaking down to ' + oldCount + ' or ' + (me.board.remaining.length - oldCount));
                return old;
            } else {
                log('Breaking down to ' + searcherCount + ' or ' + (me.board.remaining.length - searcherCount));
                return searcher;
            }
        }
    }

    pickAnyTrait(me, other, log) {
        var field = _(me.board.remaining)
            .map((who) => Object.keys(who))
            .flatten()
            .unique()
            .shuffle()
            .value()[0];
        var value = _(me.board.remaining)
            .map((who) => who[field])
            .filter(value => value)
            .shuffle()
            .value()[0];
        log('Filtering on ' + field + ' = ' + value);
        return Searcher.where(field, value);
    }

    searcherCount(remaining, searcher) {
        return remaining.filter(who => searcher.test(who)).length;
    }

}

PickAboutHalf.description = "Pick half the board at a time";
PickAboutHalf.author = "Dan Kuck";

module.exports = PickAboutHalf;
