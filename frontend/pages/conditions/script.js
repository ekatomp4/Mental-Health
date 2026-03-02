const cardContainer = document.getElementById("cardContainer");
const CARD_LIST = {
    AnxietyDisorders: {
        title: "Anxiety Disorders",
        description: `
Anxiety disorders are characterized by persistent and excessive fear, worry, or
apprehension that interferes with daily functioning.

They often involve heightened physiological arousal such as rapid heart rate,
muscle tension, shortness of breath, and restlessness, alongside cognitive
patterns like catastrophic thinking, hypervigilance, and intolerance of
uncertainty.

Symptoms may be situational or generalized and can fluctuate in intensity over
time depending on stressors, environment, and coping capacity.
        `.trim(),
    },

    DepressiveDisorders: {
        title: "Depressive Disorders",
        description: `
Depressive disorders involve persistent low mood, emotional numbness, or a loss
of interest or pleasure in activities that were once meaningful.

They commonly affect sleep, appetite, energy levels, concentration, and
self-esteem, often producing feelings of hopelessness, guilt, or worthlessness.

These disorders may be episodic or chronic and arise from a complex interaction
between biological vulnerability, life events, and environmental stress.
        `.trim(),
    },

    BipolarDisorders: {
        title: "Bipolar Disorders",
        description: `
Bipolar disorders are mood disorders defined by alternating periods of elevated
or irritable mood and periods of depression.

Manic or hypomanic episodes may involve increased energy, reduced need for sleep,
impulsivity, racing thoughts, and inflated self-confidence, while depressive
episodes mirror major depressive symptoms.

Mood shifts can be abrupt or gradual and may significantly disrupt relationships,
work, and long-term life stability.
        `.trim(),
    },

    ObsessiveCompulsiveDisorders: {
        title: "Obsessive-Compulsive Disorders",
        description: `
Obsessive-compulsive disorders are characterized by intrusive, unwanted thoughts
or urges paired with repetitive behaviors or mental rituals performed to reduce
distress.

These compulsions often provide only temporary relief and can become rigid,
time-consuming, and disruptive to daily functioning.

The disorder is maintained through anxiety-reduction cycles and distorted threat
appraisal rather than logical reasoning.
        `.trim(),
    },

    TraumaAndStressorRelatedDisorders: {
        title: "Trauma and Stressor-Related Disorders",
        description: `
These disorders arise following exposure to traumatic or highly stressful events
such as violence, disaster, abuse, or prolonged adversity.

Symptoms may include intrusive memories, avoidance behaviors, emotional
numbing, hyperarousal, and negative changes in self-concept or worldview.

The impact of trauma can be acute or delayed and may affect emotional regulation,
identity, and interpersonal relationships.
        `.trim(),
    },

    SchizophreniaSpectrumDisorders: {
        title: "Schizophrenia Spectrum Disorders",
        description: `
Schizophrenia spectrum disorders involve disruptions in perception, thought,
emotion, and behavior.

Symptoms may include hallucinations, delusions, disorganized thinking, flattened
affect, and impaired functioning across social and occupational domains.

These disorders often emerge in late adolescence or early adulthood and can vary
widely in severity and course.
        `.trim(),
    },

    PersonalityDisorders: {
        title: "Personality Disorders",
        description: `
Personality disorders are characterized by enduring patterns of inner experience
and behavior that deviate from cultural expectations.

These patterns are inflexible, pervasive, and typically lead to distress or
impairment in interpersonal relationships and self-functioning.

They often involve difficulties with emotional regulation, impulse control,
identity stability, and empathy.
        `.trim(),
    },

    NeurodevelopmentalDisorders: {
        title: "Neurodevelopmental Disorders",
        description: `
Neurodevelopmental disorders originate during early development and affect
cognitive, emotional, or behavioral functioning.

They may involve challenges in learning, communication, attention, impulse
control, or social interaction.

Symptoms often persist into adulthood and vary in expression depending on
environmental supports and individual adaptation.
        `.trim(),
    },

    EatingDisorders: {
        title: "Eating Disorders",
        description: `
Eating disorders involve persistent disturbances in eating behavior and body
image perception.

They may include restrictive intake, binge eating, purging behaviors, or intense
fear of weight gain accompanied by distorted self-evaluation.

These disorders can have severe physical and psychological consequences and are
often intertwined with control, self-worth, and emotional regulation.
        `.trim(),
    },

    SubstanceUseDisorders: {
        title: "Substance Use Disorders",
        description: `
Substance use disorders involve the compulsive use of substances despite harmful
consequences.

They affect brain reward systems, decision-making, impulse control, and emotional
regulation, often leading to tolerance, withdrawal, and loss of control.

Environmental factors, genetic vulnerability, and psychological stress all
contribute to development and persistence.
        `.trim(),
    },

    SleepWakeDisorders: {
        title: "Sleep-Wake Disorders",
        description: `
Sleep-wake disorders involve persistent disruptions in sleep quality, timing, or
duration.

They can lead to daytime fatigue, impaired cognition, emotional dysregulation,
and reduced overall functioning.

These disorders may be primary or secondary to other medical or mental health
conditions.
        `.trim(),
    },

    DissociativeDisorders: {
        title: "Dissociative Disorders",
        description: `
Dissociative disorders involve disruptions in consciousness, memory, identity, or
perception.

They often develop as coping responses to overwhelming or traumatic experiences
and may include depersonalization, derealization, or identity fragmentation.

Symptoms can range from mild detachment to profound disruptions in self-continuity.
        `.trim(),
    },

    SomaticSymptomDisorders: {
        title: "Somatic Symptom Disorders",
        description: `
Somatic symptom disorders are characterized by excessive focus on physical
symptoms that cause distress or impairment.

Symptoms may not be fully explained by medical findings and are often accompanied
by heightened health anxiety and frequent medical consultation.

The distress experienced is real and driven by psychological and neurological
processes.
        `.trim(),
    },

    ImpulseControlDisorders: {
        title: "Impulse Control Disorders",
        description: `
Impulse control disorders involve difficulty resisting urges that are harmful to
oneself or others.

These behaviors are often preceded by tension and followed by relief or guilt,
reinforcing the cycle.

They may be associated with emotional dysregulation and impaired decision-making.
        `.trim(),
    },

    SexualAndGenderRelatedConditions: {
        title: "Sexual and Gender-Related Conditions",
        description: `
These conditions involve distress related to sexual functioning, sexual behavior,
or gender identity.

They may affect self-concept, relationships, and emotional well-being and are
strongly influenced by social, cultural, and psychological factors.

Not all variations represent pathology; distress and impairment are key factors.
        `.trim(),
    },

    CognitiveDisorders: {
        title: "Cognitive Disorders",
        description: `
Cognitive disorders involve impairment in memory, attention, language, or
executive functioning.

They may be acute or progressive and are often associated with neurological
conditions, injury, or aging.

These impairments can significantly impact independence and quality of life.
        `.trim(),
    },

    AdjustmentDisorders: {
        title: "Adjustment Disorders",
        description: `
Adjustment disorders occur in response to identifiable stressors and involve
emotional or behavioral symptoms that exceed expected reactions.

Symptoms may include anxiety, depression, or conduct disturbances and typically
resolve once the stressor is addressed.

They represent maladaptive coping rather than long-term psychopathology.
        `.trim(),
    },

    BehavioralAddictions: {
        title: "Behavioral Addictions",
        description: `
Behavioral addictions involve compulsive engagement in rewarding behaviors despite
negative consequences.

Examples include gambling, gaming, and compulsive internet use.

These behaviors activate similar neural pathways to substance addictions and can
significantly impair functioning.
        `.trim(),
    },

    MoodRegulationDisorders: {
        title: "Mood Regulation Disorders",
        description: `
Mood regulation disorders involve chronic difficulty managing emotional intensity
and stability.

They may include rapid mood shifts, heightened emotional sensitivity, and delayed
return to baseline.

These difficulties often impact relationships and stress tolerance.
        `.trim(),
    },

    PsychosocialStressConditions: {
        title: "Psychosocial Stress Conditions",
        description: `
These conditions arise from prolonged exposure to social, economic, or relational
stressors.

They may not meet criteria for specific diagnoses but still produce significant
emotional distress and functional impairment.

Chronic stress can compound vulnerability to other mental health disorders.
        `.trim(),
    },
};


