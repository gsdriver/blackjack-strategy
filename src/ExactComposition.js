/*
 * MIT License

 * Copyright (c) 2016 Garrett Vargas

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

module.exports = {
    // Special-case overrides based on exact composition of cards
    GetExactCompositionOverride: function (playerCards, dealerCard, handCount, dealerCheckedBlackjack, options) 
    {
        // If exactComposition isn't set, no override
        if (options.strategyComplexity != "exactComposition")
        {
            return null;
        }

        if ((options.numberOfDecks == 2) && (!options.hitSoft17)) 
        {
            return TwoDeckStandSoft17(playerCards, dealerCard, handCount, dealerCheckedBlackjack, options);
        }
    }
}; 

/*
 * Internal functions
 */

 // 
// HandTotal
// 
// Determines what the total of a hand should be, and whether that total is "soft" or not
//

function HandTotal(cards) 
{
    var retval = { total: 0, soft: false };
    var hasAces = false;

    for (var i = 0; i < cards.length; i++) {
        retval.total += cards[i];

        // Note if there's an ace
        if (cards[i] == 1) {
            hasAces = true;
        }
    }

    // If there are aces, add 10 to the total (unless it would go over 21)
    // Note that in this case the hand is soft
    if ((retval.total <= 11) && hasAces) {
        retval.total += 10;
        retval.soft = true;
    }

    return retval;
}

function FindExceptionInList(playerCards, dealerCard, overrides)
{
    // First create a sorted version of this list    
    var sortedHand = playerCards.slice(0).sort((a, b) => (a-b));
    var action = null;

    // Now you can compare
    for (var i = 0; i < overrides.length; i++)
    {
        if ((dealerCard == overrides[i].dealer) && (sortedHand.length == overrides[i].hand.length))
        {
            for (var card = 0; card < sortedHand.length; card++)
            {
                if (sortedHand[card] != overrides[i].hand[card])
                {
                    // Not a match
                    break;
                }
            }

            // If we got all the way through, it's a match!
            if (card == sortedHand.length)
            {
                // We did it!
                action = overrides[i].action;
                break;
            }
        }
    }

    return action;
 }

// Taken from http://wizardofodds.com/games/blackjack/appendix/3b/
function TwoDeckStandSoft17(playerCards, dealerCard, handCount, dealerCheckedBlackjack, options)
{
    var result;
    const overrides = [
            {hand:[2,9], dealer: 1, action: "hit"},
            {hand:[3,8], dealer: 1, action: "hit"},
            {hand:[2,10], dealer: 4, action: "hit"},
            {hand:[4,6,6], dealer: 10, action: "hit"},
            {hand:[3,6,7], dealer: 10, action: "hit"},
            {hand:[2,6,8], dealer: 10, action: "hit"},
            {hand:[1,6,9], dealer: 10, action: "hit"},
            {hand:[3,3,10], dealer: 10, action: "hit"},
            {hand:[1,1,6], dealer: 1, action: "hit"},
            {hand:[2,2,6,6], dealer: 10, action: "hit"},
            {hand:[1,3,6,6], dealer: 10, action: "hit"},
            {hand:[1,2,6,7], dealer: 10, action: "hit"},
            {hand:[1,1,6,8], dealer: 10, action: "hit"},
            {hand:[2,2,2,10], dealer: 10, action: "hit"},
            {hand:[1,2,3,10], dealer: 10, action: "hit"},
            {hand:[4,4,4,4], dealer: 9, action: "stand"},
            {hand:[3,4,4,5], dealer: 9, action: "stand"},
            {hand:[3,3,5,5], dealer: 9, action: "stand"},
            {hand:[2,4,5,5], dealer: 9, action: "stand"},
            {hand:[1,5,5,5], dealer: 9, action: "stand"},
            {hand:[2,2,3,3,6], dealer: 10, action: "hit"},
            {hand:[1,1,1,6,7], dealer: 10, action: "hit"},
            {hand:[1,1,2,2,10], dealer: 10, action: "hit"},
            {hand:[1,1,2,6,6], dealer: 10, action: "hit"},
            {hand:[1,3,4,4,4], dealer: 9, action: "stand"},
            {hand:[2,2,4,4,4], dealer: 9, action: "stand"},
            {hand:[2,3,3,4,4], dealer: 9, action: "stand"},
            {hand:[3,3,3,3,4], dealer: 9, action: "stand"},
            {hand:[1,2,3,5,5], dealer: 9, action: "stand"},
            {hand:[1,2,4,4,5], dealer: 9, action: "stand"},
            {hand:[1,3,3,4,5], dealer: 9, action: "stand"},
            {hand:[2,2,2,5,5], dealer: 9, action: "stand"}, 
            {hand:[2,2,3,4,5], dealer: 9, action: "stand"},
            {hand:[2,3,3,3,5], dealer: 9, action: "stand"}
            // TODO: Add the Six Card hands
        ];

    result = FindExceptionInList(playerCards, dealerCard, overrides);
    if (result)
    {
        return result;
    }

    // Three or more cards, 16 vs 10 stands and soft 18 vs Ace stands (except as noted in table which was already checked)
    if ((playerCards.length >= 3) && (HandTotal(playerCards).total == 16) && (dealerCard == 10))
    {
        return "stand";
    }
    else if ((playerCards.length >= 3) && (HandTotal(playerCards).total == 18) && (HandTotal(playerCards).soft) && (dealerCard == 1))
    {
        return "stand";
    }

    return null;
 }