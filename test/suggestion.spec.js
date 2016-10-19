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

// Use the default options
RunTest("Stand on 16 against dealer 3", [9,7], 3, 1, true, null, "stand");
RunTest("Split 9s against dealer 5", [9,9], 5, 1, true, null, "split");
RunTest("Hit 16 against 10 after split", [9,7], 10, 2, true, null, "hit");
RunTest("Split pair of 8s against dealer Ace - basic", [8,8], 1, 1, true, null, "split");
RunTest("Surrender 15 against dealer 10",[10,5], 10, 1, true, null, "surrender");
RunTest("No insurance ever", [10,1], 1, 1, false, null, "noinsurance");
RunTest("Double soft 17 against 6", [1,6], 6, 2, true, null, "double");
RunTest("Three-card 11 against 6", [2,3,6], 6, 1, true, null, "hit");

// Some single deck cases
RunTest("Split 6s against dealer 2", [6,6], 2, 1, true, {numberOfDecks:1, doubleAfterSplit:false}, "split");
RunTest("Split 9s against Ace single deck", [9,9], 1, 1, true, {strategyComplexity:"advanced", numberOfDecks:1, doubleAfterSplit:true}, "split");
RunTest("Double 8 against dealer 5 single deck", [3,5], 5, 1, true, {numberOfDecks:1, doubleAfterSplit:false}, "double");
RunTest("Hit 8 against dealer 5 single deck if can't double", [3,5], 5, 1, true, {numberOfDecks:1, doubleRange:[9,11]}, "hit");
RunTest("Stand soft 18 against Ace if stand on soft 17", [1,7], 1, 1, true, {numberOfDecks:1, hitSoft17:false}, "stand");

// Advanced strategy
RunTest("Surrender pair of 8s against dealer Ace", [8,8], 1, 1, true, {strategyComplexity: "advanced"}, "surrender");
RunTest("Early Surrender pair of 8s against dealer 10 single deck", [8,8], 10, 1, false, {numberOfDecks:1, surrender:"early", strategyComplexity: "advanced"}, "surrender");

// Exact Composition tests
RunTest("Hit pair of 7s against dealer 10 single deck", [7,7], 10, 1, true, {numberOfDecks:1}, "hit");
RunTest("Surrender pair of 7s against dealer 10 single deck with exact composition", [7,7], 10, 1, true, {numberOfDecks:1, strategyComplexity:"exactComposition"}, "surrender");
RunTest("Surrender 10-7 against dealer Ace single deck", [7,10], 1, 1, true, {numberOfDecks:1, strategyComplexity: "exactComposition"}, "surrender");
RunTest("Specific four-card hand in double deck stand soft 17", [8,1,6,1], 10, 1, true, {numberOfDecks: 2, strategyComplexity: "exactComposition", hitSoft17: false}, "hit");
RunTest("Specific six-card hand in double deck stand soft 17", [2,3,3,2,3,3], 9, 1, true, {numberOfDecks: 2, strategyComplexity: "exactComposition", hitSoft17: false}, "stand")
RunTest("Three card 16 against 10 in double deck stand soft 17", [4,4,10], 10, 1, true, {numberOfDecks: 2, strategyComplexity: "exactComposition", hitSoft17: false}, "stand");
RunTest("8/7 against Ace in double deck hit soft 17 doesn't surrender", [8,7], 1, 1, true, {numberOfDecks:2, strategyComplexity: "exactComposition", hitSoft17: true}, "hit");

// Final summary
console.log("\r\nRan " + (succeeded + failed) + " tests; " + succeeded + " passed and " + failed + " failed");