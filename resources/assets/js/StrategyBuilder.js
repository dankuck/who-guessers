const libs = {
    '../Searcher.js': require('./Searcher.js'),
    'lodash': require('lodash'),
    '../Board.js': require('./Board.js'),
    '../Eventer.js': require('./Eventer.js'),
    '../Championship.js': require('./Championship.js'),
    '../ChampionshipMatch.js': require('./ChampionshipMatch.js'),
    '../StrategyIterator.js': require('./StrategyIterator.js'),
    '../ClassicWhos.js': require('./ClassicWhos.js'),
};

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
        var require = function (path) {
            if (libs[path]) {
                return libs[path];
            } else {
                throw new Error("Path to lib not found: " + path);
            }
        };
        eval(this.code);
        return module.exports;
    }
}

module.exports = StrategyBuilder;
