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

const ec = require('../src/ExactComposition');
const easy = require('../src/EasyStrategy');
const BlackjackCalculation = require('./BlackjackCalculation');

module.exports = {
    // Recommended actions follow Basic Strategy, based on the rules currently in play
    GetRecommendedPlayerAction: function(playerCards, dealerCard, handCount, dealerCheckedBlackjack, options)
    {
        const playerOptions = ExtractOptions(options);
        var exactCompositionOverride = null;
        var countResult = null;
        var handValue = HandTotal(playerCards);

        // If early surrender is allowed, check that now (that's what early surrender means - before dealer checks for blackjack
        if ((playerOptions.surrender == "early") && (ShouldPlayerSurrender(playerCards, dealerCard, handValue, handCount, playerOptions)))
        {
            return "surrender";
        }

        // OK, let's see if the count will change anything
        if (playerOptions.count.system == "HiLo")
        {
            countResult = AdjustPlayForHiLoCount(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, playerOptions);    
            if (countResult)
            {
                return countResult;
            }
        }
         
        // OK, if an ace is showing it's easy - never take insurance
        if (((dealerCard == 1) && !dealerCheckedBlackjack && playerOptions.offerInsurance))
        {
            return "noinsurance";    
        }

        if ((playerOptions.strategyComplexity == "easy"))
        {
            return easy.EasyBasicStrategy(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, playerOptions);
        }

        // blackjackcalculation.com basic strategies
        if ((playerOptions.strategyComplexity == "bjc-supereasy"))
        {
            return BlackjackCalculation.SuperEasyStrategy(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, playerOptions);
        }

        if ((playerOptions.strategyComplexity == "bjc-simple"))
        {
            return BlackjackCalculation.SimpleStrategy(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, playerOptions);
        }

        if ((playerOptions.strategyComplexity == "bjc-great"))
        {
            return BlackjackCalculation.GreatStrategy(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, playerOptions);
        }

        // OK, first, if there is an exact composition override use that
        exactCompositionOverride = ec.GetExactCompositionOverride(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, playerOptions);
        if (exactCompositionOverride)
        {
            return exactCompositionOverride;
        }

        // Check each situation
        if (ShouldPlayerSplit(playerCards, dealerCard, handValue, handCount, playerOptions))
        {
            return "split";
        }
        else if (ShouldPlayerDouble(playerCards, dealerCard, handValue, handCount, playerOptions))
        {
            return "double";
        }
        // Note if early surrender is allowed we already checked, so no need to check again
        else if ((playerOptions.surrender != "early") && ShouldPlayerSurrender(playerCards, dealerCard, handValue, handCount, playerOptions))
        {
            return "surrender";
        }
        else if (ShouldPlayerStand(playerCards, dealerCard, handValue, handCount, playerOptions))
        {
            return "stand";
        }
        else if (ShouldPlayerHit(playerCards, dealerCard, handValue, handCount, playerOptions))
        {
            return "hit";
        }

        // I got nothing
        return "none";
    }
}; 

/*
 * Internal functions
 */

function HandTotal(cards)
{
    var retval = { total: 0, soft: false };
    var hasAces = false;

    for (var i = 0; i < cards.length; i++) 
    {
        retval.total += cards[i];

        // Note if there's an ace
        if (cards[i] == 1) 
        {
            hasAces = true;
        }
    }

    // If there are aces, add 10 to the total (unless it would go over 21)
    // Note that in this case the hand is soft
    if ((retval.total <= 11) && hasAces) 
    {
        retval.total += 10;
        retval.soft = true;
    }

    return retval;
}

