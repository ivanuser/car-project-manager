import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-purple-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">CarMod Manager</Link>
        <nav>
          {session ? (
            <>
              <Link href="/dashboard" className="mr-4">Dashboard</Link>
              <button onClick={() => signOut()} className="bg-red-500 px-4 py-2 rounded">Log Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="mr-4">Log In</Link>
              <Link href="/signup" className="bg-white text-purple-600 px-4 py-2 rounded">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}