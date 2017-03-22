
class Eventer
{
    constructor()
    {
        this.observers = [];
    }

    on(closure)
    {
        this.observers.push(closure);
        return this;
    }

    fire(...args)
    {
        this.observers.map((observer) => observer(...args));
    }
}

module.exports = Eventer;

