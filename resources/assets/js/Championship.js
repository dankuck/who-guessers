
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

        this.progressWatchers = [];
        this.doneWatchers = [];

        this.strategyIterator = new StrategyIterator(this.strategies);
        this.runNext();
    }

    runNext()
    {
        var competitors = this.nextCompetitors();
        if (!competitors) {
            this.fireDone();
            return;
        }
        var round = new Round(competitors[0], competitors[1]);
        round.run();
        //this.results.push, somehow push results
        this.fireProgress();
        setTimeout(() => this.runNext(), 1);
    }

    stop() 
    {
        clearInterval(this.running);
    }

    nextCompetitors()
    {
        var competitors = this.strategyIterator.next();
        while (!competitors) {
            this.matches++;
            if (this.matches >= this.matchCount) {
                return //done
            }
            competitors = this.strategyIterator.next();
        }
        return competitors;
    }

    onProgress(closure)
    {
        this.progressWatchers.push(closure);
    }

    fireProgress(progress)
    {
        this.progressWatchers.each((watcher) => watcher(progress));
    }

    onDone(closure)
    {
        this.doneWatchers.push(closure);
    }

    fireDone()
    {
        this.doneWatchers.each((watcher) => watcher());
    }
}

module.exports = Championship;
