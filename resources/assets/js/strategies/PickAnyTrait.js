const _ = require('lodash');
const Searcher = require('../Searcher.js');

/**
 * Chooses a field randomly from all the remaining characters,
 * then chooses a value randomly and returns a Searcher for
 * that field and value.
 *
 * But if there's only one character left, it just returns 
 * their name.
 *
 * This strategy never guesses wrong, but it might lose if it
 * takes too long.
 */
class PickAnyTrait
{

    move(me, other, log) {
        log('Remaining: ' + me.board.remaining.length);
        if (me.board.remaining.length == 1) {
          log('Answering: ' + me.board.remaining[0].name);
          return me.board.remaining[0].name;
        } else {
          return this.pickAnyTrait(me, other, log);
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

}

PickAnyTrait.description = "Search character traits at random";
PickAnyTrait.author = "Dan Kuck";

module.exports = PickAnyTrait;
