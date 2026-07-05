// client/src/app/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import {
  Wallet,
  HandCoins,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  ArrowRight,
  Vote,
  Bell,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ members: 0, totalDeposits: 0, activeLoans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicTimeline();
  }, []);

  const fetchPublicTimeline = async () => {
    try {
      const data = await fetchAPI('/api/transactions');
      if (data.success) {
        setActivities(data.transactions?.slice(0, 20) || []);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'deposit': return { icon: Wallet, bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'loan_request': return { icon: HandCoins, bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'loan_installment': return { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-600' };
      case 'loan_disbursement': return { icon: TrendingUp, bg: 'bg-yellow-100', text: 'text-yellow-600' };
      case 'manager_rotation': return { icon: Users, bg: 'bg-orange-100', text: 'text-orange-600' };
      default: return { icon: Clock, bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const getActivityText = (txn) => {
    switch (txn.type) {
      case 'deposit': return `made a deposit of ৳${txn.amount?.toLocaleString()}`;
      case 'loan_request': return `requested a loan of ৳${txn.amount?.toLocaleString()}`;
      case 'loan_installment': return `paid installment of ৳${txn.amount?.toLocaleString()}`;
      case 'loan_disbursement': return `received loan of ৳${txn.amount?.toLocaleString()}`;
      case 'manager_rotation': return `manager rotation completed`;
      default: return `transaction recorded`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span>🏔️</span>
            <span>Cooperative Fund Management</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Project<span className="text-blue-600">Himaloy</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            A democratic, interest-free cooperative fund management system.
            Members contribute monthly, apply for loans, and manage funds together.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Join Now
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Wallet className="size-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Monthly Deposits</h3>
            <p className="text-sm text-gray-500">Contribute monthly with minimum ৳200. Track your deposit history.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <HandCoins className="size-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Interest-Free Loans</h3>
            <p className="text-sm text-gray-500">Apply for loans with democratic voting. 5 or 10 month terms.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Vote className="size-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Democratic Voting</h3>
            <p className="text-sm text-gray-500">Every member votes on loan requests. Transparent decision making.</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <p className="text-gray-500 mt-2">Latest transactions from the community</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-500">Loading timeline...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Clock className="size-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No Activity Yet</h3>
            <p className="text-gray-500 mt-1">Transactions will appear here once the fund starts</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-blue-100 hidden sm:block"></div>

            <div className="space-y-4">
              {activities.map((txn, index) => {
                const iconData = getActivityIcon(txn.type);
                const Icon = iconData.icon;
                const txnDate = txn.date || (txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '-');
                const timeAgo = txn.created_at ? getTimeAgo(new Date(txn.created_at)) : '';

                return (
                  <div key={txn._id || index} className="flex gap-4 relative">
                    {/* Timeline Dot */}
                    <div className={`hidden sm:flex w-10 h-10 rounded-full ${iconData.bg} items-center justify-center shrink-0 relative z-10 border-2 border-white`}>
                      <Icon className={`size-4 ${iconData.text}`} />
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`sm:hidden w-7 h-7 rounded-full ${iconData.bg} flex items-center justify-center`}>
                          <Icon className={`size-3.5 ${iconData.text}`} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${iconData.bg} ${iconData.text}`}>
                          {txn.type === 'deposit' ? 'Deposit' :
                            txn.type === 'loan_installment' ? 'Installment' :
                              txn.type === 'loan_disbursement' ? 'Loan Received' :
                                txn.type === 'loan_request' ? 'Loan Request' :
                                  txn.type === 'manager_rotation' ? 'Manager Rotation' : 'Transaction'}
                        </span>
                        {txn.status && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${txn.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {txn.status}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{txn.member_name || 'Member'}</span>
                        {' '}{getActivityText(txn)}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {txnDate}
                        </span>
                        {timeAgo && <span>{timeAgo}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-200">
        <p className="text-sm text-gray-500">© 2026 ProjectHimaloy. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Helper: Time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return '';
}