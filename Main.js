const PILES = [];
const OPEN_CARDS = [];
const CARDS = [];
const SUITS = ["Club", "Diamond", "Heart", "Spade"];
const CARDS_DICT = {};
const FOUNDATIONS = { //indices of top cards in foundation piles
    "Club": 0,
    "Diamond": 0,
    "Heart": 0,
    "Spade": 0
};
let isCardSelected = false;
let selectedCard;

class Card {
    childCard;
    element;
    pile;

    /**
     * Create card object and corresponding element in document.
     * @param {int}     value:      value of card, 1-13.
     * @param {String}  suit:       card suit.
     * @param {boolean} visible:    whether the card value and suit should be visible in document.
     */
    constructor(value, suit, visible=false) {
        this.value = value;
        this.suit = suit;
        this.visible = visible;
        this.image = "Images/Cards/" + this.suit + "/" + this.value + ".png";
        this.id = this.suit + this.value;

        if (suit === "Heart" || suit === "Diamond") {
            this.color = 0; //Red
        } else {
            this.color = 1; //Black
        }
        this.createCardElement();
    }

    getVisible() {
        return this.visible;
    }

    /**
     * Set flipped card to show suit and value.
     */
    setVisible() {
        this.visible = true;
        document.getElementById(this.id + "Image").src = this.image;
    }

    /**
     * Create HTML element for the card.
     * @returns Element card element.
     */
    createCardElement() {
        let card = document.createElement("div");
        card.className = "card";
        card.id = this.id;
        let img = document.createElement("img");
        if (this.visible) {
            img.src = this.image;
        } else {
            img.src = "Images/Cards/flipped.png";
        }
        img.id = this.suit + this.value + "Image";
        img.onclick = function() {cardClicked(card);};
        card.appendChild(img);
        this.element = card;
        return card;
    }

    /**
     * Returns HTML Element of object's image.
     */
    getImageElement() {
        return this.getElement().firstChild;
    }

    /**
     * Returns HTML Element of object.
     */
    getElement() {
        return this.element;
    }


    /**
     * Adds card on top of this card.
     * @param {Card} otherCard: Card to add on this.
     */
    addChild(otherCard) {
        this.childCard = otherCard;

        otherCard.getElement().classList.add("card-stack2");
        this.getElement().appendChild(otherCard.getElement());
        otherCard.pile = this.pile;
    }

}

class Pile {

    /**
     * Create Pile object and set last card to be visible.
     * @param {Card[]}  cards:      cards to add to pile.
     * @param {int}     stackIndex: index of pile, 0-6.
     */
    constructor(cards, stackIndex) {
        this.cards = cards;
        this.size = 0;
        this.last = cards[cards.length-1];
        this.id = "Stack" + stackIndex;
        this.cards.forEach(card => {
            card.pile = this;
            this.initialAddCard(card, this.size);
            this.size++;
        });
        this.setLastVisible();
    }


    /**
     * Adds card and its children to pile.
     * @param {Card} card: card to add as last in pile.
     */
    addCard(card) {
        if (this.size === 0) {
            this.getElement().appendChild(card.getElement());
            card.getElement().classList.remove("card-stack2");
            card.getElement().classList.add("card-stack");
            card.pile = this;
        } else {
            this.last.addChild(card);
        }
        this.cards.push(card);
        this.size++;
        this.last = card;

        if (card.childCard != null) {
            this.addCard(card.childCard);
        }
    }


    /**
     * Removes card and its children from pile.
     * @param {Card} card: card to remove from pile.
     */
    removeCard(card) {
        if (this.size === 1) {
            this.size = 0;
            this.cards.pop();
        } else if (this.size <= 0) {
            console.log("removeCard error");
        } else {
            this.size--;
            let index = this.cards.indexOf(card);

            if (index > -1) this.cards.splice(index, 1);

            if (index > 0) {
                this.cards[index-1].childCard = null;
                this.last = this.cards[index-1];
            } else {
                this.last = null;
            }

            if (card.childCard != null) this.removeCard(card.childCard);
        }
    }


