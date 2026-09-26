import { Activity, Dumbbell, Footprints, Gauge, Hand, Layers3, Move3d, ShieldCheck, Sparkles, Timer, Trophy, Waves } from "lucide-react";

export const navItems = [
  { label: "The method", href: "#method" },
  { label: "Skill-based fitness", href: "#skill-based-fitness" },
  { label: "Programs", href: "#programs" },
  { label: "ROAR challenge", href: "#roar" },
  { label: "Testimonials & videos", href: "#testimonials" },
  { label: "FAQs", href: "#faqs" },
  { label: "Coach", href: "#coach" },
];

export const stats = [
  { value: "03", label: "rotational tools" },
  { value: "5–12", label: "members per batch" },
  { value: "01 hr", label: "per session" },
  { value: "40+", label: "workshops delivered" },
];

export const methodCards = [
  { index: "01", title: "Indian Clubs", kicker: "Movement + mobility", text: "Controlled circular patterns that build shoulder mobility, scapular control, grip endurance, rhythm, and cross-body coordination.", image: "/images/clubs1.jpg", icon: Waves },
  { index: "02", title: "Mace", kicker: "Load + leverage", text: "Asymmetrical loading that asks the body to manage grip, momentum, balance, stability, and rotational force under control.", image: "/images/mace2.jpeg", icon: Dumbbell },
  { index: "03", title: "Rope Flow", kicker: "Rhythm + athleticism", text: "Continuous movement that develops footwork, timing, spinal rotation, spatial awareness, and multidirectional capacity.", image: "/images/home.jpeg", icon: Footprints },
];

export const programLevels = [
  { label: "Foundation course", number: "01", text: "Movement patterns, mobility, coordination, and mindset. A clear entry point for members who want to move better and build confidence with the tools.", features: ["Tool orientation", "Mobility and posture", "Rhythm and timing", "Safe progressions"] },
  { label: "Advanced course", number: "02", text: "Complex patterns, stronger rotational control, and greater movement variability for members ready to progress their practice.", features: ["Layered combinations", "Rotational strength", "Conditioning blocks", "Flow refinement"] },
  { label: "Integrated program", number: "03", text: "A regular practice blending all three tools. Available to participants who complete both Foundation and Advanced courses.", features: ["All three tools", "Ongoing practice", "Performance tracking", "Active engagement"] },
];

export const benefits = [
  { title: "Movement quality", text: "Natural, circular patterns that make mobility and coordination part of the workout.", icon: Move3d },
  { title: "Rotational strength", text: "Train force transfer, asymmetrical loading, acceleration, and deceleration.", icon: Gauge },
  { title: "Member variety", text: "A skill-based experience for beginners, regular members, and experienced practitioners.", icon: Layers3 },
  { title: "Built to engage", text: "Distinctive tools and measurable challenges create new reasons to keep showing up.", icon: Sparkles },
];

export const pillars = [
  { title: "Rotational strength", text: "Develop spinal strength, torque, and elastic power for everyday movement, resilience, and performance." },
  { title: "Asymmetric loading", text: "Build stabilising strength, grip endurance, and body control while addressing left-right loading differences." },
  { title: "Flow-based movement", text: "Use seamless, rhythmic transitions to improve coordination, mobility, and movement efficiency." },
  { title: "Mind-body connection", text: "Train focus, spatial awareness, timing, anticipation, and cognitive endurance through purposeful movement." },
];

export const skillBenefits = [
  { title: "More engaging", text: "Learning new skills keeps training interesting." },
  { title: "Progressive", text: "There is always another level to work towards." },
  { title: "Multidimensional", text: "Combine strength, mobility, coordination, balance, and control." },
  { title: "Adaptable", text: "Suitable for beginners, fitness enthusiasts, and athletes with appropriate progression." },
  { title: "Complementary", text: "Works alongside conventional gym, strength, and sport-specific training." },
  { title: "Experiential", text: "Turn training into something you learn, practise, and experience." },
];

export const faqs = [
  { question: "What is Mind Body Flow?", answer: "Mind Body Flow is a movement and training system designed to develop mobility, coordination, strength, balance, and movement control through the Rotational Training System." },
  { question: "What is the Rotational Training System?", answer: "RTS is a structured methodology built around the body's ability to rotate, shift, reach, balance, transfer force, and coordinate movement. It progresses from simple patterns towards greater complexity and control." },
  { question: "What are the three tools used in RTS?", answer: "RTS uses Indian Clubs, Mace, and Rope Flow. Each tool creates a different movement experience, while all three work together in the overall system." },
  { question: "Is rotational training suitable for beginners?", answer: "Yes. RTS starts with foundational movements and gradually increases complexity. Training can be adapted to an individual's experience, fitness level, and physical capability." },
  { question: "Do I need to be fit or athletic to start?", answer: "No. You do not need to be an athlete or highly experienced. The program develops movement skills progressively for beginners, fitness enthusiasts, and athletes." },
  { question: "How is RTS different from conventional gym training?", answer: "Conventional training often focuses on strength, conditioning, or specific exercises. RTS adds multidirectional movement, coordination, mobility, rhythm, balance, and rotational control." },
  { question: "Can RTS complement my existing sport or gym routine?", answer: "Yes. RTS is designed to complement existing fitness, strength, and sport-specific training as an additional movement-training component." },
  { question: "How do I get started?", answer: "Register your interest for 1:1 coaching or an upcoming session, then speak with Amit to find a suitable starting point for your goals and experience level." },
];

export const contact = {
  phone: "+91 9820385016",
  whatsapp: "https://wa.me/919820385016?text=Hi%20Amit%2C%20I%20am%20interested%20in%20the%20Mind%20Body%20Flow%20Rotational%20Training%20Program.",
  registrationForm: "https://forms.gle/replace-with-your-google-form-link",
  email: "mindbodyflow9@gmail.com",
  location: "Mind Body Flow",
  instagram: "https://www.instagram.com/amitkavale",
  youtube: "https://www.youtube.com/@amitkavale2466",
};

export const coach = {
  name: "Amit Kavale",
  title: "Rotational Performance Coach",
  image: "/images/profile.jpeg",
  intro: "Ex-banker turned fitness coach and hybrid athlete. Amit combines traditional movement systems with modern fitness principles to help people move better, build rotational strength, and develop long-term physical resilience.",
  credentials: ["NCCA accredited", "NASM Certified Personal Trainer", "Rotational Training Specialist", "40+ rotational flow workshops", "500+ participants coached"],
  sports: "Badminton · marathon running · cricket · table tennis · squash · swimming",
};

export const trust = [
  { label: "Coach-led", icon: ShieldCheck },
  { label: "Skill-based", icon: Hand },
  { label: "Small batches", icon: Activity },
  { label: "Progressive", icon: Trophy },
  { label: "01-hour sessions", icon: Timer },
];
