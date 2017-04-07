const _ = require('lodash');
const Searcher = require('../Searcher.js');

class Half
{
  move(me, other, log)
  {
    if (me.board.remaining.length == 1) {
        return me.board.remaining[0].name;
    }
    
    var limit = me.board.remaining.length / 2;
   
    var or = [];

    for (var i = 0; i < limit; i++) {
      or.push(Searcher.where('name',me.board.remaining[i].name));
    }
 
    return Searcher.or(or);
  }
}

Half.description = 'Divide the field in half for real';
Half.author = 'Zack Spencer';

module.exports = Half;