function ExtractOptions(options)
{
    const playerOptions = { hitSoft17: true, surrender: "late", doubleRange:[0,21], doubleAfterSplit: true, 
                            resplitAces: false, offerInsurance: true, numberOfDecks: 6, maxSplitHands: 4, 
                            count: {system: null, trueCount: null}, strategyComplexity: "simple"};

    // Override defaults where set
    if (options)
    {
        if (options.hasOwnProperty("hitSoft17"))
        {
            playerOptions.hitSoft17 = options.hitSoft17;
        }
        if (options.hasOwnProperty("surrender"))
        {
            playerOptions.surrender = options.surrender;
        }
        if (options.hasOwnProperty("doubleAfterSplit"))
        {
            playerOptions.doubleAfterSplit = options.doubleAfterSplit;
        }
        if (options.hasOwnProperty("resplitAces"))
        {
            playerOptions.resplitAces = options.resplitAces;
        }
        if (options.hasOwnProperty("offerInsurance"))
        {
            playerOptions.offerInsurance = options.offerInsurance;
        }
        if (options.hasOwnProperty("numberOfDecks"))
        {
            playerOptions.numberOfDecks = options.numberOfDecks;
        }
        if (options.hasOwnProperty("maxSplitHands"))
        {
            playerOptions.maxSplitHands = options.maxSplitHands;
        }
        if (options.hasOwnProperty("count"))
        {
            playerOptions.count = options.count;
        }
        if (options.hasOwnProperty("strategyComplexity"))
        {
            // Note that prior to version 1.1.2, "basic" was used instead of "simple"
            playerOptions.strategyComplexity = options.strategyComplexity;
            if (playerOptions.strategyComplexity == "basic")
            {
                playerOptions.strategyComplexity = "simple";
            }
        }

        // Double rules - make sure doubleRange is set as that is all we use here
        if (options.hasOwnProperty("doubleRange"))
        {
            playerOptions.doubleRange = options.doubleRange;
        }
        else if (options.hasOwnProperty("double"))
        {
            // Translate to doubleRange
            if (options.double == "none") 
            {
                playerOptions.doubleRange[0] = 0;
                playerOptions.doubleRange[1] = 0;
            } 
            else if (options.double === "10or11") 
            {
                playerOptions.doubleRange[0] = 10;
                playerOptions.doubleRange[1] = 11;
            } 
            else if (options.double === "9or10or11") 
            {
                playerOptions.doubleRange[0] = 9;
                playerOptions.doubleRange[1] = 11;
            }
        }
    }

    return playerOptions;
}

//
// Split strategy
//

