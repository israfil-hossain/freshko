"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/stores/walletStore";

export default function WalletPage() {
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const isLoading = useWalletStore((s) => s.isLoading);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const fetchTransactions = useWalletStore((s) => s.fetchTransactions);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const totalCredits = transactions.filter((t) => t.type === "credit" || t.type === "refund").reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Wallet</h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl p-6 text-white mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-white/70 mb-1">Available Balance</p>
            <p className="text-4xl font-bold">৳{balance.toFixed(2)}</p>
            <div className="mt-5 flex gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <p className="text-xs text-white/70">Total Credits</p>
                <p className="text-lg font-semibold">৳{totalCredits.toFixed(2)}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <p className="text-xs text-white/70">Total Debits</p>
                <p className="text-lg font-semibold">৳{totalDebits.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <h2 className="text-lg font-bold text-foreground mb-4">Transaction History</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((_, i) => (
              <div key={i} className="h-16 rounded-xl skeleton" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">No transactions yet</h3>
            <p className="text-sm text-muted">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div key={transaction._id}
                className="bg-white border border-border-light rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    transaction.type === "credit" || transaction.type === "refund" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  }`}>
                    {transaction.type === "credit" || transaction.type === "refund" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                    <p className="text-xs text-muted">
                      {new Date(transaction.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${transaction.type === "credit" || transaction.type === "refund" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "credit" || transaction.type === "refund" ? "+" : "-"}৳{transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted">Balance: ৳{transaction.balance.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
