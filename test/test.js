var assert = require('assert');
var Searcher = require('../resources/assets/js/Searcher.js');
var Board = require('../resources/assets/js/Board.js');
var Eventer = require('../resources/assets/js/Eventer.js');

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










