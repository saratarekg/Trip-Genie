import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";

const WalletHistory = ({ tourist, currencySymbol, currencyCode, getTransactionIcon, groupTransactionsByDate, convertCurrency }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tourist?.history) {
      setLoading(false);
    }
  }, [tourist]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-none border border-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl">Current Balance</span>
            </div>
            {loading ? (
              <div className="bg-gray-300 rounded w-24 h-6 animate-pulse"></div>
            ) : (
              <span className="text-xl font-bold">
                {currencySymbol}{convertCurrency(tourist?.wallet, "USD", currencyCode)}
              </span>
            )}
          </div>
          <div className="mt-2 ">
            <h3 className="text-3xl font-bold mb-2 text-[#1A3B47]">Wallet History</h3>
            {loading ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                </div>
                <ul className="space-y-2">
                  {[...Array(5)].map((_, index) => (
                    <li key={index} className="flex justify-between items-center pl-4 pr-4 pb-3 pt-3 bg-gray-200 rounded-md animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-300 rounded-full p-2"></div>
                        <div>
                          <p className="font-medium text-sm bg-gray-300 rounded w-24 h-4"></p>
                          <p className="text-xs text-gray-500 bg-gray-300 rounded w-32 h-3 mt-1"></p>
                        </div>
                      </div>
                      <div className="text-sm font-bold bg-gray-300 rounded w-12 h-4"></div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              tourist?.history && Array.isArray(tourist?.history) && tourist?.history.length > 0 ? (
                <div className="space-y-4 overflow-y-auto max-h-[400px]">
                  {Object.entries(groupTransactionsByDate(tourist?.history)).map(([dateGroup, groupData]) => {
                    if (dateGroup === 'Earlier') {
                      return Object.entries(groupData).map(([monthYear, monthData]) => (
                        monthData.transactions.length > 0 && (
                          <div key={monthYear}>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-lg font-semibold text-gray-400">{monthYear}</h4>
                              <span className="text-lg font-semibold text-gray-500">
                                {monthData.sign === "positive" ? "+" : "-"}
                                 {currencySymbol}{convertCurrency(monthData.total, "USD", currencyCode)}
                              </span>
                            </div>
                            <ul className="space-y-2">
                              {monthData.transactions.map((entry, index) => (
                                <li key={index} className="flex justify-between items-center pl-4 pr-4 pb-3 pt-3 bg-white rounded-md">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 rounded-full p-2 ">
                                      {getTransactionIcon(entry.details)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-base">
                                        {entry.details || "Transaction"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {format(parseISO(entry.timestamp), 'dd MMM yyyy HH:mm')}
                                      </p>
                                    </div>
                                  </div>
                                  <div
                                    className={`text-base font-bold ${entry.transactionType === "deposit" ? "text-[#388A94]" : "text-[#F88C33]"}`}
                                  >
                                    {entry.transactionType === "deposit" ? "+" : "-"}
                                     {currencySymbol}{convertCurrency(entry.amount, "USD", currencyCode)}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      ));
                    } else {
                      return groupData.transactions.length > 0 && (
                        <div key={dateGroup}>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-lg font-semibold text-gray-400">{dateGroup}</h4>
                            <span className="text-lg font-semibold text-gray-500">
                              {groupData.sign === "positive" ? "+" : "-"}
                               {currencySymbol}{convertCurrency(groupData.total, "USD", currencyCode)}
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {groupData.transactions.map((entry, index) => (
                              <li key={index} className="flex justify-between items-center pl-4 pr-4 pb-3 pt-3 bg-white rounded-md ">
                                <div className="flex items-center gap-3">
                                  <div className="bg-[#B5D3D1] rounded-full p-2">
                                    {getTransactionIcon(entry.details)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-base">
                                      {entry.details || "Transaction"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {format(parseISO(entry.timestamp), 'dd MMM yyyy HH:mm')}
                                    </p>
                                  </div>
                                </div>
                                <div
                                  className={`text-base font-bold ${entry.transactionType === "deposit" ? "text-[#388A94]" : "text-[#F88C33]"}`}
                                >
                                  {entry.transactionType === "deposit" ? "+" : "-"}
                                   {currencySymbol}{convertCurrency(entry.amount, "USD", currencyCode)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {tourist?.history && Array.isArray(tourist?.history)
                    ? "No transactions found"
                    : "Wallet history not available"}
                </p>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletHistory;