# blackjack-strategy
Nodejs module that provides suggested action for a blackjack hand.  It is intended to augment blackjack applications
by teaching the player Basic Strategy, based on http://wizardofodds.com/games/blackjack/strategy/calculator/.  You can
pass in different Rule variants as well.

# Available variants

 * numberOfDecks - 1, 2, 4, 6, or 8
 * doubleRange - array indicating a low and high set of player totals that can double (v1.1 or later)
 * double - none, any, 10or11, or 9or10or11 (note if set doubleRange overrides this value)
 * maxSplitHands - the maximum number of hands a player can have (1=no splits allowed)
 * resplitAces - whether the player can resplit Aces (true or false)
 * doubleAfterSplit - whether the player can double after split (true or false)
 * hitSoft17 - whether the dealer hits soft 17 or not
 * surrender - none, early, or late (early surrender means surrender is offered before the dealer checks for a blackjack)
 * offerInsurance - whether insurance is offered or not
 
# Usage

The exposed function from this library is `GetRecommendedPlayerAction` which will return a string suggesting an action for the player to take on their hand.

```
GetRecommendedPlayerAction(playerCards, dealerCard, handCount, 
                            dealerCheckedBlackjack, options)
```

The arguments to  `GetRecommendedPlayerAction` are:

 * playerCards - an array of integer values of the card, from 1-10 (1=Ace, all face cards should be 10)
 * dealerCard - an integer representing the value of the dealer's up card
 * handCount - the total number of hands the player has in play, usually 1 unless the player has split
 * dealerCheckedBlackjack - a Boolean indicating whether the dealer has checked for Blackjack yet or not
 * options - an object containing information about the rules of the game and the complexity of Basic Strategy suggestion desired
 
The options structure is composed of the following fields with the following default values:

```
{
    hitSoft17:true,             // Does dealer hit soft 17
    surrender:"late",           // Surrender offered - none, late, or early
    double:"any",               // Double rules - none, 10or11, 9or10or11, any
    doubleRange:[0,21],         // Range of values you can double, 
                                // if set supercedes double (v1.1 or higher)
    doubleAfterSplit:true,      // Can double after split
    resplitAces:false,          // Can you resplit aces
    offerInsurance:true,        // Is insurance offered
    numberOfDecks:6,            // Number of decks in play
    maxSplitHands:4,            // Max number of hands you can have due to splits
    count: {                    // Structure defining the count (v1.3 or higher)
        system: null,           // The count system - only "HiLo" is supported
        trueCount: null };      // The TrueCount (count / number of decks left)
    strategyComplexity:"simple" // easy (v1.2 or higher), simple, advanced,
                                // exactComposition, bjc-supereasy (v1.4 or higher),
                                // bjc-simple (v1.4 or higher), or bjc-great
                                // (v1.4 or higer) - see below for details
}
```

The `strategyComplexity` field determines how closely Basic Strategy is followed in making a recommendation.  There are six supported values:

## Easy 
In the case of "easy" the strategy is an easy-to-follow set of rules designed for beginners which simulation runs show is about 0.6% less advantagous than the "advanced" strategy on a 6-deck game:

 * Split all pairs except 4s, 5s, and 10s
 * Double 9 against a dealer card of 2-6
 * Double 10 against a dealer card of 2-9
 * Always double 11
 * Hit totals less than 12
 * Stand on totals of hard 17 or above
 * On hard 12-16, stand against a dealer 2-6, hit on 7 or above
 * Hit soft total up to and including 17
 * Hit soft 18 if the dealer has 9, 10, or Ace showing

## Simple
The "simple" strategy is a little more complex than the "easy" option and designed for more intermediate players (for example "always split 8s").  

## Advanced
In the case of "advanced," Basic Stategy is followed even in more advanced edge-cases (for example, surrender a pair of 8s against a dealer ace if the dealer hits soft 17).  

## Exact Composition
In the case of "exactComposition," certain rules are followed based on the exact make-up of the player's hand (for example, in single deck surrender a hand with a 10 and a 7 against a dealer ace if the dealer hits soft 17, but don't surrender other types of 17-value hands).

## bjc-simple, bjc-supereasy, and bjc-great
These strategies come from <http://blackjackcalculation.com/> and, similar
to "easy," "simple," and "advanced" allow players to follow a different set of rules that are 
easy to remember, but provide a trade-off of expected payout for an easier set of rules

Some example cases:

```
const lib = require("blackjack-strategy");

// Hit a three-card 11 against a dealer 6 should return "hit"
lib.GetRecommendedPlayerAction([2,3,6], 6, 1, true, null);

// Pair of 8s against dealer Ace - an advanced Strategy option should "surrender"
lib.GetRecommendedPlayerAction([8,8], 1, 1, true, 
                    {strategyComplexity: "advanced"});

// 10-7 against dealer Ace single deck should "surrender"
lib.GetRecommendedPlayerAction([7,10], 1, 1, true, 
                    {numberOfDecks:1, strategyComplexity: "exactComposition"});
```

# Contributing - bug fixes

Contributions are welcome!  Please feel free to fork this code and submit pull requests, for bug fixes or feature enhancements.

 1. Fork it!
 2. Create your featured branch: `git checkout -b my-feature`
 3. Commit your changes: `git commit -m 'add some feature'`
 4. Push to the branch: `git push origin my-feature`
 5. Submit a pull request

Many Thanks!
