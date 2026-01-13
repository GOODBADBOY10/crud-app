import { JournalCard } from './components/journal-card';

export default function Page() {
  return (
    <div className="min-h-screen">
      <div className="hero py-12 bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold">Journal dApp</h1>
            <p className="py-6 text-lg">
              Create, update, and manage your personal journal entries on the Solana blockchain.
              All entries are stored securely and owned by you.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6">
        <JournalCard />
      </div>
    </div>
  );
}