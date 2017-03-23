
/**
 * Randomly chooses a name from the board, other than our own `who`.
 */
class SayAnything
{
    move(me, other, log)
    {
        var names = me.board.remaining.map(function(who) {
            return who.name;
        });
        names = names.filter(function(name) {
            return name != me.who.name;
        });
        var index = parseInt(Math.random() * names.length);
        log('Choosing randomly: ' + names[index]);
        return names[index];
    }

}

module.exports = SayAnything;
