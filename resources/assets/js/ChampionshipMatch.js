const _ = require('lodash');
const Eventer = require('./Eventer.js');
const Board = require('./Board.js');

class ChampionshipMatch
{

    constructor(playerA, playerB, whos)
    {
        var deck = _.shuffle(_.cloneDeep(whos));
        this.a = {
            board: new Board(_.shuffle(_.cloneDeep(whos))),
            player: playerA,
            who: deck.pop(),
        };
        this.b = {
            board: new Board(_.shuffle(_.cloneDeep(whos))),
            player: playerB,
            who: deck.pop(),
        };
        this.current = this.a;
        this.doneEvents = new Eventer();
        this.progressEvents = new Eventer();
        this.finished = false;
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
        var strategy = this.buildStrategy(this.current.player);
        var move = strategy.move(_.cloneDeep(this.current.board), this.otherInfo());
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
        this.current = this.other();
    }

    handleMove()
    {
        if (typeof move === 'string') {
            this.finish(move);
            return;
        }
        if (move.test(other.who)) {
            board.rejectMisses(move);
        } else {
            board.rejectMatches(move);
        }
        this.progressEvents.fire(this.stateSummary());
    }

    onDone(closure)
    {
        this.doneEvents.on(closure);
    }

    onProgress(closure)
    {
        this.progressEvents.on(closure);
    }

    other()
    {
        if (this.current === this.a) {
            return this.b;
        } else {
            return this.a;
        }
    }

    otherInfo()
    {
        var other = this.other();
        return {
            name: other.name,
            remaining: other.board.remaining.length,
            rejected: other.board.rejected.length,
        };
    }
}

module.exports = ChampionshipMatch;
