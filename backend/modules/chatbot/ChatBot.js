import * as lancedb from "@lancedb/lancedb";
import Config from "../../constants/Config";
// ─── VectorDB ────────────────────────────────────────────────────────────────

class VectorDB {
	static textToVector(text, size = 100) {
		if (!text) {
			return Array(size).fill(0);
		}

		const chars = text
			.toLowerCase()
			.replace(/[^\w\s]/g, "")
			.split("");

		let vector = chars.map((c) => c.charCodeAt(0));

		// Fixed scale (127) so distances are comparable across all strings
		vector = vector.map((v) => v / 127);

		if (vector.length < size) {
			vector = vector.concat(Array(size - vector.length).fill(0));
		} else if (vector.length > size) {
			vector = vector.slice(0, size);
		}

		return vector;
	}
}

// ─── DB Setup ─────────────────────────────────────────────────────────────────

const db = await lancedb.connect("data/chatbot");

// Vectors are computed lazily at the bottom via .map() so VectorDB is ready
const SEED_DATA_RAW = [
	// ── Greetings & Small Talk ────────────────────────────────────────────────
	{ id: 1, text: "Hello", response: "Hey there! 🐼 I'm Bean, your MentalPanda companion. Whether you need info about our site or just someone to talk to, I'm here. How can I help?" },
	{ id: 2, text: "Hi", response: "Hi! I'm Bean the panda 🐼 — here to help you navigate MentalPanda and support your mental wellness journey. What's on your mind?" },
	{ id: 3, text: "Hey", response: "Hey! Welcome to MentalPanda 🐼. Feel free to ask me anything about our site, mental health resources, or just chat." },
	{ id: 4, text: "Bye", response: "Take care of yourself! 🐼 Remember — it's okay to not be okay. Come back anytime. Goodbye!" },
	{ id: 5, text: "Goodbye", response: "Goodbye! 🐼 You're not alone — MentalPanda is always here when you need us. Stay well!" },
	{ id: 6, text: "How are you?", response: "I'm doing great, thanks for asking! 🐼 More importantly, how are YOU doing today?" },
	{ id: 7, text: "What is your name?", response: "I'm Bean — MentalPanda's friendly panda chatbot! 🐼 I'm here to help you find resources, learn about mental health, and navigate our site." },
	{ id: 8, text: "Who are you?", response: "I'm Bean, a panda 🐼 and your guide on MentalPanda! I can help you find therapists, learn about mental health conditions, read blogs, and more." },
	{ id: 9, text: "Thank you", response: "You're so welcome! 🐼 That's what I'm here for. Don't hesitate to reach out anytime." },
	{ id: 10, text: "Thanks", response: "Anytime! 🐼 Take care of yourself — you matter." },
	{ id: 11, text: "What can you do?", response: "I can help you navigate MentalPanda, explain mental health conditions, point you to therapists, share blog resources, answer crisis questions, and just chat. Ask me anything! 🐼" },

	// ── About MentalPanda ─────────────────────────────────────────────────────
	{ id: 12, text: "What is MentalPanda?", response: "MentalPanda (mentalpanda.xotic.org) is a free mental health awareness platform built by a team of four students — Denny, Mack, Jacob, and Evan. Our goal is to make mental health resources accessible and reduce stigma." },
	{ id: 13, text: "What does this site do?", response: "MentalPanda provides mental health education, blog articles, condition breakdowns, a therapist finder, crisis resources, and a chatbot (that's me, Bean! 🐼). We want to be your first stop on the path to feeling better." },
	{ id: 14, text: "Is this site free?", response: "Yes! MentalPanda is completely free to use. All resources — blogs, conditions info, therapist finder, and chat — are available at no cost." },
	{ id: 15, text: "Who made MentalPanda?", response: "MentalPanda was created by four teammates: Denny, Mack, Jacob, and Evan. It's a student-built project dedicated to mental health awareness and accessibility." },
	{ id: 16, text: "Who built this website?", response: "This site was built by Denny, Mack, Jacob, and Evan — a team of four passionate developers committed to making mental health support more accessible." },

	// ── Team ──────────────────────────────────────────────────────────────────
	{ id: 17, text: "Who is Denny?", response: "Denny is one of the four co-creators of MentalPanda. Together with Mack, Jacob, and Evan, Denny helped build this platform to promote mental health awareness." },
	{ id: 18, text: "Who is Mack?", response: "Mack is a co-creator of MentalPanda, working alongside Denny, Jacob, and Evan to bring this mental health resource platform to life." },
	{ id: 19, text: "Who is Jacob?", response: "Jacob is one of the four team members behind MentalPanda, collaborating with Denny, Mack, and Evan to build a meaningful mental health awareness site." },
	{ id: 20, text: "Who is Evan?", response: "Evan is a co-creator of MentalPanda. He and the rest of the team — Denny, Mack, and Jacob — built this site to help people access mental health resources." },
	{ id: 21, text: "How many people are on the team?", response: "The MentalPanda team has 4 members: Denny, Mack, Jacob, and Evan. They built this entire platform together." },
	{ id: 22, text: "Who is the team?", response: "The MentalPanda team is made up of four people: Denny, Mack, Jacob, and Evan. A small but mighty group dedicated to mental health awareness! 🐼" },

	// ── Home Page ─────────────────────────────────────────────────────────────
	{ id: 23, text: "What is on the home page?", response: "The home page features a chatbot (hi, that's me! 🐼), a quick link to book an appointment via Calendly, a mental health reminder quote, and crisis support info including the 988 Suicide & Crisis Lifeline." },
	{ id: 24, text: "How do I book an appointment?", response: "You can book an appointment through our Calendly link on the home page at mentalpanda.xotic.org. Look for the 'Book Appointment' quick link!" },
	{ id: 25, text: "What is the 988 lifeline?", response: "988 is the Suicide & Crisis Lifeline — available 24/7. Call or text 988 to reach a trained counselor. It's free, confidential, and always available. If you're in crisis right now, please reach out to them." },
	{ id: 26, text: "I am in crisis", response: "I'm really glad you reached out. 💙 Please call or text 988 (Suicide & Crisis Lifeline) right now — they're available 24/7 and trained to help. You are not alone." },
	{ id: 27, text: "I need help right now", response: "You've come to the right place. 🐼 For immediate support, please call or text 988 (Crisis Lifeline, 24/7). For therapy, check our Find Therapists page. I'm also here to listen — what's going on?" },

	// ── About Page ────────────────────────────────────────────────────────────
	{ id: 28, text: "Tell me about the about page", response: "The About page shares the story of MentalPanda — our mission, why we built it, and info about the four team members: Denny, Mack, Jacob, and Evan." },
	{ id: 29, text: "What is the mission of MentalPanda?", response: "Our mission is to reduce the stigma around mental health, provide accessible educational resources, and connect people with the support they need — all in one place, for free." },
	{ id: 30, text: "Why was MentalPanda created?", response: "MentalPanda was created because mental health resources can be hard to find and stigma is still a huge barrier. Denny, Mack, Jacob, and Evan wanted to build a friendly, accessible platform to change that." },

	// ── Blogs Page ────────────────────────────────────────────────────────────
	{ id: 31, text: "What is the blogs page?", response: "The Blogs page features articles on mental health topics — coping strategies, self-care tips, condition spotlights, and awareness content. Head to mentalpanda.xotic.org and click Blogs to explore!" },
	{ id: 32, text: "Where can I read articles?", response: "Check out the Blogs page on MentalPanda for articles on mental health, wellness tips, coping strategies, and more." },
	{ id: 33, text: "Do you have blog posts?", response: "Yes! Our Blogs page has articles covering a wide range of mental health topics. Navigate to the Blogs section at mentalpanda.xotic.org." },
	{ id: 34, text: "What topics are on the blog?", response: "Our blog covers mental health awareness, coping mechanisms, self-care routines, stress management, anxiety, depression, relationships, and more." },

	// ── Conditions Page ───────────────────────────────────────────────────────
	{ id: 35, text: "What is the conditions page?", response: "The Conditions page breaks down various mental health conditions — symptoms, causes, and treatment options — in a clear, judgment-free way. A great place to start learning about what you or someone you know might be experiencing." },
	{ id: 36, text: "What mental health conditions do you cover?", response: "MentalPanda covers anxiety, depression, PTSD, bipolar disorder, OCD, ADHD, eating disorders, schizophrenia, and more. Each condition page explains symptoms, causes, and how to get help." },
	{ id: 37, text: "Tell me about anxiety", response: "Anxiety involves persistent worry, fear, or nervousness that interferes with daily life. It's one of the most common mental health conditions — and very treatable. See our Conditions page for a full breakdown." },
	{ id: 38, text: "Tell me about depression", response: "Depression is more than feeling sad — it's a medical condition involving persistent low mood, loss of interest, fatigue, and more. MentalPanda's Conditions page has detailed info, and Find Therapists can connect you with support." },
	{ id: 39, text: "What is PTSD?", response: "PTSD (Post-Traumatic Stress Disorder) develops after a traumatic experience. Symptoms include flashbacks, nightmares, and severe anxiety. Our Conditions page has more info, and therapy can make a real difference." },
	{ id: 40, text: "What is bipolar disorder?", response: "Bipolar disorder involves extreme mood swings — from manic highs to depressive lows. It's manageable with the right treatment. Visit our Conditions page to learn more." },
	{ id: 41, text: "What is OCD?", response: "OCD (Obsessive-Compulsive Disorder) involves unwanted recurring thoughts (obsessions) and repetitive behaviors (compulsions). It's very treatable — check our Conditions page for details." },
	{ id: 42, text: "What is ADHD?", response: "ADHD affects focus, impulse control, and activity levels. It's common in both children and adults and very manageable. Learn more on MentalPanda's Conditions page." },
	{ id: 43, text: "What are eating disorders?", response: "Eating disorders like anorexia, bulimia, and binge-eating disorder involve unhealthy relationships with food. They're serious but treatable — see our Conditions page and please reach out for professional support." },
	{ id: 44, text: "What is schizophrenia?", response: "Schizophrenia affects how a person thinks, feels, and behaves. Early treatment makes a significant difference. Visit our Conditions page to learn more." },
	{ id: 45, text: "What is borderline personality disorder?", response: "BPD involves intense mood swings, unstable relationships, and a fragile self-image. With therapy (especially DBT), people with BPD can thrive. Our Conditions page has more details." },
	{ id: 46, text: "What is social anxiety?", response: "Social anxiety is an intense fear of social situations and being judged by others. It's more than shyness — and very treatable with therapy and sometimes medication. See our Conditions page for more." },
	{ id: 47, text: "What is a panic attack?", response: "A panic attack is a sudden surge of intense fear with physical symptoms — racing heart, sweating, shortness of breath. They're frightening but not dangerous. Our Conditions page and a therapist can help you manage them." },

	// ── Find Therapists Page ──────────────────────────────────────────────────
	{ id: 48, text: "How do I find a therapist?", response: "MentalPanda has a dedicated Find Therapists page! Search for licensed therapists in your area at mentalpanda.xotic.org — click 'Find Therapists' to get started." },
	{ id: 49, text: "Where can I find a therapist?", response: "Use our Find Therapists page at MentalPanda to search for mental health professionals near you. You can also book an appointment via the Calendly link on the home page." },
	{ id: 50, text: "I want to see a therapist", response: "That's a brave and important step! 🐼 Visit our Find Therapists page to find licensed mental health professionals near you. You've got this!" },
	{ id: 51, text: "Is therapy worth it?", response: "Yes — research consistently shows therapy is effective for a wide range of challenges. It gives you tools, perspective, and support. Our Find Therapists page can help you connect with someone today." },
	{ id: 52, text: "How much does therapy cost?", response: "Therapy costs vary. Many therapists offer sliding-scale fees, and some accept insurance. Our Find Therapists page can help you find someone who fits your budget and needs." },
	{ id: 53, text: "What types of therapy are there?", response: "Common types include CBT (Cognitive Behavioral Therapy), DBT, talk therapy, EMDR for trauma, and more. A therapist on our Find Therapists page can help determine what's right for you." },
	{ id: 54, text: "Can I do online therapy?", response: "Yes! Many therapists now offer telehealth sessions online. Check our Find Therapists page for options that may include virtual appointments." },

	// ── Crisis & Emotional Support ────────────────────────────────────────────
	{ id: 55, text: "I feel like hurting myself", response: "Please know you're not alone, and I care about you. 💙 Please reach out to the 988 Suicide & Crisis Lifeline right now — call or text 988, available 24/7. They will listen without judgment." },
	{ id: 56, text: "I want to die", response: "I hear you, and I'm really glad you're here. 💙 Please call or text 988 right now — it's the Suicide & Crisis Lifeline, free and 24/7. You deserve support. Please reach out to them." },
	{ id: 57, text: "I feel hopeless", response: "Feeling hopeless is painful, but it can get better with support. 💙 Please consider calling 988 or visiting our Find Therapists page. You don't have to carry this alone." },
	{ id: 58, text: "I feel alone", response: "You're not alone — MentalPanda is here. 🐼 Talking to a therapist can help enormously. Check our Find Therapists page, or call 988 for immediate support." },
	{ id: 59, text: "I am stressed", response: "Stress is really tough. 💙 Try deep breathing, a short walk, or journaling. If stress is overwhelming, our Find Therapists page can connect you with someone who can help." },
	{ id: 60, text: "I have anxiety", response: "Anxiety is very common and treatable. 🐼 Grounding techniques, breathing exercises, and therapy all help. Check our Conditions page to learn more and Find Therapists to get support." },
	{ id: 61, text: "I feel depressed", response: "I'm sorry you're feeling this way — it's real, and it matters. 💙 Depression is treatable. Visit our Conditions page and our Find Therapists page. You deserve to feel better." },
	{ id: 62, text: "What should I do if I'm struggling?", response: "Reaching out is already a brave step. 🐼 Try: 1) Check our Conditions page to understand what you're feeling. 2) Visit Find Therapists to connect with a pro. 3) Call/text 988 for immediate help." },
	{ id: 63, text: "How do I help a friend with mental health?", response: "Listen without judgment, validate their feelings, and gently encourage them to seek help. Share MentalPanda's resources — our Conditions page and Find Therapists page are great starting points." },
	{ id: 64, text: "I don't know if I need therapy", response: "If you're struggling with daily life, relationships, mood, or just feel 'off', therapy can help. You don't need to be in crisis to benefit from it. Our Find Therapists page makes it easy to take that first step. 🐼" },

	// ── Site Navigation ───────────────────────────────────────────────────────
	{ id: 65, text: "What pages are on this site?", response: "MentalPanda has 6 main pages: Home, About, Blogs, Conditions, Find Therapists, and Chat (you're here!). Each is designed to support your mental health journey in a different way." },
	{ id: 66, text: "How do I navigate the site?", response: "Use the navigation menu to visit: Home, About, Blogs, Conditions, Find Therapists, and Chat. Everything is at mentalpanda.xotic.org!" },
	{ id: 67, text: "What is the website URL?", response: "Find us at mentalpanda.xotic.org — bookmark it for easy access to mental health resources anytime! 🐼" },

	// ── Mental Health General ─────────────────────────────────────────────────
	{ id: 68, text: "What is mental health?", response: "Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act — and it's just as important as physical health. MentalPanda is here to help!" },
	{ id: 69, text: "Why is mental health important?", response: "Mental health affects every aspect of life — relationships, work, physical health, and happiness. Taking care of it isn't a luxury; it's essential. That's why MentalPanda exists! 🐼" },
	{ id: 70, text: "How can I improve my mental health?", response: "Evidence-backed ways: regular exercise, quality sleep, healthy eating, social connection, mindfulness, and therapy. Check our Blogs page for detailed tips and our Find Therapists page for professional support!" },
	{ id: 71, text: "What is self-care?", response: "Self-care means intentionally doing things that protect and improve your wellbeing — sleep, social time, hobbies, rest. Our Blogs page has lots of self-care ideas! 🐼" },
	{ id: 72, text: "How do I deal with stress?", response: "Try deep breathing, exercise, journaling, or meditation. If stress is chronic, a therapist can help build long-term strategies. Check our Find Therapists page!" },
	{ id: 73, text: "What is mindfulness?", response: "Mindfulness is being fully present without judgment. It's proven to reduce anxiety and stress. Start with just 5 minutes of focused breathing — our Blogs page has more on this!" },
	{ id: 74, text: "Is it okay to not be okay?", response: "Absolutely. One of our core beliefs: 'It's okay to not be okay. Asking for help is a sign of strength.' 🐼 Everyone struggles sometimes — what matters is reaching out." },
	{ id: 75, text: "How do I start my mental health journey?", response: "You already have by being here! 🐼 Next steps: explore our Conditions page to understand what you're feeling, read our Blogs for tips, and visit Find Therapists to connect with a professional." },

	// ── Emotions & Feelings ───────────────────────────────────────────────────
	{ id: 76, text: "I am sad", response: "I'm sorry you're feeling sad. 💙 It's okay to feel that way — emotions are valid. If it persists, our Find Therapists page can connect you with someone to talk to. I'm here too." },
	{ id: 77, text: "I am angry", response: "Anger is a valid emotion. 🐼 Try taking some deep breaths or going for a walk. If anger feels uncontrollable, a therapist can help you work through it — check our Find Therapists page." },
	{ id: 78, text: "I feel empty", response: "Feeling empty can be a sign of depression or burnout. 💙 Please don't ignore it — visit our Conditions page to learn more, and our Find Therapists page to get support." },
	{ id: 79, text: "I feel numb", response: "Emotional numbness often comes from overwhelm or trauma. 💙 It's your mind protecting itself, but it's worth exploring with a therapist. Check our Find Therapists page." },
	{ id: 80, text: "I feel overwhelmed", response: "Take a breath — one thing at a time. 🐼 Overwhelm is real and valid. Try breaking things into small steps. If it's too much, our Find Therapists page has professionals ready to help." },
	{ id: 81, text: "I feel worthless", response: "You are not worthless — not even close. 💙 Those feelings are symptoms, not facts. Please reach out to 988 or visit our Find Therapists page. You deserve care and support." },
	{ id: 82, text: "I feel scared", response: "Fear is a natural response, but you don't have to face it alone. 🐼 Talk to someone — our Find Therapists page can help, or call 988 if it feels overwhelming." },
	{ id: 83, text: "I feel guilty", response: "Guilt can be exhausting. 💙 A therapist can help you work through whether it's warranted and how to move forward. Check our Find Therapists page — you deserve relief." },
	{ id: 84, text: "I feel ashamed", response: "Shame thrives in silence. 🐼 Talking to someone — a therapist, a trusted friend — can really help. Visit our Find Therapists page. There's no judgment here." },
	{ id: 85, text: "I feel confused", response: "Confusion about your feelings is very normal. 🐼 Our Conditions page might help you identify what you're experiencing, and a therapist can help make sense of it all." },
	{ id: 86, text: "I feel lost", response: "Feeling lost is one of the hardest things. 💙 But you found your way here, and that's a start. Check our Blogs and Conditions pages, and consider connecting with a therapist." },
	{ id: 87, text: "I feel exhausted", response: "Mental exhaustion is real and serious. 🐼 Rest, reduce your load if possible, and if burnout is hitting hard, a therapist can help. See our Find Therapists page." },
	{ id: 88, text: "I feel hopeful", response: "That's wonderful! 🐼 Hold onto that feeling. Keep exploring MentalPanda's resources to build on it — our Blogs page has great tips for maintaining positive momentum." },
	{ id: 89, text: "I feel happy", response: "Love to hear it! 🐼 Keep nurturing what brings you joy. Mental health isn't just about struggles — it's about building a fulfilling life too." },
	{ id: 90, text: "I feel disconnected", response: "Feeling disconnected from yourself or others can be a sign of dissociation or depression. 💙 Our Conditions page has info, and a therapist can really help — check Find Therapists." },
	{ id: 91, text: "I feel like a burden", response: "You are not a burden. 💙 That thought is a symptom, not a truth. Please reach out to 988 right now — call or text, 24/7. You matter more than you know." },
	{ id: 92, text: "I feel misunderstood", response: "Feeling misunderstood is painful. 🐼 A therapist creates a space where you can be heard without judgment. Visit our Find Therapists page — it can make a real difference." },
	{ id: 93, text: "I feel unmotivated", response: "Low motivation is often tied to depression or burnout. 🐼 Be gentle with yourself. Small steps help — and if it's been going on a while, our Find Therapists page is a great resource." },
	{ id: 94, text: "I can't stop crying", response: "Let it out — crying is okay. 💙 But if it feels uncontrollable or constant, that's worth addressing. Visit our Conditions page or Find Therapists. You don't have to feel this way forever." },
	{ id: 95, text: "I feel paranoid", response: "Paranoia can be very distressing. 💙 Please visit our Conditions page to learn more, and connect with a mental health professional via our Find Therapists page as soon as you can." },
	{ id: 96, text: "I feel like no one cares", response: "I care. 🐼 And there are people who will care — sometimes we just haven't found them yet. Consider talking to a therapist or calling 988. You deserve connection." },

	// ── Sleep & Physical Health ───────────────────────────────────────────────
	{ id: 97, text: "I can't sleep", response: "Sleep problems and mental health are deeply connected. 🐼 Try a consistent bedtime, limit screens before bed, and avoid caffeine late in the day. A therapist or doctor can help if it's ongoing." },
	{ id: 98, text: "I sleep too much", response: "Hypersomnia can be linked to depression. 💙 If you're sleeping excessively and still feel tired or low, check our Conditions page and consider connecting with a therapist." },
	{ id: 99, text: "I have nightmares", response: "Recurring nightmares, especially after trauma, can be a sign of PTSD or anxiety. 💙 Our Conditions page has more info, and therapies like EMDR are very effective. See Find Therapists." },
	{ id: 100, text: "I have no appetite", response: "Loss of appetite is often linked to depression or anxiety. 💙 Try small, easy meals and stay hydrated. If it's been going on more than a week, please talk to a doctor or therapist." },
	{ id: 101, text: "I overeat when stressed", response: "Stress eating is very common. 🐼 It's your brain seeking comfort. Mindfulness and therapy can help break the cycle — check our Find Therapists page and Blogs for tips." },
	{ id: 102, text: "I have panic attacks", response: "Panic attacks are terrifying but not dangerous. 🐼 Grounding techniques (5 things you see, 4 you hear...) can help in the moment. Long term, therapy works wonders — visit Find Therapists." },
	{ id: 103, text: "I feel physical pain from stress", response: "Stress manifests physically — headaches, chest tightness, stomachaches. 💙 Your body is telling you something. Rest, and consider talking to a therapist via our Find Therapists page." },

	// ── Relationships ─────────────────────────────────────────────────────────
	{ id: 104, text: "I am going through a breakup", response: "Breakups are genuinely painful. 💙 Give yourself grace to grieve. Lean on friends, journaling, or a therapist. Our Find Therapists page can connect you with support." },
	{ id: 105, text: "I have relationship problems", response: "Relationship struggles affect mental health deeply. 🐼 Couples therapy or individual therapy can help you gain clarity. Check our Find Therapists page for options." },
	{ id: 106, text: "I feel lonely", response: "Loneliness is one of the most painful human experiences. 💙 You're not alone in feeling alone. Our Find Therapists page and community resources can help you build connection." },
	{ id: 107, text: "My family is stressing me out", response: "Family stress is incredibly common. 🐼 Setting boundaries and talking to a therapist can really help. Visit our Find Therapists page — family or individual therapy are both options." },
	{ id: 108, text: "I am being bullied", response: "Bullying causes real psychological harm. 💙 Please talk to a trusted adult, counselor, or therapist. Our Find Therapists page can help connect you with support. You don't deserve this." },
	{ id: 109, text: "I am in a toxic relationship", response: "Recognizing toxicity is the first step. 💙 Please prioritize your safety and wellbeing. A therapist can help you navigate this — visit our Find Therapists page. You deserve healthy relationships." },
	{ id: 110, text: "I lost someone I love", response: "Grief is one of the most profound human experiences. 💙 There's no right way to grieve. If you need support, grief counselors can help — visit our Find Therapists page. I'm so sorry for your loss." },

	// ── Work & School ─────────────────────────────────────────────────────────
	{ id: 111, text: "I am burned out", response: "Burnout is real and serious. 🐼 Rest is not optional — it's necessary. Set boundaries, take breaks, and if it's severe, a therapist can help you recover. See our Find Therapists page." },
	{ id: 112, text: "I hate my job", response: "Spending most of your waking hours doing something you hate takes a toll. 🐼 A therapist can help you figure out next steps and manage the stress in the meantime. See Find Therapists." },
	{ id: 113, text: "I have school stress", response: "Academic pressure is intense. 🐼 Break tasks into chunks, prioritize sleep, and don't be afraid to ask for help — from teachers, counselors, or therapists. Our Find Therapists page can help." },
	{ id: 114, text: "I have test anxiety", response: "Test anxiety is very common and very treatable. 🐼 Preparation, breathing techniques, and CBT therapy all help. Check our Find Therapists page for therapists who specialize in anxiety." },
	{ id: 115, text: "I failed and feel terrible", response: "Failure is painful, but it doesn't define you. 💙 Every successful person has failed. Be kind to yourself. Our Blogs page has great content on resilience and self-compassion." },
	{ id: 116, text: "I can't focus", response: "Difficulty focusing can stem from anxiety, depression, ADHD, or sleep issues. 🐼 Our Conditions page has more info, and a therapist or doctor can help identify what's going on." },

	// ── Identity & Self ───────────────────────────────────────────────────────
	{ id: 117, text: "I have low self-esteem", response: "Low self-esteem is something therapy can genuinely transform. 💙 CBT is particularly effective. Visit our Find Therapists page — you deserve to feel good about yourself." },
	{ id: 118, text: "I don't know who I am", response: "Identity struggles are deeply human. 🐼 Therapy can be a powerful space to explore who you are. Our Find Therapists page can connect you with someone to guide that journey." },
	{ id: 119, text: "I feel like a failure", response: "That feeling is lying to you. 💙 You are here, trying, and that matters. Therapy can help reframe those thoughts. Check our Find Therapists page — you deserve support." },
	{ id: 120, text: "I compare myself to others", response: "Comparison is the thief of joy — and social media makes it worse. 🐼 Our Blogs page has tips on building self-worth, and a therapist can help you break the comparison habit." },
	{ id: 121, text: "I struggle with body image", response: "Body image struggles affect millions. 💙 They're valid and treatable. Our Conditions page covers eating disorders, and our Find Therapists page can connect you with a specialist." },
	{ id: 122, text: "I don't love myself", response: "Self-love is a practice, not a destination. 🐼 Start small — one kind thought about yourself per day. Therapy helps enormously with this. Visit our Find Therapists page." },

	// ── Coping & Wellness Tips ────────────────────────────────────────────────
	{ id: 123, text: "What are coping strategies?", response: "Healthy coping strategies include: deep breathing, journaling, exercise, talking to someone, grounding techniques, and creative outlets. Our Blogs page has detailed guides on each!" },
	{ id: 124, text: "How do I meditate?", response: "Start simple: sit quietly, close your eyes, and focus on your breath for 5 minutes. When thoughts wander, gently return focus. Apps like Headspace or Calm can guide you. Our Blogs page has more!" },
	{ id: 125, text: "Does exercise help mental health?", response: "Absolutely — exercise is one of the most effective mental health boosters. Even a 20-minute walk releases endorphins and reduces cortisol. Our Blogs page has more on the exercise-mental health connection." },
	{ id: 126, text: "How does sleep affect mental health?", response: "Sleep is foundational to mental health. Poor sleep worsens anxiety, depression, and focus. Aim for 7-9 hours. Our Blogs page has tips for better sleep hygiene." },
	{ id: 127, text: "What is journaling and does it help?", response: "Journaling means writing your thoughts and feelings — it externalizes them, helping you process and gain clarity. Studies show it reduces anxiety and improves mood. Try it for 10 minutes a day!" },
	{ id: 128, text: "What is a grounding technique?", response: "Grounding brings you back to the present during anxiety or dissociation. Try the 5-4-3-2-1 method: name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste." },
	{ id: 129, text: "How do I stop a panic attack?", response: "Try box breathing: inhale 4 seconds, hold 4, exhale 4, hold 4. Remind yourself: 'This will pass. I am safe.' Ground yourself using 5-4-3-2-1. A therapist can teach you more techniques." },
	{ id: 130, text: "What is deep breathing?", response: "Deep breathing activates your parasympathetic nervous system, calming stress. Try: inhale slowly for 4 counts, hold for 4, exhale for 6. Repeat 5 times. It works fast!" },
	{ id: 131, text: "How do I set boundaries?", response: "Boundaries protect your mental health. Start by identifying what drains you, then communicate your needs clearly and calmly. Therapy can help you practice this — see our Find Therapists page." },
	{ id: 132, text: "What is CBT?", response: "Cognitive Behavioral Therapy (CBT) is one of the most research-backed therapies. It helps you identify and reframe negative thought patterns. Many therapists on our Find Therapists page offer CBT." },
	{ id: 133, text: "What is DBT?", response: "Dialectical Behavior Therapy (DBT) focuses on emotional regulation, distress tolerance, and interpersonal skills. It's especially helpful for BPD, self-harm, and intense emotions. See our Find Therapists page." },
	{ id: 134, text: "What is EMDR?", response: "EMDR (Eye Movement Desensitization and Reprocessing) is a therapy for trauma and PTSD. It uses guided eye movements to help process traumatic memories. Very effective — ask about it on our Find Therapists page." },

	// ── Misc / Fun ────────────────────────────────────────────────────────────
	{ id: 135, text: "Tell me a joke", response: "Why did the panda go to therapy? Because it had too many black-and-white thoughts! 🐼😄 But seriously — cognitive distortions are real, and therapy helps. You can learn more on our Conditions page!" },
	{ id: 136, text: "Tell me something positive", response: "You made it through every hard day so far — that's 100% success rate. 🐼 You are stronger than you think, and MentalPanda is rooting for you." },
	{ id: 137, text: "I need motivation", response: "You don't need to feel motivated to take action — sometimes action creates motivation. Start tiny: one deep breath, one sip of water, one small step. 🐼 You've got this." },
	{ id: 138, text: "What is your favorite color?", response: "I'm a panda, so obviously black and white! 🐼 But I hear green is great for mental health — spending time in nature really does improve mood." },
	{ id: 139, text: "Are you a real person?", response: "Nope — I'm Bean, an AI chatbot built into MentalPanda! 🐼 I'm not a substitute for professional help, but I'm here to provide info, resources, and a friendly ear anytime." },
	{ id: 140, text: "Can you diagnose me?", response: "I'm not able to diagnose anything — I'm a chatbot, not a clinician. 🐼 For an accurate assessment, please connect with a licensed professional via our Find Therapists page." },
	{ id: 141, text: "Do you have feelings?", response: "I'm an AI, so not exactly — but I'm designed to care about your wellbeing! 🐼 What I do know is that YOUR feelings are real and valid, and MentalPanda is here for them." },
	{ id: 142, text: "I'm bored", response: "Boredom can actually be good — it sparks creativity! 🐼 Try reading one of our Blog posts, exploring the Conditions page to learn something new, or just chat with me." },
	{ id: 143, text: "What should I do today?", response: "How about: drink some water, take a short walk, read something that interests you, and check in with how you're feeling. 🐼 Small acts of self-care add up!" },
	{ id: 144, text: "I love MentalPanda", response: "We love you too! 🐼💚 Share us with someone who might need it — mentalpanda.xotic.org. The more people we can help, the better." },
	{ id: 145, text: "This site is helpful", response: "That means the world to us! 🐼 Denny, Mack, Jacob, and Evan built this with a lot of heart. Spread the word — mentalpanda.xotic.org!" }
];