let isOverlayActive = false;

function LearnMore(name) {
  const overlay = document.getElementById("cardOverlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const card = CARD_LIST[name];

  if (!card) return;

  overlayTitle.textContent = card.title;
  overlayText.textContent = card.description;

  overlay.classList.add("active");
  overlay.classList.remove("d-none");
  isOverlayActive = true;
}

// Close overlay function
function closeOverlay() {
  const overlay = document.getElementById("cardOverlay");
  overlay.classList.remove("active");
  isOverlayActive = false;

  setTimeout(() => {
    if (!isOverlayActive) overlay.classList.add("d-none");
  }, 300);
}
window.closeOverlay = closeOverlay;
// Clicking outside the card closes overlay
document.getElementById("cardOverlay").addEventListener("click", (e) => {
  const card = e.currentTarget.querySelector(".card");
  if (!card.contains(e.target)) closeOverlay();
});

// Optional: Escape key closes overlay
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOverlayActive) closeOverlay();
});

window.LearnMore = LearnMore;



const cardTemplate = document.getElementById("cardTemplate").innerHTML;

function loadCards() {
    Object.keys(CARD_LIST).forEach((cardName) => {
        const card = CARD_LIST[cardName];
        const cardElement = document.createElement("div");
        cardElement.innerHTML = cardTemplate.replaceAll("[[title]]", card.title).replaceAll("[[text]]", card.description).replaceAll("[[key]]", cardName);
        cardContainer.appendChild(cardElement);
    });
}

loadCards();    