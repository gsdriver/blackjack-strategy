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

const defaultOptions = {
    hitSoft17:true,             // Does dealer hit soft 17
    surrender:"late",           // Surrender offered - none, late, or early
    double:"any",               // Double rules - none, 10or11, 9or10or11, any
    doubleAfterSplit:true,      // Can double after split - none, 10or11, 9or10or11, any
    resplitAces:false,          // Can you resplit aces
    offerInsurance:true,        // Insurance is offered
    numberOfDecks:6,            // Number of decks in play
    maxSplitHands:4,            // Maximum number of hands you can have due to splits
    strategyComplexity:"basic"  // Complexity of suggestion we will receive
};

var succeeded = 0;
var failed = 0;

function RunTest(testName, playerCards, dealerCard, handCount, dealerCheckedBlackjack, options, expectedResult)
{
    const result = lib.GetRecommendedPlayerAction(playerCards, dealerCard, handCount, dealerCheckedBlackjack, options);

    if (result == expectedResult)
    {
        console.log("SUCCESS: " + testName + " returned " + result);
        succeeded++;
    }
    else
    {
        console.log("FAIL: " + testName + " returned " + result + " rather than " + expectedResult);
        failed++;
    }
}

RunTest("Stand on 16 against dealer 3", [9,7], 3, 1, true, defaultOptions, "stand");
RunTest("Split 9s against dealer 5", [9,9], 5, 1, true, defaultOptions, "split");
RunTest("Hit 16 against 10 after split", [9,7], 10, 2, true, defaultOptions, "hit");
RunTest("Split pair of 8s against dealer Ace - basic", [8,8], 1, 1, true, defaultOptions, "split");
RunTest("Surrender 15 against dealer 10",[10,5], 10, 1, true, defaultOptions, "surrender");
RunTest("No insurance ever", [10,1], 1, 1, false, defaultOptions, "noinsurance");
RunTest("Double soft 17 against 6", [1,6], 6, 2, true, defaultOptions, "double");

// Advanced strategy
defaultOptions.strategyComplexity = "advanced";
RunTest("Surrender pair of 8s against dealer Ace", [8,8], 1, 1, true, defaultOptions, "surrender");
defaultOptions.numberOfDecks = 1;
defaultOptions.surrender = "early";
RunTest("Early Surrender pair of 8s against dealer 10 single deck", [8,8], 10, 1, false, defaultOptions, "surrender");

// Final summary
console.log("\r\nRan " + (succeeded + failed) + " tests; " + succeeded + " passed and " + failed + " failed");