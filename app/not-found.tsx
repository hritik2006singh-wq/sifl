import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-center px-4">
            <h2 className="text-4xl font-black text-gray-900 mb-4">404 - Page Not Found</h2>
            <p className="text-gray-500 mb-8 max-w-md">The page you are looking for does not exist or has been moved.</p>
            <Link
                href="/"
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
            >
                Return Home
            </Link>
        </div>
    );
}
