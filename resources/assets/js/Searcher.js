
class Conjunction
{
    constructor(start)
    {
        this.compares = start || [];
    }
    
    where(...args)
    {
        if (args.length === 3) {
            var field = args[0];
            var comparison = args[1];
            var value = args[2];
        } else if (args.length === 2) {
            var field = args[0];
            var comparison = '=';
            var value = args[1];
            if (value instanceof RegExp) {
                comparison = 'REGEX';
            }
        } else if (args.length === 1) {
            var field = args[0];
            var comparison = '=';
            var value = true;
        }
        return this.push(new Compare(field, comparison, value));
    }

    push(compare)
    {
        this.compares.push(compare);
        return this;
    }
}

class And extends Conjunction
{
    test(object)
    {
        // find the first non-matching value
        // if none are non-matching, then all match
        return !this.compares.find((compare) => !compare.test(object));
    }
}

class Or extends Conjunction
{
    test(object)
    {
        // find the first matching value
        return !!this.compares.find((compare) => compare.test(object));
    }
}

class Compare
{
    constructor(field, comparison, value)
    {
        comparison = comparison + '';
        if (!Compare.operators.includes(comparison)) {
            throw new Error('Unknown comparison operator: ' + comparison);
        }
        this.field = field + '';
        this.comparison = comparison;
        this.value =  value;
    }

    test(object)
    {
        var actualValue = object[this.field];
        if (this.comparison === '=') {
            return actualValue == this.value;
        } else if (this.comparison === '<') {
            return actualValue < this.value;
        } else if (this.comparison === '<=') {
            return actualValue <= this.value;
        } else if (this.comparison === '>') {
            return actualValue > this.value;
        } else if (this.comparison === '>=') {
            return actualValue >= this.value;
        } else if (this.comparison === 'REGEX') {
            return this.value.test(actualValue);
        } else {
            throw new Error('Unknown comparison operator: ' + this.comparison);
        }
    }
}
Compare.operators = ['=', '<', '<=', '>', '>=', 'REGEX'];

class Searcher extends And
{
}
Searcher.where = function (...args) {
    return Searcher.prototype.where.apply(new Searcher(), args);
};
Searcher.push = function (...args) {
    return Searcher.prototype.push.apply(new Searcher(), args);
};
Searcher.and = function (...args) {
    return Searcher.prototype.push.apply(new And(), args);
};
Searcher.or = function (...args) {
    return Searcher.prototype.push.apply(new Or(), args);
};
Searcher.And = And;
Searcher.Or = Or;

module.exports = Searcher;
