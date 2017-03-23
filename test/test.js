const assert = require('assert');
const Searcher = require('../resources/assets/js/Searcher.js');
const Board = require('../resources/assets/js/Board.js');
const Eventer = require('../resources/assets/js/Eventer.js');
const Championship = require('../resources/assets/js/Championship.js');
const ChampionshipMatch = require('../resources/assets/js/ChampionshipMatch.js');
const StrategyIterator = require('../resources/assets/js/StrategyIterator.js');
const InfiniteJest = require('./support/InfiniteJest.js');
const Loser = require('./support/Loser.js');
const Whos = require('../resources/assets/js/Whos.js');

describe('Searcher.And', function() {
    describe('#constructor', function() {
        it('should not error', function() {
            new Searcher.And([]);
            // no exception
        });
    });
    describe('#test', function() {
        it('should succeed on one', function() {
            var and = new Searcher.And([/test/]);
            assert.equal(true, and.test("test"));
        });
        it('should test false on one', function() {
            var and = new Searcher.And([/test/]);
            assert.equal(false, and.test("nope"));
        });
        it('should succeed on two', function() {
            var and = new Searcher.And([/test/, /ster/]);
            assert.equal(true, and.test("tester"));
        });
        it('should test false on first of two', function() {
            var and = new Searcher.And([/test/, /ster/]);
            assert.equal(false, and.test("napster"));
        });
        it('should test false on second of two', function() {
            var and = new Searcher.And([/test/, /ster/]);
            assert.equal(false, and.test("nu-test"));
        });
        it('should test false on two', function() {
            var and = new Searcher.And([/test/, /ster/]);
            assert.equal(false, and.test("nope"));
        });
    });
});

describe('Searcher.Or', function() {
    describe('#constructor', function() {
        it('should not error', function() {
            new Searcher.Or([]);
            // no exception
        });
    });
    describe('#test', function() {
        it('should succeed on one', function() {
            var or = new Searcher.Or([/test/]);
            assert.equal(true, or.test("test"));
        });
        it('should test false on one', function() {
            var or = new Searcher.Or([/test/]);
            assert.equal(false, or.test("nope"));
        });
        it('should succeed on two', function() {
            var or = new Searcher.Or([/test/, /ster/]);
            assert.equal(true, or.test("tester"));
        });
        it('should test true on first of two', function() {
            var or = new Searcher.Or([/test/, /ster/]);
            assert.equal(true, or.test("napster"));
        });
        it('should test true on second of two', function() {
            var or = new Searcher.Or([/test/, /ster/]);
            assert.equal(true, or.test("nu-test"));
        });
        it('should test false on two', function() {
            var or = new Searcher.Or([/test/, /ster/]);
            assert.equal(false, or.test("nope"));
        });
    });
});

describe('Searcher', function() {
    describe('#where', function() {
        it('should return itself', function() {
            var searcher = new Searcher();
            assert.equal(searcher, searcher.where('x', 1));
        });
    });

    describe('#where (static)', function() {
        it('should return itself', function() {
            assert.equal(true, Searcher.where('x', 1) instanceof Searcher);
        });
    });

    describe('#test()', function() {
        it('should succeed on one', function() {
            var searcher = Searcher.where('x', 1);
            assert.equal(true, searcher.test({x: 1}));
        });
        it('should test false on one', function() {
            var searcher = Searcher.where('x', 1);
            assert.equal(false, searcher.test({x: 2}));
        });
        it('should succeed on two', function() {
            var searcher = Searcher.where('x', 1).where('y', 'ABC');
            assert.equal(true, searcher.test({x: 1, y: 'ABC'}));
        });
        it('should test false on first of two', function() {
            var searcher = Searcher.where('x', 1).where('y', 'ABC');
            assert.equal(false, searcher.test({x: 2, y: 'ABC'}));
        });
        it('should test false on second of two', function() {
            var searcher = Searcher.where('x', 1).where('y', 'ABC');
            assert.equal(false, searcher.test({x: 1, y: 'XYZ'}));
        });
        it('should test false on two', function() {
            var searcher = Searcher.where('x', 1).where('y', 'ABC');
            assert.equal(false, searcher.test({x: 2, y: 'XYZ'}));
        });
    });

    describe('#push', function() {
        it('should return this', function() {
            var searcher = new Searcher();
            assert.equal(searcher, searcher.push(/test/));
        });
    });

    describe('#push (static)', function() {
        it('should return this', function() {
            assert.equal(true, Searcher.push(/test/) instanceof Searcher);
        });
    });

    describe('#push && test', function() {
        it('should run test on the object once', function() {
            var tested = 0;
            Searcher.push({test(){ tested++ }}).test({});
            assert.equal(1, tested);
        });
    });
});

