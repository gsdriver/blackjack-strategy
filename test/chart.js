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

function OptionsToText(options)
{
    var text = "";

    text += (options.numberOfDecks + " deck(s), ");
    text += (options.hitSoft17) ? "Dealer Hits ": "Dealer Stands ";
    text += "on soft 17 - " + options.strategyComplexity + " complexity";

    return text;
}

function ResultToLetter(result)
{
    var letter = "N";
    
    switch (result)
    {
        case "surrender":
            letter = "R";
            break;
        case "split":
            letter = "P";
            break;
        case "stand":
            letter = "S";
            break;
        case "hit":
            letter = "H";
            break;
        case "double":
            letter = "D";
            break;
    }    

    return letter;
}

function GetOneRow(playerCards, options)
{
    var dealerCard;
    var line = "";
    var result;

    // Go thru every combination with this set of options and spit out to a CSV file
    // Start with the most liberal double and surrender rules, and then augment with a qualifier if you
    // aren't able to double or surrender
    options.doubleRange = [1,21];
    options.surrender = "late";
    options.doubleAfterSplit = true;

    for (dealerCard = 2; dealerCard <= 11; dealerCard++)
    {
        result = lib.GetRecommendedPlayerAction(playerCards, (dealerCard == 11) ? 1 : dealerCard, 1, true, options);
        line += ResultToLetter(result);

        if ((result == "double") || (result == "surrender"))
        {
            // Do it again with no double or surrender
            options.doubleRange = [0,0];
            options.surrender = "none";

            result = lib.GetRecommendedPlayerAction(playerCards, dealerCard, 1, true, options);
            line += ResultToLetter(result);

            // Reset to initial liberal options
            options.doubleRange = [1,21];
            options.surrender = "late";
        }
        else if (result == "split")
        {
            // Try it again if you can't double after split
            options.doubleAfterSplit = false;
            result = lib.GetRecommendedPlayerAction(playerCards, dealerCard, 1, true, options);
            if (result != "split")
            {
                line += ResultToLetter(result);
            }

            // Reset to initial liberal options
            options.doubleAfterSplit = true;
        }

        if (dealerCard < 11)
        {
            line += ","
        }    
    }

    return line;    
}

// Creates a chart for the given playing options - for double and surrender, it creates an entry that tells
// you what the alternate action should be if you cannot double or surrender
function CreateChart(options)
{
    var playerTotal;
    var line = "";
    var playerCards = [];

    // First the hard totals (8-17)
    console.log(OptionsToText(options));
    console.log(" ,2,3,4,5,6,7,8,9,10,A");
    for (playerTotal = 8; playerTotal <= 17; playerTotal++)
    {
        // Turn this into a hard hand - make it 10+ (or 2+), as this avoids splits
        // Note this assumes that we are not looking at exactComposition 
        if (playerTotal < 12)
        {
            playerCards[0] = 2;
            playerCards[1] = playerTotal - 2;
        } 
        else
        {
            playerCards[0] = 10;
            playerCards[1] = playerTotal - 10;
        }

        line = playerTotal + "," + GetOneRow(playerCards, options);

        // Write out this line
        console.log(line);
    }

    // Then the soft totals (13-20)
    console.log(" ,2,3,4,5,6,7,8,9,10,A");
    playerCards[0] = 1;
    for (playerTotal = 13; playerTotal <= 20; playerTotal++)
    {
        playerCards[1] = playerTotal - 11;
        line = playerTotal + "," + GetOneRow(playerCards, options);

        // Write out this line
        console.log(line);
    }

    // And last the pairs
    console.log(" ,2,3,4,5,6,7,8,9,10,A");
    for (playerTotal = 4; playerTotal <= 18; playerTotal += 2)
    {
        playerCards[0] = playerTotal / 2;
        playerCards[1] = playerCards[0];
        line = playerCards[0] + " pair," + GetOneRow(playerCards, options);

        // Write out this line
        console.log(line);
    }

    // Aces last
    playerCards[0] = 1;
    playerCards[1] = 1;
    line = "A pair," + GetOneRow(playerCards, options);
    console.log(line);
}

// We will spit out basic single/double/4+ options for both hit and stand on soft 17
const playerOptions = { hitSoft17: true, numberOfDecks: 1, strategyComplexity: "advanced"};
CreateChart(playerOptions);

playerOptions.hitSoft17 = false;
CreateChart(playerOptions);

playerOptions.numberOfDecks = 2;
playerOptions.hitSoft17 = true;
CreateChart(playerOptions);

playerOptions.hitSoft17 = false;
CreateChart(playerOptions);

playerOptions.numberOfDecks = 4;
playerOptions.hitSoft17 = true;
CreateChart(playerOptions);

playerOptions.hitSoft17 = false;
CreateChart(playerOptions);
