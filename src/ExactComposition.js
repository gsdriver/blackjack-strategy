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
    GetExactCompositionOverride: function (playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, options) 
    {
        // If exactComposition isn't set, no override
        if (options.strategyComplexity != "exactComposition")
        {
            return null;
        }

        // Now look at strategies based on game options
        if ((options.numberOfDecks == 2) && (!options.hitSoft17)) 
        {
            return TwoDeckStandSoft17(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, options);
        }
    },
    // Should you surrender based on the exact composition of your cards?
    // return value of true means you should surrender (based on the exact cards in your hand)
    // return value of false means you should NOT surrender
    // return value of null means there is no opinion based on exact composition (continue processing via normal rules)
    GetSurrenderOverride : function (playerCards, dealerCard, handValue, handCount, options)
    {
        var shouldSurrender = null;

        if (options.surrender == "early")
        {
            // Don't surrender 10/4 or 5/9 in single deck, or 4/10 in double deck against dealer 10
            if ((handValue.total == 14) && (dealerCard == 10))
            {
                if ((options.numberOfDecks == 1) && 
                    ((playerCards[0] == 4) || (playerCards[0] == 5) || (playerCards[0] == 9) || (playerCards[0] == 10)))
                {
                    shouldSurrender = false;        
                }
                if ((options.numberOfDecks == 2) && ((playerCards[0] == 4) || (playerCards[0] == 10)))
                {
                    shouldSurrender = false;
                }
            }
        }
        // Late surrender against an Ace when dealer hits on soft 17
        else if ((options.hitSoft17) && (dealerCard == 1))
        {
            // Single or double deck 8/7 doesn't surrender
            if ((handValue.total == 15) && (options.numberOfDecks <= 2) && ((playerCards[0] == 8) || (playerCards[0] == 7)))
            {
                shouldSurrender = false;
            }
            else if ((handValue.total == 17) && (options.numberOfDecks == 1) && ((playerCards[0] == 10) || (playerCards[0] == 7)))
            {
                shouldSurrender = true;
            }
        }
        // Late surrender against an Ace, dealer doesn't hit soft 17
        else if (dealerCard == 1)
        {
            // If it is a 9/7 single deck, we don't surrender
            if ((handValue.total == 16) && (options.numberOfDecks == 1) && ((playerCards[0] == 9) || (playerCards[0] == 7)))
            {
                shouldSurrender = false;
            }
        }
        // Late surrender against a non-Ace
        else
        {
            // 8/7 against 10 doesn't surrender
            if ((handValue.total == 15) && (dealerCard == 10) && ((playerCards[0] == 8) || (playerCards[0] == 7)))
            {
                shouldSurrender = false;
            }
        }

        return shouldSurrender;    
    }

}; 

/*
 * Internal functions
 */

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
function TwoDeckStandSoft17(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, options)
{
    var result;
    const overrides = [
            {hand:[4,6,6], dealer: 10, action: "hit"},
            {hand:[3,6,7], dealer: 10, action: "hit"},
            {hand:[2,6,8], dealer: 10, action: "hit"},
            {hand:[1,6,9], dealer: 10, action: "hit"},
            {hand:[3,3,10], dealer: 10, action: "hit"},
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
            {hand:[2,3,3,3,5], dealer: 9, action: "stand"},
            {hand:[1,1,1,1,4,4], dealer: 3, action: "stand"},
            {hand:[1,1,2,4,4,4], dealer: 7, action: "stand"},
            {hand:[1,1,3,3,4,4], dealer: 7, action: "stand"},
            {hand:[1,2,2,3,4,4], dealer: 7, action: "stand"},
            {hand:[1,2,3,3,3,4], dealer: 7, action: "stand"},
            {hand:[1,3,3,3,3,3], dealer: 7, action: "stand"},
            {hand:[2,2,2,3,3,4], dealer: 7, action: "stand"},
            {hand:[2,2,3,3,3,3], dealer: 7, action: "stand"},
            {hand:[1,3,3,3,3,3], dealer: 8, action: "stand"},
            {hand:[2,2,3,3,3,3], dealer: 8, action: "stand"},
            {hand:[1,3,3,3,3,3], dealer: 9, action: "stand"},
            {hand:[2,2,3,3,3,3], dealer: 9, action: "stand"},
            {hand:[1,1,2,4,4,4], dealer: 9, action: "stand"},
            {hand:[1,1,3,3,4,4], dealer: 9, action: "stand"},
            {hand:[1,2,2,3,4,4], dealer: 9, action: "stand"},
            {hand:[1,2,3,3,3,4], dealer: 9, action: "stand"},
            {hand:[2,2,2,2,4,4], dealer: 9, action: "stand"},
            {hand:[2,2,2,3,3,4], dealer: 9, action: "stand"},
            {hand:[1,1,1,3,5,5], dealer: 9, action: "stand"},
            {hand:[1,1,1,4,4,5], dealer: 9, action: "stand"},
            {hand:[1,1,2,2,5,5], dealer: 9, action: "stand"},
            {hand:[1,1,2,3,4,5], dealer: 9, action: "stand"},
            {hand:[1,1,3,3,3,5], dealer: 9, action: "stand"},
            {hand:[1,2,2,2,4,5], dealer: 9, action: "stand"},
            {hand:[1,2,2,3,3,5], dealer: 9, action: "stand"},
            {hand:[2,2,2,2,3,5], dealer: 9, action: "stand"},
            {hand:[1,1,1,1,6,6], dealer: 10, action: "hit"},
            {hand:[1,2,2,2,3,6], dealer: 10, action: "hit"},
            {hand:[2,2,2,2,2,6], dealer: 10, action: "hit"},
        ];

    // Special case if there are two cards
    if (playerCards.length == 2)
    {
        if ((handValue.total == 11) && (dealerCard == 1) &&
            ((playerCards[0] == 2) || (playerCards[0] == 3) || (playerCards[0] == 8) || (playerCards[0] == 9)))
        {
            return "double";            
        }
        else if ((handValue.total == 12) && (dealerCard == 4) &&
                    ((playerCards[0] == 2) || (playerCards[0] == 10)))
        {
            return "hit";
        }
    }
    else // 3 or more cards
    {
        // Ace, Ace, 6 hits against dealer Ace
        if ((playerCards.length == 3) && (handValue.total == 18) && handValue.soft && (dealerCard == 1) &&
                    ((playerCards[0] == 6) || (playerCards[1] == 6) || (playerCards[2] == 6)))
        {
            return "hit";
        }
        else if ((playerCards.length == 6) || (handValue.total == 16))
        {
            result = FindExceptionInList(playerCards, dealerCard, overrides);
            if (result)
            {
                return result;
            }
        }
    
        // Three or more cards, 16 vs 10 stands and soft 18 vs Ace stands (except as noted in table which was already checked)
        if ((handValue.total == 16) && (dealerCard == 10))
        {
            return "stand";
        }
        if ((handValue.total == 18) && (handValue.soft) && (dealerCard == 1))
        {
            return "stand";
        }
    }

    return null;
 }

 
