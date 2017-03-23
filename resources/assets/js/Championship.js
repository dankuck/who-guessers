const Eventer = require('./Eventer.js');
const ChampionshipMatch = require('./ChampionshipMatch.js');
const StrategyIterator = require('./StrategyIterator.js');

class Championship
{

    /**
     * @param strategies    array; competitors in {'name':string,'class':class} format
     * @param whos          array; objects describing individuals in the game
     * @param matchCount    int; number of matches each pair should complete
     */
    constructor(strategies, whos, matchCount)
    {
        this.strategies = strategies;
        this.whos = whos;
        this.matchCount = matchCount || 1;

        this.progressEvents = new Eventer();
        this.doneEvents = new Eventer();

        this.matches = 0;
        this.results = [];
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
                    matches: this.matches,
                    results: this.results,
                    currentMatch: progress,
                    progress: this.matches / this.matchCount,
                });
            })
            .onDone((result) => {
                this.currentMatch = null;
                this.results.push(result);
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
            this.matches++;
            if (this.matches >= this.matchCount) {
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
            matches: this.matches,
            results: this.results,
        });
    }
}

module.exports = Championship;
