export default function Footer() {
    return (
        <footer className="bg-black/80 py-6 px-6 text-center text-gray-400">
            <div className="flex justify-center space-x-6 mb-4">
                <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
            </div>
            <p>© 2025 UrbanBook. All rights reserved.</p>
        </footer>
    );
}