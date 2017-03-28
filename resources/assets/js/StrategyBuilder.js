const Searcher = require('./Searcher.js');
const _ = require('lodash');

class StrategyBuilder
{
    constructor(code)
    {
        this.code = code;
    }

    get()
    {
        var module = {};
        var exports = {};
        module.exports = exports;
        eval(this.code);
        return module.exports;
    }
}

module.exports = StrategyBuilder;
