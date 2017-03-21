
class Searcher
{
    construct()
    {
        this.compares = [];
    }
    
    where()
    {
        if (arguments.length === 3) {
            var field = arguments[0];
            var comparison = arguments[1];
            var value = arguments[2];
        } else {
            var field = arguments[0];
            var comparison = '=';
            var value = arguments[1];
            if (value instanceof RegExp) {
                comparison = 'REGEX';
            }
        }
        return this.push(new Compare(field, comparison, value));
    }

    push(compare)
    {
        this.compares.push(compare);
        return this;
    }

    test(object)
    {
        return new And(this.compares).test(object);
    }

    matches(objects)
    {
        return objects.filter((object) => this.test(object));
    }

    misses(objects)
    {
        return objects.reject((object) => this.test(object));
    }
}

class And
{
    construct(compares)
    {
        this.compares = compares;
    }

    test(object)
    {
        // find the first non-matching value
        // if none are non-matching, then all match
        return !this.compares.find((compare) => !compare.test(object));
    }
}

class Or
{
    construct(compares)
    {
        this.compares = compares;
    }

    test(object)
    {
        // find the first matching value
        return this.compares.find((compare) => (bool)compare.test(object));
    }
}

class Compare
{
    construct(field, comparison, value)
    {
        comparison = comparison + '';
        if (!Compare.operators.contains(comparison)) {
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

Searcher.Or = Or;
Search.And = And;

module.exports = Searcher;
