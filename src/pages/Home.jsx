import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Testimonials data
    const testimonials = [
        {
            quote: "UrbanBook revolutionized my study routine. Scheduling and homework tracking have never been this easy!",
            author: "Priya Sharma, Student",
            color: "text-blue-300",
        },
        {
            quote: "Managing my classes and students is a breeze now. UrbanBook is a must-have for every teacher!",
            author: "Dr. Vikram Patel, Teacher",
            color: "text-green-300",
        },
        {
            quote: "The real-time updates keep me on top of my assignments. It’s like having a personal assistant!",
            author: "Aisha Khan, Student",
            color: "text-purple-300",
        },
        {
            quote: "The flexibility to set my slots and connect with students seamlessly is incredible.",
            author: "Prof. Emily Carter, Teacher",
            color: "text-pink-300",
        },
    ];

    // Auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        }, 5000); // Slide every 5 seconds
        return () => clearInterval(interval);
    }, [testimonials.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col overflow-x-hidden">
            <Header />

            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center flex-grow px-6 py-28 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <svg className="w-full h-full opacity-20 animate-float" viewBox="0 0 1440 320">
                        <path fill="#a5b4fc" fillOpacity="0.4" d="M0,224L60,208C120,192,240,160,360,149.3C480,139,600,149,720,165.3C840,181,960,203,1080,197.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>
                </div>
                <div className="absolute inset-0 z-0 animate-pulse-slow opacity-10">
                    <div className="w-full h-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20"></div>
                </div>
                <div className="text-center relative z-10 animate-slide-in-up">
                    <h1 className="text-6xl md:text-8xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
                        UrbanBook
                    </h1>
                    <p className="text-gray-100 text-xl md:text-3xl max-w-4xl mx-auto animate-fade-in-delay font-light">
                        Empowering education with seamless scheduling, real-time collaboration, and a universe of possibilities.
                    </p>
                </div>

                <div className="mt-12 flex flex-col items-center animate-bounce-in">
                    <h2 className="text-4xl font-semibold mb-10 text-gray-50 drop-shadow-md">Embark on Your Journey</h2>
                    <div className="flex space-x-10">
                        <button
                            className="px-14 py-6 rounded-full transition-all duration-500 transform hover:scale-110 hover:rotate-2 bg-gradient-to-r from-blue-700 to-indigo-700 shadow-2xl shadow-blue-600/60 text-xl font-semibold hover:shadow-blue-700/80 hover:bg-gradient-to-r hover:from-blue-800 hover:to-indigo-800"
                            onClick={() => navigate("/student/signup")}
                        >
                            Student
                        </button>
                        <button
                            className="px-14 py-6 rounded-full transition-all duration-500 transform hover:scale-110 hover:-rotate-2 bg-gradient-to-r from-green-700 to-teal-700 shadow-2xl shadow-green-600/60 text-xl font-semibold hover:shadow-green-700/80 hover:bg-gradient-to-r hover:from-green-800 hover:to-teal-800"
                            onClick={() => navigate("/teacher/signup")}
                        >
                            Teacher
                        </button>
                    </div>
                </div>

                {/* Animated Orbital Image */}
                <div className="mt-20 relative z-10">
                    <svg className="w-72 h-72 md:w-96 md:h-96 animate-orbit" viewBox="0 0 200 200">
                        <defs>
                            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: "#a5b4fc", stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: "#f9a8d4", stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                        <circle cx="100" cy="100" r="80" fill="none" stroke="url(#orbitGradient)" strokeWidth="8" strokeDasharray="502" strokeDashoffset="125" />
                        <circle cx="100" cy="40" r="15" fill="#ffffff" className="animate-orbit-inner" />
                        <text x="100" y="105" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold">Explore</text>
                    </svg>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 bg-gray-800/20 backdrop-blur-lg border-t border-gray-700/50">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-5xl md:text-6xl font-extrabold text-center mb-16 animate-slide-in-up bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        About UrbanBook
                    </h2>
                    <p className="text-gray-200 text-lg md:text-xl max-w-4xl mx-auto text-center mb-16 animate-fade-in-delay font-light">
                        UrbanBook is the pinnacle of educational platforms, blending innovation with simplicity to transform how students and teachers connect.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {[
                            { title: "Tailored Dashboards", desc: "Students book classes, track homework, and review history, while teachers manage slots, send assignments, and monitor progress—all in one sleek interface." },
                            { title: "Real-Time Magic", desc: "Instant updates keep everyone synced—homework appears the moment it’s assigned, and completed sessions update live." },
                            { title: "Scheduling Freedom", desc: "Teachers set flexible slots, students book effortlessly, and both can reschedule with ease, all powered by an intuitive system." },
                            { title: "Homework Harmony", desc: "Assign, track, and manage homework seamlessly, ensuring nothing slips through the cracks." },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-8 bg-gradient-to-br from-gray-700/30 to-indigo-900/30 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-delay border border-gray-600/50"
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <h3 className="text-2xl font-semibold mb-4 text-indigo-300">{feature.title}</h3>
                                <p className="text-gray-200">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative">
                <div className="absolute inset-0 z-0">
                    <svg className="w-full h-full opacity-10 animate-float-reverse" viewBox="0 0 1440 320">
                        <path fill="#c4b5fd" fillOpacity="0.3" d="M0,96L60,112C120,128,240,160,360,165.3C480,171,600,149,720,133.3C840,117,960,107,1080,112C1200,117,1320,139,1380,149.3L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-16 animate-slide-in-up bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Unleash the Power
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { icon: "📅", title: "Seamless Scheduling", desc: "Book or offer classes with unparalleled ease." },
                            { icon: "⏰", title: "Live Sync", desc: "Real-time updates keep you ahead of the curve." },
                            { icon: "📚", title: "Homework Mastery", desc: "Organize and track assignments effortlessly." },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-10 bg-gradient-to-br from-indigo-900/40 to-gray-800/40 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in-delay border border-indigo-500/20"
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <div className="text-6xl mb-6 animate-pulse">{feature.icon}</div>
                                <h3 className="text-2xl font-semibold mb-4 text-purple-300">{feature.title}</h3>
                                <p className="text-gray-200">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-gray-800/20 backdrop-blur-lg border-t border-gray-700/50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-16 animate-slide-in-up bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                        Your Path to Success
                    </h2>
                    <div className="flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-10">
                        {[
                            { step: "1️⃣", title: "Join the Cosmos", desc: "Sign up as a student or teacher in a flash." },
                            { step: "2️⃣", title: "Craft Your Orbit", desc: "Schedule classes that fit your universe." },
                            { step: "3️⃣", title: "Ignite Learning", desc: "Engage in a stellar educational experience." },
                        ].map((step, index) => (
                            <div
                                key={index}
                                className="flex-1 p-10 bg-gradient-to-br from-teal-900/30 to-gray-700/30 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-delay border border-teal-500/20"
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <div className="text-7xl mb-6 animate-bounce-slow">{step.step}</div>
                                <h3 className="text-2xl font-semibold mb-4 text-teal-300">{step.title}</h3>
                                <p className="text-gray-200">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section with Animated Slides */}
            <section className="py-24 relative">
                <div className="absolute inset-0 z-0">
                    <svg className="w-full h-full opacity-10 animate-float" viewBox="0 0 1440 320">
                        <path fill="#f9a8d4" fillOpacity="0.3" d="M0,224L60,208C120,192,240,160,360,149.3C480,139,600,149,720,165.3C840,181,960,203,1080,197.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-16 animate-slide-in-up bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Voices of the Galaxy
                    </h2>
                    <div className="relative overflow-hidden">
                        <div
                            className="flex transition-transform duration-1000 ease-in-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="min-w-full p-10 bg-gradient-to-br from-gray-700/40 to-indigo-900/40 rounded-3xl shadow-xl border border-gray-600/30"
                                >
                                    <p className="text-gray-100 text-xl md:text-2xl italic mb-6 font-light">"{testimonial.quote}"</p>
                                    <p className={`font-semibold text-lg ${testimonial.color}`}>{testimonial.author}</p>
                                </div>
                            ))}
                        </div>
                        {/* Navigation Dots */}
                        <div className="mt-8 flex justify-center space-x-3">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-indigo-500 scale-125" : "bg-gray-500"}`}
                                    onClick={() => setCurrentSlide(index)}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Custom Animations */}
            <style jsx>{`
                .animate-slide-in-up {
                    animation: slideInUp 1.2s ease-out;
                }
                .animate-fade-in-delay {
                    animation: fadeIn 1.2s ease-in;
                }
                .animate-bounce-in {
                    animation: bounceIn 1.8s ease-in-out;
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-float-reverse {
                    animation: floatReverse 8s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulseSlow 6s ease-in-out infinite;
                }
                .animate-orbit {
                    animation: orbit 15s linear infinite;
                }
                .animate-orbit-inner {
                    animation: orbitInner 5s ease-in-out infinite;
                }
                .animate-bounce-slow {
                    animation: bounceSlow 3s ease-in-out infinite;
                }
                @keyframes slideInUp {
                    from { transform: translateY(60px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.7); opacity: 0; }
                    60% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); }
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-25px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes floatReverse {
                    0% { transform: translateY(-25px); }
                    50% { transform: translateY(0px); }
                    100% { transform: translateY(-25px); }
                }
                @keyframes pulseSlow {
                    0% { opacity: 0.1; }
                    50% { opacity: 0.2; }
                    100% { opacity: 0.1; }
                }
                @keyframes orbit {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes orbitInner {
                    0% { transform: translateY(-60px); }
                    50% { transform: translateY(-70px); }
                    100% { transform: translateY(-60px); }
                }
                @keyframes bounceSlow {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
}