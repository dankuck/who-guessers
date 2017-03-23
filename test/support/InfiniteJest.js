
/**
 * This class always passes back a move that matches nothing, and so makes no
 * changes to the board.
 */
class InfiniteJest
{
    move() {
        return {
            test(object) {
                return false;
            }
        };
    }
}

module.exports = InfiniteJest;