describe('Board', function() {
    describe('#constructor', function() {
        it('should instantiate', function() {
            new Board();
        });
        it('should start with all remaining', function() {
            var b = new Board(['x', 'y', 'z']);
            assert.equal(b.remaining.length, 3);
            assert.equal(b.rejected.length, 0);
        });
    });
    describe('rejectMatches', function() {
        it('should reject 0', function() {
            var b = new Board(['x', 'y', 'z']);
            b.rejectMatches(/a/);
            assert.equal(b.remaining.length, 3);
            assert.equal(b.rejected.length, 0);
        });
        it('should reject 1', function() {
            var b = new Board(['x', 'y', 'z']);
            b.rejectMatches(/z/);
            assert.equal(b.remaining.length, 2);
            assert.equal(b.rejected.length, 1);
        });
        it('should reject 2', function() {
            var b = new Board(['x', 'y', 'z']);
            b.rejectMatches(/[yz]/);
            assert.equal(b.remaining.length, 1);
            assert.equal(b.rejected.length, 2);
        });
        it('should reject all 3', function() {
            var b = new Board(['x', 'y', 'z']);
            b.rejectMatches(/./);
            assert.equal(b.remaining.length, 0);
            assert.equal(b.rejected.length, 3);
        });
    });
    describe('rejectMisses', function() {
        it('should reject all', function() {
            var b = new Board(['x', 'y', 'z']);
            b.rejectMisses(/a/);
            assert.equal(b.remaining.length, 0);
            assert.equal(b.rejected.length, 3);
        });
        it('should reject 2', function() {
            var b = new Board(['x', 'y', 'z']);
            b.rejectMisses(/z/);
            assert.equal(b.remaining.length, 1);
            assert.equal(b.rejected.length, 2);
        });
        it('should reject 1', function() {
            var b = new Board(['x', 'y', 'z']);
            b.rejectMisses(/[yz]/);
            assert.equal(b.remaining.length, 2);
            assert.equal(b.rejected.length, 1);
        });
        it('should reject 0', function() {
            var b = new Board(['x', 'y', 'z']);
            b.rejectMisses(/./);
            assert.equal(b.remaining.length, 3);
            assert.equal(b.rejected.length, 0);
        });
    });
});

describe('Eventer', function() {
    describe('#construct', function() {
        it('should instantiate', function() {
            new Eventer();
        });
    });
    describe('#on', function() {
        it('should accept a closure', function() {
            new Eventer().on(function(){});
        });
        it('should return self', function() {
            var ev = new Eventer();
            assert.equal(ev.on(function(){}), ev);
        });
    });
    describe('#fire', function() {
        it('should do nothing', function() {
            new Eventer().fire();
        });
        it('should fire one closure once', function() {
            var ran = 0;
            var ev = new Eventer().on(function(){ ran++ });
            ev.fire();
            assert.equal(ran, 1);
        });
        it('should fire one closure twice', function() {
            var ran = 0;
            var ev = new Eventer().on(function(){ ran++ });
            ev.fire();
            ev.fire();
            assert.equal(ran, 2);
        });
        it('should fire two closures once each', function() {
            var ran = 0;
            var ev = new Eventer();
            ev.on(function(){ ran++ });
            ev.on(function(){ ran++ });
            ev.fire();
            assert.equal(ran, 2);
        });
        it('should pass args', function() {
            var ran = '';
            var ev = new Eventer().on(function(a, b){ ran = a + " " + b });
            ev.fire('hello', 'world');
            assert.equal(ran, 'hello world');
        });
    });
});

