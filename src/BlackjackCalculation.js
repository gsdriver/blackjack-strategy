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
    // Recommended actions follow simple guidelines:
    // * always split aces and eights
    // * double 9 and 10 vs. dealer low card, and double 11 always
    // * hit on a soft 17 or less, stand on a soft 18 or more
    // * stand on any hand 12+ on a dealer low card (never bust)
    // * on a dealer high card, hit until 17+ (mimic the dealer)
    SuperEasyStrategy: function(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, options)
    {
        // Can you split?
        if ((playerCards[0] == playerCards[1]) && (playerCards.length == 2) && (handCount < options.maxSplitHands))
        {
            // only split As and 8s
            if ((playerCards[0] == 1) || (playerCards[0] == 8))
            {
                return "split";
            }
        }

        // Double
        if (((playerCards.length == 2) && ((handCount == 1) || options.doubleAfterSplit)) &&
                ((handValue.total >= options.doubleRange[0]) && (handValue.total <= options.doubleRange[1])))
        {
            // Only on 9-10 against a dealer low card
            if ((handValue.total == 9) && (dealerCard < 7) && (dealerCard != 1))
            {
                return "double";
            }
            if ((handValue.total == 10) && (dealerCard < 7) && (dealerCard != 1))
            {
                return "double";
            }
            if (handValue.total == 11)
            {
                return "double";
            }
        }

        // Hit and stand
        if (handValue.soft)
        {
            // Hit on a soft 17 or less, stand on a soft 18 or more
            return (handValue.total < 18) ? "hit" : "stand";
        }

        // On a dealer low card, stand on any hand 12+ (never bust)
        if (handValue.total <= 11)
        {
            return "hit";
        }
        else if ((dealerCard < 7) && (dealerCard != 1))
        {
            return "stand";
        }
        else
        {
            // On a dealer high card, hit until 17+ (mimic the dealer)
            // Hit on 7 or above, else stand
            return (handValue.total < 17) ? "hit" : "stand";
        }
    },

    // Recommended actions follow super-easy strategy, plus:
    // * Split 2s, 3s, 6s, 7s, and 9s vs. a dealer low card
    // * Double on 10 vs. a dealer 7, 8, or 9 (in addition to dealer 2 through 6)
    // * Double A6, A7 vs. a dealer low card
    SimpleStrategy: function(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, options)
    {
        // If early surrender is allowed, check that now (that's what early surrender means - before dealer checks for blackjack
        if ((options.surrender == "early") && (!handValue.soft && (handValue.total == 16) && (dealerCard == 10)))
        {
            return "surrender";
        }

        // Can you split?
        if ((playerCards[0] == playerCards[1]) && (playerCards.length == 2) && (handCount < options.maxSplitHands))
        {
            // Always split As and 8s
            if ((playerCards[0] == 1) || (playerCards[0] == 8))
            {
                return "split";
            }
            // Split unless 4s, 5s, and 10s against a dealer low card
            if ((playerCards[0] != 4) && (playerCards[0] != 5) && (playerCards[0] != 10) && (dealerCard < 7) && (dealerCard != 1))
            {
                return "split";
            }
        }

        // Double
        if (((playerCards.length == 2) && ((handCount == 1) || options.doubleAfterSplit)) &&
                ((handValue.total >= options.doubleRange[0]) && (handValue.total <= options.doubleRange[1])))
        {
            // Only on 9 against a dealer low card
            if ((handValue.total == 9) && (dealerCard < 7) && (dealerCard != 1))
            {
                return "double";
            }
            // Double on 10 vs. a dealer 7, 8, or 9 (in addition to dealer 2 through 6)
            if ((handValue.total == 10) && (dealerCard < 10) && (dealerCard != 1))
            {
                return "double";
            }
            // Double A6, A7 vs. a dealer low card
            if (playerCards.includes(1) && (playerCards.includes(6) || playerCards.includes(7)) && (dealerCard < 7) && (dealerCard != 1)) {
                return "double";
            }
            if (handValue.total == 11)
            {
                return "double";
            }
        }

        // Hit and stand
        if (handValue.soft)
        {
            // Hit on a soft 17 or less, stand on a soft 18 or more
            return (handValue.total < 18) ? "hit" : "stand";
        }

        // On a dealer low card, stand on any hand 12+ (never bust)
        if (handValue.total <= 11)
        {
            return "hit";
        }
        else if ((dealerCard < 7) && (dealerCard != 1))
        {
            return "stand";
        }
        else
        {
            // On a dealer high card, hit until 17+ (mimic the dealer)
            // Hit on 7 or above, else stand
            return (handValue.total < 17) ? "hit" : "stand";
        }
    },

    // Recommended actions follow super-easy and simple strategy, plus:
    // * Double A2-A5 vs. a dealer 5,6
    // * Stand on soft 18 or more Exception: Hit S18 vs 9, 10, Ace
    // * Dealer low card: Never Bust Stand on 12 or more Exception: Hit 12 vs 2, 3
    GreatStrategy: function(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, options)
    {
        // If early surrender is allowed, check that now (that's what early surrender means - before dealer checks for blackjack
        if ((options.surrender == "early") && (!handValue.soft && (handValue.total == 16) && (dealerCard == 10)))
        {
            return "surrender";
        }
        
        // Can you split?
        if ((playerCards[0] == playerCards[1]) && (playerCards.length == 2) && (handCount < options.maxSplitHands))
        {
            // Always split As and 8s
            if ((playerCards[0] == 1) || (playerCards[0] == 8))
            {
                return "split";
            }
            // Split unless 4s, 5s, and 10s against a dealer low card
            if ((playerCards[0] != 4) && (playerCards[0] != 5) && (playerCards[0] != 10) && (dealerCard < 7) && (dealerCard != 1))
            {
                return "split";
            }
        }

        // Double
        if (((playerCards.length == 2) && ((handCount == 1) || options.doubleAfterSplit)) &&
                ((handValue.total >= options.doubleRange[0]) && (handValue.total <= options.doubleRange[1])))
        {
            // Only on 9 against a dealer low card
            if ((handValue.total == 9) && (dealerCard < 7) && (dealerCard != 1))
            {
                return "double";
            }
            // Double on 10 vs. a dealer 7, 8, or 9 (in addition to dealer 2 through 6)
            if ((handValue.total == 10) && (dealerCard < 10) && (dealerCard != 1))
            {
                return "double";
            }
            if (playerCards.includes(1)) {
                // Double A6, A7 vs. a dealer low card
                if ((playerCards.includes(6) || playerCards.includes(7)) && (dealerCard < 7) && (dealerCard != 1)) {
                    return "double";
                }
                // Double A2-A5 vs. a dealer 5,6
                if ((playerCards.includes(2) || playerCards.includes(3) || playerCards.includes(4) || playerCards.includes(5)) && ((dealerCard == 5) || (dealerCard == 6))) {
                    return "double";
                }
            }
            if (handValue.total == 11)
            {
                return "double";
            }
        }

        // Hit and stand
        if (handValue.soft)
        {
            // Hit on a soft 17 or less
            if (handValue.total < 18)
            {
                return "hit";
            }
            // Stand on soft 18 or more
            // Exception: Hit S18 vs 9, 10, Ace
            return (handValue.total == 18 && ((dealerCard > 8) || (dealerCard == 1))) ? "hit" : "stand";
        }

        // On a dealer low card, stand on any hand 12+ (never bust)
        // Exception: Hit 12 vs 2, 3
        if (handValue.total <= 11)
        {
            return "hit";
        }
        else if ((handValue.total == 12) && ((dealerCard == 2) || (dealerCard == 3))) {
            return "hit";
        }
        else if ((dealerCard < 7) && (dealerCard != 1))
        {
            return "stand";
        }
        else
        {
            // On a dealer high card, hit until 17+ (mimic the dealer)
            // Hit on 7 or above, else stand
            return (handValue.total < 17) ? "hit" : "stand";
        }
    }
}; 
