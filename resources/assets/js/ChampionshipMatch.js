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
        this.progressEvents.fire(this.getStateSummary());
    }

    getStateSummary()
    {
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
            players: [this.a, this.b],
        };
        this.doneEvents.fire(result);
    }

    onDone(closure)
    {
        this.doneEvents.on(closure);
    }

    onProgress(closure)
    {
        this.progressEvents.on(closure);
    }

    otherInfo()
    {
        return {
            name: this.other.player.name,
            remaining: this.other.board.remaining.length,
            rejected: this.other.board.rejected.length,
        };
    }
}

module.exports = ChampionshipMatch;