describe('ChampionshipMatch', function() {
    describe('#instantiate', function() {
        it('should instantiate', function() {
            var m = new ChampionshipMatch({}, {}, []);
            assert.equal(m.finished, false);
        });
    });
    describe('#run & stop', function() {
        it('should runStep a few times and then stop', function(done) {
            var m = new ChampionshipMatch({}, {}, []);
            var ran = 0;
            m.runStep = function() { ran++ };
            m.run();
            setTimeout(function() {
                m.stop();
                assert(ran > 0);
                assert.equal(m.runner, null);
                done();
            }, 10);
        });
        it('should runStep a few times, pause, runStep a few more times, then stop', function(done) {
            var m = new ChampionshipMatch({}, {}, []);
            var ran = 0;
            var firstRun = 0;
            m.runStep = function() { ran++ };
            m.run();
            setTimeout(function() {
                m.stop();
                assert(ran > 0);
                firstRun = ran;
                assert.equal(m.runner, null);
                m.run();
            }, 10);
            setTimeout(function() {
                m.stop();
                assert(ran > firstRun);
                assert.equal(m.runner, null);
                done();
            }, 20);
        });
    });
    describe('#runStep', function() {
        it('should get a move and handle it', function() {
            var caughtMove;
            var m = new ChampionshipMatch({}, {}, []);
            m.otherInfo = function(){};
            m.buildStrategy = function() {
                return {
                    move() {
                        return 'XXXX';
                    }
                };
            };
            m.handleMove = function(move) {
                caughtMove = move;
            };
            m.runStep();
            assert.equal(caughtMove, 'XXXX');
        });
    });
    describe('#buildStrategy', function() {
        it('should new up a class', function() {
            class X{}
            var m = new ChampionshipMatch({}, {}, []);
            var x = m.buildStrategy({class: X});
            assert(x instanceof X);
        });
    });
    describe('#switch', function() {
        it('should switch out the current player with the other one', function() {
            var a = {};
            var b = {};
            var m = new ChampionshipMatch(a, b, []);
            assert.equal(m.current.player, a);
            m.switch();
            assert.equal(m.current.player, b);
            m.switch();
            assert.equal(m.current.player, a);
        });
    });
    describe('#handleMove', function() {
        it('should call finish()', function() {
            var m = new ChampionshipMatch({}, {}, []);
            var finished = false;
            m.finish = function() { finished = true };
            m.handleMove("string");
            assert(finished);
        });
        it('should reject misses', function() {
            var m = new ChampionshipMatch({}, {}, []);
            var ran = 0;
            m.a.board.rejectMisses = function() { ran++ };
            m.handleMove({
                test() {
                    return true;
                }
            });
            assert(ran, 1);
        });
        it('should reject matches', function() {
            var m = new ChampionshipMatch({}, {}, []);
            var ran = 0;
            m.a.board.rejectMatches = function() { ran++ };
            m.handleMove({
                test() {
                    return false;
                }
            });
            assert(ran, 1);
        });
    });
    describe('#finish', function() {
        it('should finish with player A the winner', function() {
            var m = new ChampionshipMatch({}, {}, []);
            m.b.who = 'ABC';
            var result;
            m.onDone(function(doneData) {
                result = doneData;
            });
            m.finish('ABC');
            assert(m.finished);
            assert.equal(result.turns, 0);
            assert.equal(result.winner, 0);
            assert(result.players instanceof Array);
        });
        it('should finish with player B the winner', function() {
            var m = new ChampionshipMatch({}, {}, []);
            m.b.who = 'XYZ';
            var result;
            m.onDone(function(doneData) {
                result = doneData;
            });
            m.finish('ABC');
            assert(m.finished);
            assert.equal(result.turns, 0);
            assert.equal(result.winner, 1);
            assert(result.players instanceof Array);
        });
    });
    describe('#otherInfo', function() {
        it('should give the info of player b', function() {
            var b = {};
            var m = new ChampionshipMatch({}, b, ['x', 'y', 'z']);
            m.b.board.remaining = ['x', 'y'];
            m.b.board.rejected = ['z'];
            var info = m.otherInfo();
            assert(info instanceof Object);
            assert.equal(info.player, b);
            assert.equal(info.board.remaining.length, 2);
            assert.equal(info.board.rejected.length, 1);
        });
    });
    describe('#currentInfo', function() {
        it('shold give the info of player a', function() {
            var a = {};
            var m =  new ChampionshipMatch(a, {}, ['x', 'y', 'z']);
            m.a.board.remaining = ['x', 'y'];
            m.a.board.rejected = ['z'];
            m.a.who = 'z';
            var info = m.currentInfo();
            assert(info instanceof Object);
            assert.equal(info.player, a);
            assert.equal(info.board.remaining.length, 2);
            assert.equal(info.board.rejected.length, 1);
            assert.equal(info.who, 'z');
        });
    });
    describe('#getReport', function() {
        it('should say that a is winning', function() {
            var m = new ChampionshipMatch({}, {}, ['x', 'y', 'z']);
            m.a.board.rejected = ['x'];
            m.a.board.remaining = ['y', 'z'];
            var report = m.getReport();
            assert(report instanceof Object);
            assert.equal(report.winning, 0);
            assert.equal(report.progress, 1/6);
            assert(report.players instanceof Array);
        });
        it('should say that b is winning', function() {
            var m = new ChampionshipMatch({}, {}, ['x', 'y', 'z']);
            m.b.board.rejected = ['x'];
            m.b.board.remaining = ['y', 'z'];
            var report = m.getReport();
            assert(report instanceof Object);
            assert.equal(report.winning, 1);
            assert.equal(report.progress, 1/6);
            assert(report.players instanceof Array);
        });
        it('should say that b is winning because of tie and b has next turn', function() {
            var m = new ChampionshipMatch({}, {}, ['x', 'y', 'z']);
            var report = m.getReport();
            assert(report instanceof Object);
            assert.equal(report.winning, 1);
            assert.equal(report.progress, 0);
            assert(report.players instanceof Array);
        });
    });
});

