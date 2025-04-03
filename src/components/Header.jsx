export default function Header() {
    return (
        <header className="bg-black/80 backdrop-blur-md py-4 px-6 flex justify-between items-center sticky top-0 z-10 shadow-lg">
            <div className="text-2xl font-bold tracking-tight">
                <span className="text-blue-400">Urban</span>Book
            </div>
            <div className="space-x-6">
                <a href="/" className="hover:text-blue-400 transition-colors">Home</a>
                <a href="#" className="hover:text-blue-400 transition-colors">About</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
            </div>
        </header>
    );
}