function ShouldPlayerSplit(playerCards, dealerCard, handValue, handCount, options)
{
    var shouldSplit = false;

    // It needs to be a possible action
    if ((playerCards.length != 2) || (handCount == options.maxSplitHands) || (playerCards[0] != playerCards[1]))
    {
        return false;
    }

    // OK, it's a possibility
    switch (playerCards[0])
    {
        case 1:
            // Always split aces
            shouldSplit = true;
            break;
        case 2:
            // Against 4-7, or 2 and 3 if you can double after split; also against a dealer 3 in single deck
            shouldSplit = ((dealerCard > 3) && (dealerCard < 8)) || (((dealerCard == 2) || (dealerCard == 3)) && (options.doubleAfterSplit));
            if ((dealerCard == 3) && (options.numberOfDecks == 1))
            {
                shouldSplit = true;
            }
            break;
        case 3:
            // Against 4-7, or 2 and 3 if you can double after split
            // Also in single deck against an 8 if you can double after split
            shouldSplit = ((dealerCard > 3) && (dealerCard < 8)) || (((dealerCard == 2) || (dealerCard == 3)) && (options.doubleAfterSplit));
            if ((dealerCard == 8) && (options.numberOfDecks == 1) && (options.doubleAfterSplit))
            {
                shouldSplit = true;
            }
            break;
        case 4:
            // Against 5 or 6, and only if you can double after split
            // Or against a 4 in single deck, if you can double after split
            shouldSplit = ((dealerCard == 5) || (dealerCard == 6) || ((dealerCard == 4) && (options.numberOfDecks == 1))) && (options.doubleAfterSplit);
            break;
        case 6:
            // Split 3-6, or against a 2 if double after split is allowed (for four or more decks, always for one or two decks)
            // Or in single or double deck, against a 7 if double after split is allowed
            shouldSplit = ((dealerCard > 2) && (dealerCard < 7)) || 
                    ((dealerCard == 2) && (((options.numberOfDecks >= 4) && options.doubleAfterSplit) || (options.numberOfDecks <= 2)));
            if ((options.numberOfDecks <= 2) && (dealerCard == 7) && options.doubleAfterSplit)
            {
                shouldSplit = true;
            }
            break;
        case 7:
            // Split on 2-7, and on single or double deck split against an 8 only if you can double after split
            shouldSplit = ((dealerCard > 1) && (dealerCard < 8));
            if ((dealerCard == 8) && (options.numberOfDecks <= 2))
            {
                shouldSplit = options.doubleAfterSplit;
            }
            break;
        case 8:
            // The simple rule is always split 8s - there are exceptions where we will surrender instead, which are covered in 
            // the case where the player should surrender.  Check if they should surrender, if not they should split
            shouldSplit = !ShouldPlayerSurrender(playerCards, dealerCard, handValue, handCount, options);
            break;
        case 9:
            // Split against 2-9 except 7
            // An advanced exception - 9s should split against an ace in single deck if dealer has an ace and you can double after split
            // and the dealer hits soft 17 (that's a mouthful!)
            shouldSplit = ((dealerCard > 1) && (dealerCard < 10) && (dealerCard != 7));
            if ((options.strategyComplexity != "simple") && (dealerCard == 1) && (options.numberOfDecks == 1) && (options.doubleAfterSplit) && options.hitSoft17)
            {
                shouldSplit = true;
            }
            break;
        case 5:
        case 10:
        default:
            // Don't split 5s or 10s ... or cards I don't know
            break;
    }

    return shouldSplit;
}

//
// Double strategy
//

function ShouldPlayerDouble(playerCards, dealerCard, handValue, handCount, options)
{
    var shouldDouble = false;

    // It needs to be a possible action
    if ((playerCards.length != 2) || ((handCount > 1) && !options.doubleAfterSplit))
    {
        return false;
    }
    if ((handValue.total < options.doubleRange[0]) || (handValue.total > options.doubleRange[1]))
    {
        return false;
    }

    // OK, looks like you can double
    if (handValue.soft)
    {
        // Let's look at the non-ace card to determine what to do (get this by the total)
        switch (handValue.total)
        {
            case 13:
            case 14:
                // Double against dealer 5 or 6; on single deck you should also double against 4
                // On double deck a soft 14 should double against 4 if the dealer hits soft 17
                shouldDouble = (dealerCard == 5) || (dealerCard == 6);
                if ((dealerCard == 4) && ((options.numberOfDecks == 1) || ((options.numberOfDecks == 2) && (handValue.total == 14) && options.hitSoft17)))
                {
                    shouldDouble = true;
                }
                break;
            case 15:
            case 16:
                // Double against dealer 4-6
                shouldDouble = (dealerCard >= 4) && (dealerCard <= 6);
                break;
            case 17:
                // Double against 3-6, and against 2 in single deck
                shouldDouble = ((dealerCard >= 3) && (dealerCard <= 6)) || ((dealerCard == 2) && (options.numberOfDecks == 1));
                break;
            case 18:
                // Double against 3-6 - also 2 if the dealer hits soft 17 and there is more than one deck
                shouldDouble = ((dealerCard >= 3) && (dealerCard <= 6)) || ((dealerCard == 2) && options.hitSoft17 && (options.numberOfDecks > 1));
                break;
            case 19:
                // Double against 6 if the dealer hits soft 17, or always in single deck
                shouldDouble = (dealerCard == 6) && (options.hitSoft17 || (options.numberOfDecks == 1));
                break;
            default:
                // Don't double
                break;
        }
    }
    else
    {
        // Double on 9, 10, or 11 only (8 in single deck)
        switch (handValue.total)
        {
            case 8:
                // Double 5-6 in single deck
                shouldDouble = ((dealerCard >= 5) && (dealerCard <= 6) && (options.numberOfDecks == 1));
                break;
            case 9:
                // Double 3-6, and 2 in single or double deck
                shouldDouble = ((dealerCard >= 3) && (dealerCard <= 6)) || ((dealerCard == 2) && (options.numberOfDecks <= 2));
                break;
            case 10:
                // Double 2-9
                shouldDouble = (dealerCard >= 2) && (dealerCard <= 9);
                break;
            case 11:
                // Double anything except an ace (and then only if the dealer doesn't hit soft 17 or there are more than two decks)
                shouldDouble = !((dealerCard == 1) && !options.hitSoft17 && (options.numberOfDecks > 2));
                break;
            default:
                break;
        }
    }

    return shouldDouble;
}

