
const _ = require('lodash');
const Searcher = require('../Searcher.js');

class PickMostCommonTrait
{
  move(me, other, log)
  {
    if (me.board.remaining.length === 1) {
      log('Answering: ' + me.board.remaining[0].name);
      return me.board.remaining[0].name;
    } else {
      log('Remaining: ' + me.board.remaining.length + ' vs. ' + other.board.remaining.length);
      // get a list of the fields that the remaining whos have
      var fields =  _(me.board.remaining)
        .map(who => Object.keys(who))
        .flatten()
        .unique()
        .value();
      log('Considering these fields: ' + fields.join(', '));
      // build a field=value for every value of those fields
      var searchers = _(fields)
        .map(field => {
          return _(me.board.remaining)
            .map(who => who[field])
            .filter(value => value)
            .unique()
            .map(value => Searcher.where(field, value))
            .value();
        })
        .flatten()
        .value();
      log('field/value pairs: ' + searchers.length);
      // see what count of whos each searcher matches
      // and pick the one that's highest 
      // (but which doesn't match *all* of the whos)
      var biggest = null;
      var size = 0;
      searchers.map(searcher => {
        var s = me.board.remaining.filter(who => searcher.test(who)).length;
        if (s > size && s < me.board.remaining.length) {
          biggest = searcher;
          size = s;
        }
      });
      log('Found a good searcher. Splits board into ' + size + ' or ' + (me.board.remaining.length - size) + ' whos');
      return biggest;
    }
  }
}

PickMostCommonTrait.description = 'Choose trait that matches most whos';

module.exports = PickMostCommonTrait;
