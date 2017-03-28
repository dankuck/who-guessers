const _ = require('lodash');
const Searcher = require('../Searcher.js');

class PickAnyTrait
{

    move(me, other, log){
        if (me.board.remaining.length == 1) {
          log('Answering: ' + me.board.remaining[0].name);
          return me.board.remaining[0].name;
        }
        log('Remaining: ' + me.board.remaining.length);
        var field = _(me.board.remaining).map((who) => Object.keys(who)).flatten().unique().shuffle().value()[0];
        var value = _(me.board.remaining).map((who) => who[field]).filter(value => value).shuffle().value()[0];
        log('Filtering on ' + field + ' = ' + value);
        return Searcher.where(field, value);
    }

}
module.exports = PickAnyTrait;