// 
// Surrender strategy
//
// This is fairly complex and handles different strategies for early or late surrender
// It also looks at various combinations of player hands for more advanced strategy complexities
//

function ShouldPlayerSurrender(playerCards, dealerCard, handValue, handCount, options)
{
    var shouldSurrender = false;

    // You can only surrender on your first two cards, and it has to be an option
    if (((options.surrender != "early") && (options.surrender != "late")) || (playerCards.length != 2) || (handCount != 1))
    {
        return false;
    }

    // See if there is a special suggestion based on the exact composition of the player's hand
    var exactCompositionSurrender = ec.GetSurrenderOverride(playerCards, dealerCard, handValue, handCount, options);
    if (exactCompositionSurrender != null)
    {
        return exactCompositionSurrender;
    }

    // Don't surrender a soft hand
    if (handValue.soft)
    {
        return false;
    }

    if (options.surrender == "early")
    {
        if (dealerCard == 1)
        {
            // Surrender Dealer Ace vs. hard 5-7, hard 12-17, including pair of 3's, 6's, 7's or 8's
            // Also surender against pair of 2's if the dealer hits soft 17
            if (((handValue.total >= 5) && (handValue.total <= 7)) || ((handValue.total >= 12) && (handValue.total <= 17)))
            {
                shouldSurrender = true;
            }
            if ((playerCards[0] == 2) && (playerCards[1] == 2) && options.hitSoft17)
            {
                shouldSurrender = true;
            }
        }    
        else if (dealerCard == 10)
        {
            // Surrender dealer 10 against a hard 14-16, including pair of 7's or 8's    
            if ((handValue.total >= 14) && (handValue.total <= 16))
            {
                // UNLESS it's a pair of 8's in single deck and double after split is allowed
                // This is an advanced option (for simple, we will "always split 8s")
                if ((playerCards[0] == 8) && (playerCards[1] == 8))
                {
                    shouldSurrender = (options.strategyComplexity != "simple") && (options.numberOfDecks == 1) && (options.doubleAfterSplit);
                }
                else
                {
                    shouldSurrender = true;
                }
            }
        }
        else if (dealerCard == 9)
        {
            // Surrender if we have 16, but no including a pair of 8's
            if ((handValue.total == 16) && (playerCards[0] != 8))
            {
                shouldSurrender = true;
            }
        }
    }
    // Late surrender against an Ace when dealer hits on soft 17
    else if ((options.hitSoft17) && (dealerCard == 1))
    {
        switch (handValue.total)
        {
            case 14:
                // If looking at advanced, then surrender a pair of 7s in a single deck game only
                shouldSurrender = ((options.strategyComplexity != "simple") && (options.numberOfDecks == 1) && (playerCards[0] == 7));
                break;
            case 15:
                // Surrender
                shouldSurrender = true;
                break;
            case 16:
                // Surrender unless it's a pair of 8s in a single deck game or a double deck game with no double after split
                // This is an advanced option (simple is "always split 8s")
                shouldSurrender = (playerCards[0] != 8);
                if ((options.strategyComplexity != "simple") && (playerCards[0] == 8))
                {
                    // Surrender pair of 8s if four or more decks or in a double-deck game where double after split isn't allowed
                    if ((options.numberOfDecks >= 4) || ((options.numberOfDecks == 2) && !options.doubleAfterSplit))
                    {
                        shouldSurrender = true;
                    }
                }
                break;
            case 17:
                // Surrender (that's new by me)
                shouldSurrender = true;
                break;
            default:
                // Don't surender
                break;
        }
    }
    // Late surrender against an Ace, dealer doesn't hit soft 17
    else if (dealerCard == 1)
    {
        // We only surrender a 16 in this case (not a pair of 8s). 
        shouldSurrender = (handValue.total == 16) && (playerCards[0] != 8);
    }
    // Late surrender against a non-Ace
    else
    {
        // The simple rule is 15 against 10 if more than one deck, and 16 (non-8s) against 10 always or against 9 if 4 or more decks
        // If looking at advanced, 7s surrender against 10 in single deck 
        if (handValue.total == 14)
        {
            shouldSurrender = ((options.strategyComplexity != "simple") && (playerCards[0] == 7) && (dealerCard == 10) && (options.numberOfDecks == 1));
        }
        else if (handValue.total == 15)
        {
            // Surrender against 10 unless it's a single deck game
            shouldSurrender = ((dealerCard == 10) && (options.numberOfDecks > 1));
        }
        else if (handValue.total == 16)
        {
            // Surrender against 10 or Ace, and against 9 if there are more than 4 decks
            shouldSurrender = (playerCards[0] != 8) && ((dealerCard == 10) || ((dealerCard == 9) && (options.numberOfDecks >= 4)));
        }
    }

    return shouldSurrender;    
}

