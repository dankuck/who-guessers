const _ = require('lodash');
const Eventer = require('./Eventer.js');
const Board = require('./Board.js');

class ChampionshipMatch
{

    constructor(playerA, playerB, whos)
    {
        this.deckSize = whos.length;
        var deck = _.shuffle(_.cloneDeep(whos));
        this.a = {
            board: new Board(_.shuffle(_.cloneDeep(whos))),
            player: playerA,
            who: deck.pop(),
            log: [],
        };
        this.b = {
            board: new Board(_.shuffle(_.cloneDeep(whos))),
            player: playerB,
            who: deck.pop(),
            log: [],
        };
        this.current = this.a;
        this.other = this.b;
        this.doneEvents = new Eventer();
        this.progressEvents = new Eventer();
        this.finished = false;
        this.turns = 0;
    }

    run()
    {
        if (this.runner || this.finished) {
            return; // already running
        }
        this.nextStep();
    }

    stop()
    {
        if (this.runner) {
            clearTimeout(this.runner);
            this.runner = null;
        }
    }

    runStep()
    {
        this.turns++;
        var strategy = this.buildStrategy(this.current.player);
        var move = strategy.move(_.cloneDeep(this.currentInfo()), _.cloneDeep(this.otherInfo()), (text) => this.current.log.push(text));
        this.handleMove(move);
        this.switch();
    }

    nextStep()
    {
        this.runner = setTimeout(() => {
            this.runStep();
            if (!this.finished) {
                this.nextStep();
            } else {
                this.runner = null;
            }
        }, 0);
    }

    buildStrategy(player)
    {
        return new player.class();
    }

    switch()
    {
        if (this.current == this.a) {
            this.current = this.b;
            this.other = this.a;
        } else {
            this.current = this.a;
            this.other = this.b;
        }
    }

    handleMove(move)
    {
        if (typeof move === 'string') {
            this.finish(move);
            return;
        }
        if (move.test(this.other.who)) {
            this.current.board.rejectMisses(move);
        } else {
            this.current.board.rejectMatches(move);
        }
        this.progressEvents.fire(this.getReport());
    }

    getReport()
    {
        var percentage = (this.a.board.rejected.length + this.b.board.rejected.length) / (this.deckSize * 2);
        var winning;
        if (this.a.board.rejected.length > this.b.board.rejected.length) {
            winning = 0;
        } else if (this.b.board.rejected.length > this.a.board.rejected.length) {
            winning = 1;
        } else {
            // If it's my turn and we're tied, then the other guy has a 
            // chance of winning sooner because his turn is next.
            winning = (this.current == this.a ? 1 : 0);
        }
        return {
            progress: percentage,
            turns: this.turns,
            winning: winning,
            players: [this.a.player, this.b.player],
            logs: [this.a.log, this.b.log],
        };
    }

    finish(answer)
    {
        this.finished = true;
        var winner;
        if (answer == this.other.who) {
            winner = this.current;
        } else {
            winner = this.other;
        }
        var result = {
            turns: this.turns,
            winner: (winner === this.a ? 0 : 1),
            players: [this.a.player, this.b.player],
            logs: [this.a.log, this.b.log],
        };
        this.doneEvents.fire(result);
    }

    onDone(closure)
    {
        this.doneEvents.on(closure);
        return this;
    }

    onProgress(closure)
    {
        this.progressEvents.on(closure);
        return this;
    }

    /**
     * Gives a full view of the current player's info
     */
    currentInfo()
    {
        return {
            board: this.current.board,
            who: this.current.who,
            player: this.current.player,
        };
    }

    /**
     * Gives a "blank" view of the other player's info, shaped the same:
     * The player id is fully accessible;
     * The board rejects and remaining are countable but undefined;
     * The who is undefined
     */
    otherInfo()
    {
        return {
            player: this.other.player,
            board: {
                remaining: new Array(this.other.board.remaining.length),
                rejected: new Array(this.other.board.rejected.length),
            },
        };
    }
}

module.exports = ChampionshipMatch;
