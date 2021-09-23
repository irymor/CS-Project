class Card {
    childCard;
    element;
    pile;
    constructor(value, suit, visible=false) {
        console.log("Card constructor");
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

    setVisible() {
        this.visible = true;
        console.log("setting visible:");
        console.log(this);
        document.getElementById(this.id + "Image").src = this.image;
    }

    createCardElement() {
        var card = document.createElement("div");
        card.className = "card";
        card.id = this.id;
        var img = document.createElement("img");
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

    getImageElement() {
        return this.getElement().firstChild;
    }

    getElement() {
        return this.element;
    }

    addChild(otherCard) {
        console.log("adding");
        this.childCard = otherCard;

        otherCard.getElement().classList.add("card-stack2");
        this.getElement().appendChild(otherCard.getElement());
        otherCard.pile = this.pile;

        console.log("added");
    }

}

class Pile {
    constructor(cards, stackIndex) {
        this.cards = cards;
        this.size = 0;
        this.first = cards[0];
        this.last = cards[cards.length-1];
        this.id = "Stack" + stackIndex;
        console.log(stackIndex);
        this.cards.forEach(card => {
            card.pile = this;
            this.initialAddCard(card, this.size);
            this.size++;
        });
        this.setLastVisible();
    }

    isLegal(card) {
        if (this.last.color + card.color === 1 &&
            this.last.value === 1 + card.value) {
            return true;
        } else {
            console.log("Illegal: "); console.log(card);
            alert("Illegal move!");
            return false;
        }
    }

    addCard(card) {
        if (this.size === 0) {
            this.getElement().appendChild(card.getElement());
            card.getElement().classList.remove("card-stack2");
            card.getElement().classList.add("card-stack");
            card.pile = this;
        } else {
            this.last.addChild(card);
        }
        console.log(this.cards);
        this.cards.push(card);
        this.size++;
        this.last = card;

        if (card.childCard != null) {
            this.addCard(card.childCard);
        }

        return true;
    }

    removeCard(card) {
        if (this.size === 1) {
            this.size = 0;
            this.cards.pop();
        } else if (this.size <= 0) {
            console.log("removeCard error");
        } else {
            this.size--;
            var index = this.cards.indexOf(card);
            console.log(index);
            if (index > -1) this.cards.splice(index, 1);

            if (index > 0) {
                this.cards[index-1].childCard = null;
                this.last = this.cards[index-1];
            } else {
                this.last = null;
            }

            console.log("removing: ");
            console.log(card);
            if (card.childCard != null) this.removeCard(card.childCard);
        }
    }

    initialAddCard(card, index) {
        if (index === 0) {
            this.getElement().appendChild(card.element);
            document.getElementById(card.id).classList.add("card-stack");
        } else {
            this.cards[index-1].addChild(card);
        }
    }

    getElement() {
        return document.getElementById(this.id);
    }

    setLastVisible() {
        if (this.last != null) this.last.setVisible();
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function setShownCard(newOpenCard) {
    let shownDiv = document.getElementById("ShownCardDiv");
    if (newOpenCard == null) {

        return;
    }

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

function openCard(){
    console.log("opening card");
    console.log(isCardSelected);
    deselect();

    let newOpenCard = CARDS.pop();
    setShownCard(newOpenCard);
    OPEN_CARDS.push(newOpenCard);
    document.getElementById("counter").innerText = "Left in pile: " + CARDS.length;

    if (CARDS.length === 0) {
        document.getElementById("PileCards").removeChild(document.getElementById("PileFlipped"));
    }
}

function shownCardClicked(cardElement) {
    console.log(isCardSelected);
    console.log("shown card clicked " + cardElement.id);
    let cardObject = getCardObject(cardElement.id);
    console.log(cardObject);
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

function getCardObject(id) {
    return CARDS_DICT[id];
}

function removeClassFromAll(className) {
    let elements = document.getElementsByClassName(className);
    for(let i = 0; i < elements.length; i++) {
        elements[i].classList.remove(className);
    }
}

function cardClicked(cardElement) {
    console.log("clicked " + cardElement.id);
    let cardObject = getCardObject(cardElement.id);
    console.log(cardObject);
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

function moveCard(cardElement, toFoundation=false) {
    console.log("moveCard"); console.log(cardElement);
    let cardObject = getCardObject(cardElement.id);
    selectedCard.getElement().classList.remove("selected");
    removeClassFromAll("shown-selected");

    let selectedElement = selectedCard.getElement();
    if (toFoundation) {
        selectedCard.getImageElement().onclick = function() {};
    } else {
        selectedCard.getImageElement().onclick = function() {cardClicked(selectedElement)};
    }
    console.log(selectedCard.getImageElement().onclick);

    if (selectedCard === OPEN_CARDS[OPEN_CARDS.length-1]) {
        OPEN_CARDS.pop();

        setShownCard(OPEN_CARDS[OPEN_CARDS.length-1]);
    } else {
        let oldPile = selectedCard.pile;
        oldPile.removeCard(selectedCard);
        console.log("last"); console.log(oldPile.last);
        oldPile.setLastVisible();
    }
    isCardSelected = false;
}

function FoundationClicked(suit) {
    if (!isCardSelected || selectedCard.suit !== suit || FOUNDATIONS[suit] + 1 !== selectedCard.value) {
        alert("Illegal move");
        console.log(!isCardSelected, selectedCard.suit !== suit, FOUNDATIONS[suit] + 1 !== selectedCard.value);
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

function deselect() {
    isCardSelected = false;
    selectedCard = null;
    removeClassFromAll("selected");
    removeClassFromAll("shown-selected");
}

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
        console.log("Illegal: "); console.log(card);
        console.log("destinationCard: "); console.log(destinationCard);
        alert("Illegal move!3");
        return false;
    }
}

function stackClicked(stackId) {
    console.log("stack clicked: " + stackId);
    let stack = document.getElementById("Stack" + stackId);
    if (!stack.hasChildNodes() && isCardSelected && selectedCard.value === 13) {
        console.log("stack clicked moving "); console.log(selectedCard);
        moveCard(selectedCard.getElement());

        console.log("stack clicked adding to pile:"); console.log(PILES[stackId]);
        PILES[stackId].addCard(selectedCard);
    }
}

let isCardSelected = false;
let selectedCard = new Card(0, 0);

const OPEN_CARDS = [];
const CARDS = [];
const SUITS = ["Club", "Diamond", "Heart", "Spade"];
const CARDS_DICT = {};
const FOUNDATIONS = {
    "Club": 0,
    "Diamond": 0,
    "Heart": 0,
    "Spade": 0
};


let cnt = 0;
SUITS.forEach(suit => {
    for(let i = 1;  i <= 13; i++) {
        CARDS[cnt] = new Card(i, suit);
        CARDS_DICT[suit + i] = CARDS[cnt];
        cnt++;
    }
});
shuffle(CARDS);
console.log(CARDS);

const STACKS = [];
for(let stackIndex = 0; stackIndex < 7; stackIndex++) {
    STACKS[stackIndex] = [];
    for (let j = 0; j <= stackIndex; j++) {
        STACKS[stackIndex][j] = CARDS.pop();
        console.log(STACKS[stackIndex][j]);
    }

}
console.log(STACKS);

const PILES = [];
for(let i = 0; i < 7; i++) {
    PILES[i] = new Pile(STACKS[i], i);
}
