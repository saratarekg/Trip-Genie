
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";

const WalletHistory = ({ tourist, formatWallet, currencyCode,getTransactionIcon, groupTransactionsByDate, convertCurrency, formatCurrency }) => {
 
  return (
    <Card className="shadow-none border border-white">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">Current Balance</span>
          </div>
          <span className="text-xl font-bold">
          {formatWallet(tourist.wallet)}          </span>
        </div>
        <div className="mt-2 overflow-y-auto max-h-[173px]">
          <h3 className="text-xl font-bold mb-2 text-[#1A3B47]">Wallet History</h3>
          {tourist.history && Array.isArray(tourist.history) && tourist.history.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupTransactionsByDate(tourist.history)).map(([dateGroup, groupData]) => {
                if (dateGroup === 'Earlier') {
                  return Object.entries(groupData).map(([monthYear, monthData]) => (
                    monthData.transactions.length > 0 && (
                      <div key={monthYear}>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-md font-semibold text-gray-400">{monthYear}</h4>
                          <span className="text-sm text-gray-500">
                            {monthData.sign === "positive" ? "+" : "-"}
                            {formatCurrency(convertCurrency(monthData.total, "USD", currencyCode), tourist.preferredCurrency)}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {monthData.transactions.map((entry, index) => (
                            <li key={index} className="flex justify-between items-center pl-4 pr-4 pb-3 pt-3 bg-white rounded-md">
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-100 rounded-full p-2">
                                  {getTransactionIcon(entry.details)}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {entry.details || "Transaction"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {format(parseISO(entry.timestamp), 'dd MMM yyyy HH:mm')}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`text-sm font-bold ${entry.transactionType === "deposit" ? "text-green-500" : "text-red-500"}`}
                              >
                                {entry.transactionType === "deposit" ? "+" : "-"}
                                {formatCurrency(convertCurrency(entry.amount, "USD", currencyCode), tourist.preferredCurrency)}
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
                        <h4 className="text-md font-semibold text-gray-400">{dateGroup}</h4>
                        <span className="text-sm text-gray-500">
                          {groupData.sign === "positive" ? "+" : "-"}
                          {formatCurrency(convertCurrency(groupData.total, "USD", currencyCode), tourist.preferredCurrency)}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {groupData.transactions.map((entry, index) => (
                          <li key={index} className="flex justify-between items-center pl-4 pr-4 pb-3 pt-3 bg-white rounded-md ">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#E6DCCF] rounded-full p-2">
                                {getTransactionIcon(entry.details)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {entry.details || "Transaction"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {format(parseISO(entry.timestamp), 'dd MMM yyyy HH:mm')}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`text-sm font-bold ${entry.transactionType === "deposit" ? "text-green-500" : "text-red-500"}`}
                            >
                              {entry.transactionType === "deposit" ? "+" : "-"}
                              {formatCurrency(convertCurrency(entry.amount, "USD", currencyCode), tourist.preferredCurrency)}
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
              {tourist.history && Array.isArray(tourist.history)
                ? "No transactions found"
                : "Wallet history not available"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletHistory;