import Whos from './Whos.js';

class Match
{

    constructor(playerA, playerB)
    {
        var deck = _(Whos).cloneDeep().shuffle().value();
        this.a = {
            board: new Board(_(Whos).cloneDeep().shuffle().value()),
            player: playerA,
            who: deck.pop(),
        };
        this.b = {
            board: new Board(_(Whos).cloneDeep().shuffle().value()),
            player: playerB,
            who: deck.pop(),
        };
        this.current = this.a;
    }

    run()
    {
        while (true) {
            var board = this.current.board;
            var player = this.current.player;
            var other = this.notCurrent();
            var otherInfo = {
                name: other.name,
                board: other.board,
            };
            var strategy = new player.class();
            strategy.run(board, otherInfo);
        }
    }

    switch() 
    {
        this.current = this.notCurrent();
    }

    notCurrent()
    {
        if (this.current === this.a) {
            return this.b;
        } else {
            return this.a;
        }
    }

}

module.exports = Match;
