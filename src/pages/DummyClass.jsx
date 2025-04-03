import Header from "../components/Header";
import Footer from "../components/Footer";

export default function DummyClass() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white flex flex-col">
            <Header />
            <div className="flex-grow flex items-center justify-center">
                <h1 className="text-4xl font-bold">dummyclass</h1>
            </div>
            <Footer />
        </div>
    );
}