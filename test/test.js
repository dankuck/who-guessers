var assert = require('assert');
var Searcher = require('../resources/assets/js/Searcher.js');

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

    describe('#matches', function() {
        it('should return all input', function() {
            assert.equal(2, Searcher.push(/test/).matches(['tested', 'retest']).length);
        });
        it('should return first input of two', function() {
            assert.equal(1, Searcher.push(/test/).matches(['tested', 'nope']).length);
        });
        it('should return second input of two', function() {
            assert.equal(1, Searcher.push(/test/).matches(['nope', 'retest']).length);
        });
        it('should return no input', function() {
            assert.equal(0, Searcher.push(/test/).matches(['nope', 'scope']).length);
        });
    });

    describe('#misses', function() {
        it('should return no input', function() {
            assert.equal(0, Searcher.push(/test/).misses(['tested', 'retest']).length);
        });
        it('should return last input of three', function() {
            assert.equal(1, Searcher.push(/test/).misses(['tested', 'retest', 'nope']).length);
        });
        it('should return first input of three', function() {
            assert.equal(1, Searcher.push(/test/).misses(['nope', 'tested', 'retest']).length);
        });
        it('should return all input', function() {
            assert.equal(2, Searcher.push(/test/).misses(['nope', 'scope']).length);
        });
    });
});













