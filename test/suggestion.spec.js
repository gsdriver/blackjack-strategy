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

const lib = require('../src/suggestion');

const defaultRules = {
    hitSoft17:true,          // Does dealer hit soft 17
    surrender:"late",        // Surrender offered - none, late, or early
    double:"any",            // Double rules - none, 10or11, 9or10or11, any
    doubleAfterSplit:true,   // Can double after split - none, 10or11, 9or10or11, any
    resplitAces:false,       // Can you resplit aces
    offerInsurance:true,     // Insurance is offered
    numberOfDecks:6,         // Number of decks in play
    maxSplitHands:4          // Maximum number of hands you can have due to splits
};

function RunTest(testName, playerCards, dealerCard, handCount, rules, dealerCheckedBlackjack, expectedResult)
{
    const result = lib.GetRecommendedPlayerAction(playerCards, dealerCard, handCount, rules, dealerCheckedBlackjack);

    if (result == expectedResult)
    {
        console.log("SUCCESS: " + testName + " returned " + result);
    }
    else
    {
        console.log("FAIL: " + testName + " returned " + result + " rather than " + expectedResult);
    }
}

RunTest("Stand on 16 against dealer 3", [9,7], 3, 1, defaultRules, true, "stand");
RunTest("Split 9s against dealer 5", [9,9], 5, 1, defaultRules, true, "split");
RunTest("Hit 16 against 10 after split", [9,7], 10, 2, defaultRules, true, "hit");
RunTest("Surrender pair of 8s against dealer Ace", [8,8], 1, 1, defaultRules, true, "surrender");
RunTest("No insurance ever", [10,1], 1, 1, defaultRules, false, "noinsurance");
RunTest("Double soft 17 against 6", [1,6], 6, 2, defaultRules, true, "double");