//
// Stand Strategy
//
// Note that we've already checkd other actions such as double, split, and surrender
// So at this point we're only assessing whether you should stand as opposed to hitting
//

function ShouldPlayerStand(playerCards, dealerCard, handValue, handCount, options)
{
    var shouldStand = false;

    if (handValue.soft)
    {
        // Don't stand until you hit 18
        if (handValue.total > 18)
        {
            shouldStand = true;
        }
        else if (handValue.total == 18)
        {
            // Stand against dealer 2-8, and against a dealer Ace in single deck if they dealer will stand on soft 17
            shouldStand = ((dealerCard >= 2) && (dealerCard <= 8)) ||
                        ((dealerCard == 1) && (options.numberOfDecks == 1) && !options.hitSoft17);
        }
    }
    else
    {
        // Stand on 17 or above
        if (handValue.total > 16)
        {
            shouldStand = true;
        }
        else if (handValue.total > 12)
        {
            // 13-16 you should stand against dealer 2-6
            shouldStand = (dealerCard >= 2) && (dealerCard <= 6);
        }
        else if (handValue.total == 12)
        {
            // Stand on dealer 4-6
            shouldStand = (dealerCard >= 4) && (dealerCard <= 6);
        }

        // Advanced option - in single deck a pair of 7s should stand against a dealer 10
        if ((options.strategyComplexity != "simple") && (handValue.total == 14) && (playerCards[0] == 7) && (dealerCard == 10) && (options.numberOfDecks == 1))
        {
            shouldStand = true;
        }
    }

    return shouldStand;    
}

//
// Hit strategy
//
// Note this is the last action we check (we told them not to do anything else), so by default you should hit
// Since we don't have the full game state, it's assumed that the caller made sure not to call if the player
// took an action where the player has no choice of play (e.g. doubled or split aces)
//

function ShouldPlayerHit(playerCards, dealerCard, handValue, handCount, options)
{
    // The only sanity check we'll do is that you haven't already busted
    return (handValue.total < 21);
}