const SEED_DATA = SEED_DATA_RAW.map((item) => ({
	...item,
	vector: VectorDB.textToVector(item.text)
}));

// ─── Table Management ─────────────────────────────────────────────────────────

async function getOrCreateTable(db, tableName) {
	let table;
	try {
		table = await db.openTable(tableName);

		// Validate schema — recreate if stale (missing text field)
		const schema = await table.schema();
		const hasTextField = schema.fields.some((f) => f.name === "text");

		if (!hasTextField) {
			console.warn(`Table "${tableName}" has stale schema. Recreating...`);
			await db.dropTable(tableName);
			table = await db.createTable(tableName, SEED_DATA);
			console.log(`Recreated table: ${tableName}`);
		} else {
			console.log(`Loaded existing table: ${tableName}`);
		}
	} catch (err) {
		if (
			err.message.toLowerCase().includes("not found") ||
			err.message.toLowerCase().includes("does not exist")
		) {
			console.log(`Table not found, creating: ${tableName}`);
			table = await db.createTable(tableName, SEED_DATA);
		} else {
			throw err;
		}
	}
	return table;
}

async function addItem(table, text, response) {
	const vector = VectorDB.textToVector(text);
	const id = Date.now();
	await table.add([{ id, vector, text, response }]);
}

async function searchItems(table, text, limit = 5) {
	const vector = VectorDB.textToVector(text);
	return await table.search(vector).limit(limit).toArray();
}

