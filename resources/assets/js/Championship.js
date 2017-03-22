const Eventer = require('./Eventer.js');
const ChampionshipMatch = require('./ChampionshipMatch.js');

class Championship
{

    /**
     * @param strategies    array; competitors in {'name':string,'class':class} format
     * @param matchCount    int; number of matches each pair should complete
     */
    constructor(strategies, matchCount)
    {
        this.strategies = strategies;
        this.matchCount = matchCount;
        this.matches = 0;
        this.results = [];

        this.progressEvents = new Eventer();
        this.doneEvents = new Eventer();

        this.strategyIterator = new StrategyIterator(this.strategies);
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

    nextStep()
    {
        this.runner = setTimeout(() => {
            this.runStep().then(() => {
                if (!this.finished) {
                    this.nextStep();
                } else {
                    this.runner = null;
                }
            });
        }, 0);
    }

    runStep()
    {
        return new Promise((resolve, error) => {
            var competitors = this.nextCompetitors();
            if (!competitors) {
                this.finish();
                return;
            }
            this.currentMatch = new ChampionshipMatch(competitors[0], competitors[1])
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
                    resolve();
                })
                .run();
        });
    }

    nextCompetitors()
    {
        var competitors = this.strategyIterator.next();
        while (!competitors) {
            this.matches++;
            if (this.matches >= this.matchCount) {
                return; //done
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