//
// Hi-Lo strategy
//
// Adjussts the recommendation based on the Hi-Lo count as defined at
// http://wizardofodds.com/games/blackjack/card-counting/high-low/
// We re
//
function AdjustPlayForHiLoCount(playerCards, dealerCard, handValue, handCount, dealerCheckedBlackjack, options)
{
    var canSplit = (playerCards[0] == playerCards[1]) && (playerCards.length == 2) && (handCount < options.maxSplitHands);
    var canDouble = ((playerCards.length == 2) && ((handCount == 1) || options.doubleAfterSplit)) &&
                        ((handValue.total < options.doubleRange[0]) || (handValue.total > options.doubleRange[1]));
    var canSurrender = ((options.surrender == "early") || (options.surrender == "late")) && (playerCards.length == 2) && (handCount == 1);
    var surrenderMatrix = [
            {player: 14, dealer: 10, count: 3},
            {player: 15, dealer: 10, count: 0},
            {player: 15, dealer: 9, count: 2},
            {player: 15, dealer: 1, count: 1}
        ];

    // We may take insurance!
    if ((dealerCard == 1) && !dealerCheckedBlackjack && options.offerInsurance && (options.count.trueCount >= 3))
    {
        return "insurance";   
    }
    else if ((handValue.total == 16) && (dealerCard == 10) && (options.count.trueCount > 0))
    {
        return "stand";
    }
    else if ((handValue.total == 15) && (dealerCard == 10) && (options.count.trueCount > 4))
    {
        return "stand";
    }
    else if (canSplit && (handValue.total == 20))
    {
        if ((dealerCard == 5) && (options.count.trueCount >= 5))
        {
            return "split";
        }
        else if ((dealerCard == 6) && (options.count.trueCount >= 4))
        {
            return "split";
        }
    }
    else if (canDouble && (handValue.total == 10) && (dealerCard == 10) && (options.count.trueCount >= 4))
    {
        return "double";
    }
    else if ((handValue.total == 12) && (dealerCard == 3) && (options.count.trueCount >= 2))
    {
        return "stand";
    }
    else if ((handValue.total == 12) && (dealerCard == 2) && (options.count.trueCount >= 3))
    {
        return "stand";
    }
    else if (canDouble && (handValue.total == 11) && (dealerCard == 1) && (options.count.trueCount >= 1))
    {
        return "double";
    }
    else if (canDouble && (handValue.total == 9) && (dealerCard == 2) && (options.count.trueCount >= 1))
    {
        return "double";
    }
    else if (canDouble && (handValue.total == 10) && (dealerCard == 1) && (options.count.trueCount >= 4))
    {
        return "double";
    }
    else if (canDouble && (handValue.total == 9) && (dealerCard == 7) && (options.count.trueCount >= 3))
    {
        return "double";
    }
    else if ((handValue.total == 16) && (dealerCard == 9) && (options.count.trueCount >= 5))
    {
        return "stand";
    }
    else if ((handValue.total == 13) && (dealerCard == 2) && (options.count.trueCount < -1))
    {
        return "hit";
    }
    else if ((handValue.total == 12) && (dealerCard == 4) && (options.count.trueCount < 0))
    {
        return "hit";
    }
    else if ((handValue.total == 12) && (dealerCard == 5) && (options.count.trueCount < -2))
    {
        return "hit";
    }
    else if ((handValue.total == 12) && (dealerCard == 6) && (options.count.trueCount < -1))
    {
        return "hit";
    }
    else if ((handValue.total == 13) && (dealerCard == 3) && (options.count.trueCount < -2))
    {
        return "hit";
    }
    else if (canSurrender)
    {
        for (var i = 0; i < surrenderMatrix.length; i++)
        {
            if ((handValue.total == surrenderMatrix[i].player) && (dealerCard == surrenderMatrix[i].dealer)
                && (options.count.trueCount >= surrenderMatrix[i].count))
            {
                return "surrender";
            }
        }
    }

    // Nope, no adjustment
    return null;
}