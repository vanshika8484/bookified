'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchTerm) {
                params.set('search', searchTerm);
            } else {
                params.delete('search');
            }
            router.push(`${pathname}?${params.toString()}`);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, searchParams, router, pathname]);

    return (
        <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
        </div>
    );
}
