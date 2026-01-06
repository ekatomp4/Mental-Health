const cardContainer = document.getElementById("cardContainer");

const CARD_LIST = {
    AnxietyDisorders: {
        title: "Anxiety Disorders",
        description:
            "Anxiety disorders are a type of mental health condition characterized by feelings of worry, nervousness, and fear that are persistent and overwhelming.",
    },
    DepressiveDisorders: {
        title: "Depressive Disorders",
        description:
            "Depressive disorders are a type of mental health condition characterized by feelings of sadness, hopelessness, and a lack of interest in activities.",
    },
    BipolarDisorders: {
        title: "Bipolar Disorders",
        description:
            "Bipolar disorders are a type of mental health condition characterized by extreme mood swings that can range from manic highs to depressive lows.",
    },
    ObsessiveCompulsiveDisorders: {
        title: "Obsessive-Compulsive Disorders",
        description:
            "Obsessive-compulsive disorders are a type of mental health condition characterized by recurring and intrusive thoughts, urges, or compulsions that cause anxiety or distress.",
    },
    PostTraumaticStressDisorders: {
        title: "Post-Traumatic Stress Disorders",
        description:
            "Post-traumatic stress disorders are a type of mental health condition that can occur after a person experiences a traumatic event, such as a natural disaster, a serious accident, or a violent crime.",
    },
    Schizophrenia: {
        title: "Schizophrenia",
        description:
            "Schizophrenia is a type of mental health condition characterized by hallucinations, delusions, and disorganized thinking and behavior.",
    },
};

function LearnMore(name) {
    console.log(name);
}

const cardTemplate = document.getElementById("cardTemplate").innerHTML;

function loadCards() {
    Object.keys(CARD_LIST).forEach((cardName) => {
        const card = CARD_LIST[cardName];
        const cardElement = document.createElement("div");
        cardElement.innerHTML = cardTemplate.replaceAll("[[title]]", card.title).replaceAll("[[text]]", card.description);
        cardContainer.appendChild(cardElement);
    });
}

loadCards();