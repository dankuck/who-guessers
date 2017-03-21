
class StrategyIterator
{
    /**
     * @param strategies    array; competitors in {'name':string,'class':class} format
     */
    constructor(strategies)
    {
        this.strategies = strategies;
        this.aIndex = 0;
        this.bIndex = 0;
    }

    next()
    {
        this.bIndex++;
        if (this.bIndex >= this.strategies.length) {
            this.aIndex++;
            this.bIndex = 0;
        }
        if (this.aIndex >= this.strategies.length) {
            this.aIndex = this.bIndex = this.strategies.length;
            return null;
        }
        return [this.strategies[this.aIndex], this.strategies[this.bIndex]];
    }
}

module.exports = StrategyIterator;