describe('StrategyIterator', function() {
    describe('#instantiate', function() {
        it('builds', function() {
            new StrategyIterator(['a', 'b']);
        });
    });
    describe('#next', function() {
        it('should give a,a; a,b; b,a; b,b; <null>', function() {
            var it = new StrategyIterator(['a', 'b']);
            var x, y;

            [x, y] = it.next();
            assert.equal('a', x);
            assert.equal('a', y);
            
            [x, y] = it.next();
            assert.equal('a', x);
            assert.equal('b', y);
            
            [x, y] = it.next();
            assert.equal('b', x);
            assert.equal('a', y);
            
            [x, y] = it.next();
            assert.equal('b', x);
            assert.equal('b', y);

            assert(it.next() === null);
        });
    });
});

describe('Championship', function() {
    describe('#instantiate', function() {
        it('should instantiate', function() {
            new Championship([]);
        });
    });
    describe('#finish', function() {
        it('should set finished and fire event', function() {
            var c = new Championship([]);
            var ran = 0;
            c.onDone(function(){ ran++ });
            c.finish();
            assert(c.finished);
            assert.equal(ran, 1);
        });
    });
    describe('#nextCompetitors', function() {
        it('should get one pair of competitors', function() {
            var c = new Championship(['a']);
            var competitors = c.nextCompetitors();
            assert.equal(competitors[0], 'a');
            assert.equal(competitors[1], 'a');
        });
        it('should get one pair of competitors, then none', function() {
            var c = new Championship(['a']);
            var competitors = c.nextCompetitors();
            assert.equal(competitors[0], 'a');
            assert.equal(competitors[1], 'a');
            competitors = c.nextCompetitors();
            assert(competitors === null);
        });
        it('should get one pair of competitors twice, then none', function() {
            var c = new Championship(['a'], [], 2);
            var competitors = c.nextCompetitors();
            assert.equal(competitors[0], 'a');
            assert.equal(competitors[1], 'a');
            competitors = c.nextCompetitors();
            assert.equal(competitors[0], 'a');
            assert.equal(competitors[1], 'a');
            competitors = c.nextCompetitors();
            assert(competitors === null);
        });
    });
    describe('run and stop, with InfiniteJest', function() {
        it('should run for a while, then stop', function(done) {
            var c = new Championship(
                [{name:'InfiniteJest',class:InfiniteJest}], 
                Whos
            );
            c.run();
            setTimeout(() => {
                c.stop();
                done();
            }, 10);
        });
        it('should run for a while, receive progress, then stop', function(done) {
            var c = new Championship(
                [{name:'InfiniteJest',class:InfiniteJest}], 
                Whos
            );
            var progresses = [];
            c.onProgress(function(progress){ progresses.push(progress) });
            c.run();
            setTimeout(() => {
                c.stop();
                assert(progresses.length > 0);
                done();
            }, 10);
        });
    });
    describe('run and stop, with Loser', function() {
        it('should run a quick match, then finish', function(done) {
            var c = new Championship(
                [{name:'Loser',class:Loser}], 
                Whos
            );
            c.onDone(function(report){
                assert(report instanceof Object);
                assert.equal(report.matches, 1);
                assert(report.results instanceof Array);
                assert(report.results[0] instanceof Object);
                assert.equal(report.results[0].turns, 1);
                assert.equal(report.results[0].winner, 1);
                assert.equal(report.results[0].reason, ChampionshipMatch.REASON_INCORRECT_ANSWER);
                done();
            });
            c.run();
        });
        it('should run 100 matches, then finish', function(done) {
            var c = new Championship(
                [{name:'Loser',class:Loser}], 
                Whos,
                100
            );
            c.onDone(function(report){
                assert(report instanceof Object);
                assert.equal(report.matches, 100);
                assert(report.results instanceof Array);
                assert.equal(report.results.length, 100);
                report.results.map(function(result) {
                    assert(result instanceof Object);
                    assert.equal(result.turns, 1);
                    assert.equal(result.winner, 1);
                    assert.equal(result.reason, ChampionshipMatch.REASON_INCORRECT_ANSWER);
                });
                done();
            });
            c.run();
        });
    });
});