    /**
     * Helper function for constructor, adds card to pile when initialized.
     * @param {Card} card:  card to add to pile.
     * @param {int}  index: index of card in pile.
     */
    initialAddCard(card, index) {
        if (index === 0) {
            this.getElement().appendChild(card.element);
            document.getElementById(card.id).classList.add("card-stack");
        } else {
            this.cards[index-1].addChild(card);
        }
    }


    /**
     * Gets pile HTML Element.
     * @returns {HTMLElement}
     */
    getElement() {
        return document.getElementById(this.id);
    }


    /**
     * Flips last card in pile.
     */
    setLastVisible() {
        if (this.last != null) this.last.setVisible();
    }
}


/**
 * Shuffles cards using Durstenfeld's shuffle.
 * @param {Card[]} array: Array of cards to shuffle.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


/**
 * Sets card as the top card in waste pile.
 * @param {Card} newOpenCard: Card to set.
 */
function setShownCard(newOpenCard) {
    let shownDiv = document.getElementById("ShownCardDiv");
    if (newOpenCard == null) return;

    let element = newOpenCard.getElement();
    let img = newOpenCard.getImageElement();
    img.onclick = function() {
        img.classList.add("shown-selected");
        shownCardClicked(element);
    };

    if (shownDiv.hasChildNodes()) {
        shownDiv.replaceChild(element, shownDiv.firstChild);
    } else {
        shownDiv.appendChild(element);
    }
    newOpenCard.setVisible();
}


/**
 * Takes card from pile into waste pile.
 */
function openCard(){
    deselect();

    let newOpenCard = CARDS.pop();
    setShownCard(newOpenCard);
    OPEN_CARDS.push(newOpenCard);
    document.getElementById("counter").innerText = "Left in pile: " + CARDS.length;

    if (CARDS.length === 0) {
        document.getElementById("PileCards").removeChild(document.getElementById("PileFlipped"));
    }
}


/**
 * Handles clicks on waste pile.
 * @param {HTMLElement} cardElement: card on top of waste pile clicked.
 */
function shownCardClicked(cardElement) {
    let cardObject = getCardObject(cardElement.id);
    if (isCardSelected && selectedCard === cardObject) {
        deselect();
        return;
    }
    if (cardElement.id === "ShownCard" || isCardSelected) {
        alert("Illegal move!1");
        return;
    }

    selectedCard = cardObject;
    isCardSelected = true;
}


/**
 * Returns Card object by id.
 * @param {String} id: id of card to search.
 * @returns {Card} Card object matching id.
 */
function getCardObject(id) {
    return CARDS_DICT[id];
}


/**
 * Removes class from all HTML Elements in document, used for deselection of cards.
 * @param {String} className: class to remove.
 */
function removeClassFromAll(className) {
    let elements = document.getElementsByClassName(className);
    for(let i = 0; i < elements.length; i++) {
        elements[i].classList.remove(className);
    }
}


/**
 * Handles clicks on cards.
 * @param {HTMLElement} cardElement: Element of card clicked.
 */
function cardClicked(cardElement) {
    let cardObject = getCardObject(cardElement.id);
    if (!isCardSelected && cardObject.visible) {
        cardElement.classList.add("selected");
        selectedCard = cardObject;
        isCardSelected = true;
    } else if (isCardSelected)  {

        if (cardObject === selectedCard) {
            deselect();
        } else if (isLegalMove(selectedCard, cardObject)) {
            moveCard(cardElement);
            cardObject.pile.addCard(selectedCard);
        }
    }
}


/**
 * Moves selected card to be child of cardElement.
 * @param           cardElement: card to add child to.
 * @param {boolean} toFoundation: flags transferring to a foundation pile.
 */
