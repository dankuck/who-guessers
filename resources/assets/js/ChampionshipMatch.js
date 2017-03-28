const _ = require('lodash');
const Eventer = require('./Eventer.js');
const Board = require('./Board.js');

class ChampionshipMatch
{

    constructor(playerA, playerB, whos, maxTurns)
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
        this.errorEvents = new Eventer();
        this.progressEvents = new Eventer();
        this.finished = false;
        this.turns = 0;
        this.maxTurns = maxTurns || 100;
    }

    run()
    {
        if (this.runner || this.finished) {
            return; // already running
        }
        this.nextStep();
        this.progressEvents.fire(this.getReport());
        return this;
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
        if (this.turns > this.maxTurns) {
            this.errorOut('Strategies took more than ' + this.maxTurns + ' turns.');
            return;
        }
        this.turns++;
        var log = (text) => this.current.log.push(text);
        try {
            var strategy = this.buildStrategy(this.current.player);
            var move = strategy.move(_.cloneDeep(this.currentInfo()), _.cloneDeep(this.otherInfo()), log);
            this.handleMove(move);
            this.switch();
        } catch (e) {
            log(e.stack);
            this.finalizeFinish(this.other, ChampionshipMatch.REASON_EXCEPTION_DEFAULT);
        }
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
        return new player();
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
        if (move) {
            if (move.test(this.other.who)) {
                this.current.board.rejectMisses(move);
            } else {
                this.current.board.rejectMatches(move);
            }
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
        if (answer == this.other.who.name) {
            this.finalizeFinish(this.current, ChampionshipMatch.REASON_CORRECT_ANSWER);
        } else {
            this.finalizeFinish(this.other, ChampionshipMatch.REASON_INCORRECT_ANSWER);
        }
    }

    finalizeFinish(winner, reason)
    {
        this.finished = true;
        this.a.log.push('ANSWER: ' + this.b.who.name);
        this.b.log.push('ANSWER: ' + this.a.who.name);
        var result = {
            turns: this.turns,
            winner: (winner === this.a ? 0 : 1),
            players: [this.a.player, this.b.player],
            logs: [this.a.log, this.b.log],
            reason: reason,
        };
        this.doneEvents.fire(result);
    }

    errorOut(err)
    {
        this.finished = true;
        this.errorEvents.fire(new Error(err));
    }

    onDone(closure)
    {
        this.doneEvents.on(closure);
        return this;
    }

    onError(closure)
    {
        this.errorEvents.on(closure);
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
     * Gives a "blank" view of the other player's info, shaped the same as 
     * currentInfo:
     * The player constructor is fully accessible;
     * The `board.rejects` and `board.remaining` are countable but undefined;
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

ChampionshipMatch.REASON_CORRECT_ANSWER = 'Winner answered correctly.';
ChampionshipMatch.REASON_INCORRECT_ANSWER = 'Loser answered incorrectly.';
ChampionshipMatch.REASON_EXCEPTION_DEFAULT = 'Loser threw an exception.';

module.exports = ChampionshipMatch;
