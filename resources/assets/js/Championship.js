const Eventer = require('./Eventer.js');
const ChampionshipMatch = require('./ChampionshipMatch.js');
const StrategyIterator = require('./StrategyIterator.js');

class Championship
{

    /**
     * @param strategies    array; constructors for our competitors
     * @param whos          array; objects describing individuals in the game
     * @param roundCount    int; optional; number of rounds to complete
     */
    constructor(strategies, whos, roundCount)
    {
        this.strategies = strategies;
        this.whos = whos;
        this.roundCount = roundCount || 1;

        this.progressEvents = new Eventer();
        this.doneEvents = new Eventer();

        this.rounds = 0;
        this.results = [];
        this.errors = [];
        this.strategyIterator = new StrategyIterator(this.strategies);
    }

    run()
    {
        if (this.currentMatch) {
            this.currentMatch.run();
            return;
        }
        var competitors = this.nextCompetitors();
        if (!competitors) {
            this.finish();
            return;
        }
        this.currentMatch = new ChampionshipMatch(competitors[0], competitors[1], this.whos)
            .onProgress((progress) => {
                this.progressEvents.fire({
                    rounds: this.rounds,
                    results: this.results,
                    errors: this.errors,
                    currentMatch: progress,
                    progress: this.rounds / this.roundCount,
                });
            })
            .onDone((result) => {
                this.currentMatch = null;
                this.results.push(result);
                this.run();
            })
            .onError((err) => {
                // there was an error that couldn't be blamed on anyone in particular
                this.currentMatch = null;
                this.errors.push({
                    error: err,
                    competitors: competitors,
                });
                this.run();
            });
        this.currentMatch.run();
    }

    stop()
    {
        if (this.currentMatch) {
            this.currentMatch.stop();
        }
    }

    nextCompetitors()
    {
        var competitors = this.strategyIterator.next();
        while (!competitors) {
            this.rounds++;
            if (this.rounds >= this.roundCount) {
                return null; //done
            }
            this.strategyIterator = new StrategyIterator(this.strategies);
            competitors = this.strategyIterator.next();
        }
        return competitors;
    }

    onProgress(closure)
    {
        this.progressEvents.on(closure);
        return this;
    }

    onDone(closure)
    {
        this.doneEvents.on(closure);
        return this;
    }

    finish()
    {
        this.finished = true;
        this.doneEvents.fire({
            rounds: this.rounds,
            results: this.results,
        });
    }
}

module.exports = Championship;