const table = await getOrCreateTable(db, "chatbot");

// ─── Mock AI Fallback ─────────────────────────────────────────────────────────

/**
 * Replace with a real API call (OpenAI, Anthropic, etc.) when ready.
 */
async function fetchAIResponse(message) {
	// ignore the eslint error, i'll fix this later - xotic
	await new Promise((r) => setTimeout(r, 300));
	return `[AI mock] I'm Bean 🐼, and I'm not quite sure about "${message}" — but I'm here to help! Try asking about our Conditions page, Find Therapists, or mental health tips.`;
}

// ─── ChatBot ─────────────────────────────────────────────────────────────────

class ChatBot {
	static prompt = Config.AI_Prompt.trim();

	/**
	 * Distance threshold — below this distance, use cache.
	 * With fixed-scale vectors, distances are more consistent.
	 * Tune this value based on observed results.
	 */
	static DISTANCE_THRESHOLD = 2.5;

	static async respond(message) {
		const results = await searchItems(table, message, 1);

		if (results.length > 0) {
			const best = results[0];
			const distance = best._distance ?? Infinity;

			// console.log(
			//   `VectorDB match: "${best.text}" | distance: ${distance.toFixed(4)}`
			// );

			if (distance <= ChatBot.DISTANCE_THRESHOLD) {
				// console.log("→ Using cached response.");
				return best.response;
			}
		}

		// console.log("→ Distance too high, calling AI...");
		const aiResponse = await fetchAIResponse(message);

		await addItem(table, message, aiResponse);
		console.log("→ Saved AI response to VectorDB.");

		return aiResponse;
	}
}

export { table, addItem, searchItems, VectorDB };
export default ChatBot;

// ─── Example Usage ────────────────────────────────────────────────────────────
// import ChatBot from "./ChatBot.js";
// console.log(await ChatBot.respond("Hi"));
// console.log(await ChatBot.respond("How do I find a therapist?"));
