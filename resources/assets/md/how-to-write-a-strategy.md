
You're writing a strategy class. Your strategy class needs a `move` method. The `move` method must return a `Searcher` object or the name of your opponent's character.

### Parameters

The `move` method you write receives three parameters:

```
me:    An object with information about your player.
other: An object with information about the other player.
log:   A function that accepts strings you can review later.
```

The `me` object has three fields:

```
board:  A `Board` object has two fields:
    remaining: An array of `Who` objects that you haven't yet
               rejected.
    rejected:  An array of `Who` objects that you have rejected.

player: The strategy class itself. Check `player.name` to be sure.
who:    Your own `Who` object. The one that your opponent is trying 
        to guess.
```

The `other` object has the same structure, with some things blanked out. Each of their board arrays is the right length, but the values are `undefined`. Their `Who` is also undefined. 

Their `player` class is intact, so you can check `player.name`, for example.

### Who Objects

The `Who` objects are simple key-value objects. For example, the entry for Alex looks like this:

```
{
    name: 'Alex',
    hair_color: 'black',
    mustache: true,
    eye_color: 'brown',
    bangs: true,
    gender: 'male',
}
```

### Searcher

If your `move` method passes back a `Searcher` object, the `Searcher` will be tested against the opponent's `Who`.

* If it matches, anything on your own board that doesn't match will be rejected.
* If it doesn't match, anything on your own board that does match will be rejected.

The `Searcher` object is built by calling `where`, `and` and `or`. 

#### Examples:

Match `Who` objects that have `eye_color` == 'brown':
```
Searcher.where('eye_color', 'brown')
```

Match `Who` objects that have hat == true and gender == 'female':
```
Searcher.where('hat', true').where('gender', 'female')
```

Match `Who` objects that have names with an e (case-insensitive) using regex:
```
Searcher.where('name', /e/i)
```

Match `Who` objects that have either name == 'Philip' or name == 'Max':
```
Searcher.or([Searcher.where('name', 'Philip'), Searcher.where('name', 'Anita'])
```

Match `Who` objects that have (gender == 'female' OR eye_color == 'brown') AND earrings == true:
```
Searcher.or([Searcher.where('gender', 'female'), Searcher.where('eye_color', 'brown')]).and('earrings', true)
```

### Finishing Move

When you return a string, the match ends. If you returned the name of the opponent's `Who`, then your strategy wins.

Otherwise your opponent's strategy wins by default.

### Submitting Your Creation

When you write a strategy it just lives in your browser. A page refresh can destroy it (we'll work on local storage, soon). But you want the world to see it win big time.

1. Fork the repo at <a href="https://github.com/dankuck/who-guessers" target="_blank">https://github.com/dankuck/who-guessers</a>.
2. Put your strategy in the `resources/assets/js/strategies` folder.
3. Add a `require` call in the `resources/assets/js/strategies/roster.js` file.

Then submit a pull request back to us.