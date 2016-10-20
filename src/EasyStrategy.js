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
    // Recommended actions follow Basic Strategy, based on the rules currently in play
    EasyBasicStrategy: function(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, options)
    {
        // Can you split?
        if ((playerCards[0] == playerCards[1]) && (playerCards.length == 2) && (handCount < options.maxSplitHands))
        {
            // Split unless 4s, 5s, and 10s
            if ((playerCards[0] != 4) && (playerCards[0] != 5) && (playerCards[0] != 10))
            {
                return "split";
            }
        }

        // Double
        if (((playerCards.length == 2) && ((handCount == 1) || options.doubleAfterSplit)) &&
                ((handValue.total >= options.doubleRange[0]) && (handValue.total <= options.doubleRange[1])))
        {
            // Only on 9-11
            if ((handValue.total == 9) && (dealerCard < 7) && (dealerCard != 1))
            {
                return "double";
            }
            if ((handValue.total == 10) && (dealerCard < 10) && (dealerCard != 1))
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
            // Hit until you get to 17, 18 against dealer 9-Ace
            if ((handValue.total < 18) || ((handValue.total == 18) && ((dealerCard >= 9) || (dealerCard == 1))))
            {
                return "hit";
            }
        }

        if (handValue.total <= 11)
        {
            return "hit";
        }
        else if (handValue.total >= 17)
        {
            return "stand";
        }
        else
        {
            // Hit on 7 or above, else stand
            return ((dealerCard >= 7) || (dealerCard == 1)) ? "hit" : "stand";
        }
    }
}; 
