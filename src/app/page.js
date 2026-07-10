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
  Sparkles,
  Gem,
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ members: 0, totalDeposits: 0, activeLoans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicTimeline();
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const [membersRes, depositsRes] = await Promise.all([
        fetchAPI('/api/users'),
        fetchAPI('/api/deposits'),
      ]);
      const members = membersRes.success ? membersRes.users?.filter(u => u.role !== 'admin').length || 0 : 0;
      const deposits = depositsRes.success ? depositsRes.deposits?.filter(d => d.status === 'confirmed').reduce((s, d) => s + (d.amount || 0), 0) || 0 : 0;
      setStats({ members, totalDeposits: deposits, activeLoans: 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'deposit': return { icon: Wallet, bg: 'bg-emerald-100', text: 'text-emerald-600' };
      case 'loan_request': return { icon: HandCoins, bg: 'bg-teal-100', text: 'text-teal-600' };
      case 'loan_installment': return { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-600' };
      case 'loan_disbursement': return { icon: TrendingUp, bg: 'bg-emerald-100', text: 'text-emerald-600' };
      case 'manager_rotation': return { icon: Users, bg: 'bg-amber-100', text: 'text-amber-600' };
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
    <div className="min-h-screen">
      {/* Hero Section - Emerald Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white py-20 md:py-28">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-emerald-300 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          {/* Gem/Sparkle decorations */}
          <div className="absolute top-10 right-10 w-8 h-8 bg-amber-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-6 h-6 bg-emerald-300 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-white/10">
            <Gem className="size-4" />
            <span>🏔️ Cooperative Fund Management</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Project<span className="text-amber-300">Himaloy</span>
          </h1>

          <p className="text-xl md:text-2xl text-emerald-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            A democratic, interest-free cooperative fund management system. Members contribute monthly, apply for loans, and manage funds together.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-amber-400 text-emerald-900 rounded-xl font-bold hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 transform hover:-translate-y-0.5"
            >
              Join Now
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto mt-12 pt-8 border-t border-white/20">
            <div>
              <p className="text-3xl font-bold text-white">{stats.members}+</p>
              <p className="text-sm text-emerald-200">Members</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">৳{stats.totalDeposits.toLocaleString()}</p>
              <p className="text-sm text-emerald-200">Total Deposits</p>
            </div>
            <div className="hidden md:block">
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-sm text-emerald-200">Active Loans</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Emerald/Teal Cards */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Why <span className="text-emerald-600">Himaloy</span>?</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">Built on trust, transparency, and community participation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 text-center hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Wallet className="size-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Monthly Deposits</h3>
            <p className="text-gray-500 leading-relaxed">
              Contribute monthly with minimum <span className="font-semibold text-emerald-700">৳200</span>. Track your deposit history and build your fund.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 p-8 text-center hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <HandCoins className="size-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Interest-Free Loans</h3>
            <p className="text-gray-500 leading-relaxed">
              Apply for loans with <span className="font-semibold text-teal-700">0% interest</span>. Choose 5 or 10 month terms with flexible installments.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 p-8 text-center hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Vote className="size-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Democratic Voting</h3>
            <p className="text-gray-500 leading-relaxed">
              Every member votes on loan requests. <span className="font-semibold text-green-700">Transparent</span> decision making with meeting support.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Emerald Theme */}
      <section className="py-16 px-4 bg-emerald-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It <span className="text-emerald-600">Works</span></h2>
            <p className="text-gray-500 mt-2">Four simple steps to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-emerald-100 p-6 text-center relative hover:shadow-lg hover:border-emerald-300 transition-all">
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">1</div>
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Users className="size-7 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Join</h4>
              <p className="text-sm text-gray-500">Register as a member and start contributing monthly</p>
            </div>

            <div className="bg-white rounded-xl border border-emerald-100 p-6 text-center relative hover:shadow-lg hover:border-emerald-300 transition-all">
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">2</div>
              <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <Wallet className="size-7 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Contribute</h4>
              <p className="text-sm text-gray-500">Make monthly deposits and build your fund balance</p>
            </div>

            <div className="bg-white rounded-xl border border-emerald-100 p-6 text-center relative hover:shadow-lg hover:border-emerald-300 transition-all">
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">3</div>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <HandCoins className="size-7 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Apply</h4>
              <p className="text-sm text-gray-500">Request a loan and participate in community voting</p>
            </div>

            <div className="bg-white rounded-xl border border-emerald-100 p-6 text-center relative hover:shadow-lg hover:border-emerald-300 transition-all">
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">4</div>
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-7 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Grow</h4>
              <p className="text-sm text-gray-500">Repay installments and build savings for the community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline - Emerald Theme */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3 border border-emerald-200">
            <Bell className="size-4" />
            <span>Live Feed</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Recent Activity</h2>
          <p className="text-gray-500 mt-2">Latest transactions from the community</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-3 text-gray-500">Loading timeline...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-xl border border-emerald-200 p-12 text-center">
            <Clock className="size-12 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No Activity Yet</h3>
            <p className="text-gray-500 mt-1">Transactions will appear here once the fund starts</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-emerald-200 hidden sm:block"></div>

            <div className="space-y-4">
              {activities.map((txn, index) => {
                const iconData = getActivityIcon(txn.type);
                const Icon = iconData.icon;
                const txnDate = txn.date || (txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '-');
                const timeAgo = txn.created_at ? getTimeAgo(new Date(txn.created_at)) : '';

                return (
                  <div key={txn._id || index} className="flex gap-4 relative">
                    <div className={`hidden sm:flex w-10 h-10 rounded-full ${iconData.bg} items-center justify-center shrink-0 relative z-10 border-2 border-white shadow-sm`}>
                      <Icon className={`size-4 ${iconData.text}`} />
                    </div>

                    <div className="flex-1 bg-white rounded-xl border border-emerald-100 p-4 hover:shadow-md hover:border-emerald-300 transition-all">
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
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${txn.status === 'confirmed' || txn.status === 'completed' ? 'bg-green-100 text-green-700' :
                            txn.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              txn.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                            {txn.status}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-900">
                        <span className="font-semibold text-gray-900">{txn.member_name || 'Member'}</span>
                        {' '}{getActivityText(txn)}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {txnDate}
                        </span>
                        {timeAgo && <span>• {timeAgo}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* CTA Section - Emerald Gradient */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-white/10">
            <Gem className="size-4" />
            <span>Join the Community</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Together?</h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Start your journey with ProjectHimaloy today. Build funds, support each other, and grow together.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-400 text-emerald-900 rounded-xl font-bold hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 transform hover:-translate-y-0.5"
          >
            Get Started <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>
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
