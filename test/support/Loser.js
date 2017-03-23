
/**
 * This class gives the wrong answer, as close to always as we care about.
 */
class Loser
{
    move()
    {
        return Math.random() + "";
    }
}

module.exports = Loser;
