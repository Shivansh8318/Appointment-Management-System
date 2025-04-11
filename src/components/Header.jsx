export default function Header() {
    return (
        <header className="bg-white/90 backdrop-blur-md py-4 px-6 flex justify-between items-center sticky top-0 z-10 shadow-md border-b border-gray-200">
            <div className="text-2xl font-bold tracking-tight">
                <span className="text-blue-600">Urban</span>Book
            </div>
            <div className="space-x-6">
                <a href="/" className="text-gray-800 hover:text-blue-600 transition-colors">Home</a>
                <a href="#" className="text-gray-800 hover:text-blue-600 transition-colors">About</a>
                <a href="#" className="text-gray-800 hover:text-blue-600 transition-colors">Contact</a>
            </div>
        </header>
    );
}