function moveCard(cardElement, toFoundation=false) {
    let cardObject = getCardObject(cardElement.id);
    selectedCard.getElement().classList.remove("selected");
    removeClassFromAll("shown-selected");

    let selectedElement = selectedCard.getElement();
    if (toFoundation) {
        selectedCard.getImageElement().onclick = function() {};
    } else {
        selectedCard.getImageElement().onclick = function() {cardClicked(selectedElement)};
    }

    if (selectedCard === OPEN_CARDS[OPEN_CARDS.length-1]) {
        OPEN_CARDS.pop();

        setShownCard(OPEN_CARDS[OPEN_CARDS.length-1]);
    } else {
        let oldPile = selectedCard.pile;
        oldPile.removeCard(selectedCard);
        oldPile.setLastVisible();
    }
    isCardSelected = false;
}


/**
 * Handles clicks on a foundation pile.
 * @param {String} suit: Suit of clicked foundation pile.
 * @constructor
 */
function FoundationClicked(suit) {
    if (!isCardSelected || selectedCard.suit !== suit || FOUNDATIONS[suit] + 1 !== selectedCard.value) {
        alert("Illegal move");
        return;
    }
    if (selectedCard.childCard != null) {
        alert("Illegal move4");
        return;
    }
    let foundationDiv = document.getElementById(suit + "Foundation");
    moveCard(foundationDiv.firstChild, true);


    let foundationPile = document.getElementById(suit + "Foundation");

    foundationPile.replaceChild(selectedCard.getElement(), foundationPile.firstElementChild);
    FOUNDATIONS[suit]++;

    if (FOUNDATIONS["Club"] === 13 &&
        FOUNDATIONS["Diamond"] === 13 &&
        FOUNDATIONS["Heart"] === 13 &&
        FOUNDATIONS["Spade"] === 13) {
        alert("YOU WON!")
    }
}


/**
 * Cancels selection of all cards in document.
 */
function deselect() {
    isCardSelected = false;
    selectedCard = null;
    removeClassFromAll("selected");
    removeClassFromAll("shown-selected");
}


/**
 * Checks whether moving card to be child of destinationCard is legal.
 * @param {Card} card: card to be moved on top of destinationCard.
 * @param {Card} destinationCard
 * @returns {boolean} whether the move is legal according to Solitaire rules.
 */
function isLegalMove(card, destinationCard) {
    if (destinationCard.color + card.color === 1 &&
        destinationCard.value === 1 + card.value &&
        destinationCard.childCard == null) {
        return true;
    } else if (card.value === 1 + destinationCard.value &&
        card.suit === destinationCard.suit &&
        FOUNDATIONS[destinationCard.suit] === destinationCard.value &&
        card.childCard == null) {
        return true;
    }  else {
        alert("Illegal move!3");
        return false;
    }
}


/**
 * Handles clicks on stacks, moving selectedCard to restart the pile if legal.
 * @param {int} stackId: index of clicked stack.
 */
function stackClicked(stackId) {
    let stack = document.getElementById("Stack" + stackId);
    if (!stack.hasChildNodes() && isCardSelected && selectedCard.value === 13) {
        moveCard(selectedCard.getElement());

        PILES[stackId].addCard(selectedCard);
    }
}

/**
 * Restarts game, called by Reset button.
 */
function restart() {
    location.reload();
}

// Initialize CARDS and shuffle.
let cnt = 0;
SUITS.forEach(suit => {
    for(let i = 1;  i <= 13; i++) {
        CARDS[cnt] = new Card(i, suit);
        CARDS_DICT[suit + i] = CARDS[cnt];
        cnt++;
    }
});
shuffle(CARDS);

// Create Piles according to required card layout.
let stack;
for(let stackIndex = 0; stackIndex < 7; stackIndex++) {
    stack = [];
    for (let j = 0; j <= stackIndex; j++) {
        stack[j] = CARDS.pop();
    }
    PILES[stackIndex] = new Pile(stack, stackIndex);
}
