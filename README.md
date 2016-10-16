# blackjack-suggest
Nodejs module that provides suggested action for a blackjack hand.  It is intended to augment blackjack applications
by teaching the player Basic Strategy, based on http://wizardofodds.com/games/blackjack/strategy/calculator/.  You can
pass in different Rule variants as well.

# Available variants

 * numberOfDecks - 1, 2, 4, 6, or 8
 * double - none, any, 9or10, or 9or10or11
 * maxSplitHands - the maximum number of hands a player can have (1=no splits allowed)
 * resplitAces - whether the player can resplit Aces (true or false)
 * doubleAfterSplit - whether the player can double after split (true or false)
 * hitSoft17 - whether the dealer hits soft 17 or not
 * surrender - none, early, or late (early surrender means surrender is offered before the dealer checks for a blackjack)
 * offerInsurance - whether insurance is offered or not

