

class Card {
    childCard;
    element;
    constructor(value, suit) {
        console.log("Card constructor");
        this.value = value;
        this.suit = suit;
        this.visible = false;
        this.image = "Images/Cards/" + this.suit + "/" + this.value + ".png";
        this.id = this.suit + this.value;
        // this.topMargin = 0;
        if (suit === "Heart" || suit === "Diamond") {
            this.color = 0; //Red
        } else {
            this.color = 1; //Black
        }
        this.createCardElement();
    }

    setVisible() {
        this.visible = true;
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
        card.appendChild(img);
        this.element = card;
        return card;
    }

    getElement() {
        return this.element;
    }

    // setTopMargin(margin) {
    //     this.getElement().style = "--top: " + margin + "px";
    // }

    addChild(otherCard) {
        console.log(card);
        console.log(otherCard);
        this.childCard = otherCard;
        // otherCard.setTopMargin(this.topMargin + 30);
        otherCard.getElement().classList.add("card-stack2");
        this.getElement().appendChild(otherCard.getElement());
    }

}

class Pile {
    constructor(cards, stackIndex) {
        this.cards = cards;
        this.len = 0;
        this.first = cards[0];
        this.last = cards[cards.length-1];
        this.id = "Stack" + stackIndex;
        console.log(stackIndex);
        this.cards.forEach(card => {
            this.initialAddCard(card, this.len);
            this.len++;
        });
        this.last.setVisible();
    }

    addCard(card) {
        if (this.cards[this.cards.length-1].color + card.color === 1 &&
            this.cards[this.cards.length-1].value === 1 + card.value) {
            this.cards[this.cards.length-1].getElement().appendChild(card.getElement());
            this.cards.add(card);
            while (card.childCard != null) {
                card = card.childCard;
                this.cards.add(card);
            }
        } else {
            document.alert("Illegal move!")
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
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}



const CARDS = [];
const SUITS = ["Club", "Diamond", "Heart", "Spade"];
let cnt = 0;
SUITS.forEach(suit => {
    for(let i = 1;  i <= 13; i++) {
        CARDS[cnt] = new Card(i, suit);
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
    // STACKS[stackIndex][stackIndex].setVisible();
}
console.log("here");
console.log(STACKS);

const PILES = [];

for(let i = 0; i < 7; i++) {
    PILES[i] = new Pile(STACKS[i], i);
}

var Stack1 = document.getElementById("Stack1");
var card = document.createElement("div");
card.className = "card-stack2";
card.style = "--top: 90px";

// PILES[1].cards[1].addChild()
