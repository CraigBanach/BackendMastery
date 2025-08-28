"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountRequiredWrapper } from "@/components/ui/accountRequiredWrapper";
import { PageHeader } from "@/components/ui/pageHeader";
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, Split, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TransactionSplitter } from "./transactionSplitter";
import { 
  getPendingTransactions, 
  approvePendingTransaction, 
  rejectPendingTransaction,
  approvePendingTransactionSplit,
  PendingTransactionDto,
  TransactionSplit
} from "@/lib/api/transactionImportApi";
import { getCategories } from "@/lib/api/categoryApi";
import { format } from "date-fns";

interface Category {
  id: number;
  name: string;
  type: string;
  icon?: string;
}

export default function TransactionReviewPageClient() {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransactionDto[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [splittingTransactions, setSplittingTransactions] = useState<Set<number>>(new Set());
  const [customDescriptions, setCustomDescriptions] = useState<Map<number, string>>(new Map());
  const [splitAssignments, setSplitAssignments] = useState<Map<number, TransactionSplit[]>>(new Map());

  const loadData = useCallback(async (pageToLoad = 1, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      const [transactionsResult, categoriesResult] = await Promise.all([
        getPendingTransactions(pageToLoad, 20),
        pageToLoad === 1 ? getCategories() : Promise.resolve(categories)
      ]);
      
      if (append) {
        setPendingTransactions(prev => {
          // Create a Set of existing IDs to prevent duplicates
          const existingIds = new Set(prev.map(t => t.id));
          const newTransactions = transactionsResult.items.filter(t => !existingIds.has(t.id));
          return [...prev, ...newTransactions];
        });
      } else {
        setPendingTransactions(transactionsResult.items);
        setTotalCount(transactionsResult.totalCount);
      }
      
      if (pageToLoad === 1) setCategories(categoriesResult);
      setHasMore(transactionsResult.items.length === 20);
      
      // Only update page if we're appending (not on initial load or refresh)
      if (append) {
        setPage(pageToLoad);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load data";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [categories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Check if we're near the bottom of the page
      const threshold = 1000;
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const documentHeight = document.documentElement.offsetHeight;
      
      if (scrollPosition >= documentHeight - threshold) {
        if (hasMore && !isLoading && !isLoadingMore) {
          loadData(page + 1, true);
        }
      }
    };

    // Throttle scroll events to prevent excessive API calls
    let scrollTimeout: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll);
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [hasMore, isLoading, isLoadingMore, page, loadData]);



  const toggleTransactionExpanded = (transactionId: number) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedTransactions(newExpanded);
  };

  const handleApproveTransaction = async (transactionId: number, categoryId: number) => {
    try {
      setIsProcessing(true);
      const customDescription = customDescriptions.get(transactionId);
      await approvePendingTransaction(transactionId, categoryId, undefined, customDescription);
      
      // Update the transaction in place instead of refreshing
      setPendingTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: 'Approved', categoryId, categoryName: categories.find(c => c.id === categoryId)?.name }
            : t
        )
      );
      setTotalCount(prev => prev - 1);
      // Clear custom description
      setCustomDescriptions(prev => {
        const updated = new Map(prev);
        updated.delete(transactionId);
        return updated;
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to approve transaction";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitTransaction = (transactionId: number) => {
    setSplittingTransactions(prev => new Set([...prev, transactionId]));
  };

  const handleCancelSplit = (transactionId: number) => {
    setSplittingTransactions(prev => {
      const updated = new Set(prev);
      updated.delete(transactionId);
      return updated;
    });
  };

  const handleSplitComplete = async (transactionId: number, splits: TransactionSplit[]) => {
    try {
      setIsProcessing(true);
      await approvePendingTransactionSplit(transactionId, splits);
      
      // Store split assignments for display
      setSplitAssignments(prev => {
        const updated = new Map(prev);
        updated.set(transactionId, splits);
        return updated;
      });
      
      // Update the transaction in place
      setPendingTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: 'Approved' }
            : t
        )
      );
      setTotalCount(prev => prev - 1);
      handleCancelSplit(transactionId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to approve split transaction";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCustomDescription = (transactionId: number, description: string) => {
    setCustomDescriptions(prev => {
      const updated = new Map(prev);
      if (description.trim()) {
        updated.set(transactionId, description);
      } else {
        updated.delete(transactionId);
      }
      return updated;
    });
  };

  const handleRejectTransaction = async (transactionId: number) => {
    try {
      setIsProcessing(true);
      await rejectPendingTransaction(transactionId);
      
      // Update the transaction in place instead of refreshing
      setPendingTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: 'Rejected' }
            : t
        )
      );
      setTotalCount(prev => prev - 1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reject transaction";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      case 'duplicate':
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Duplicate</Badge>;
      case 'potentialduplicate':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Potential Duplicate</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    const formattedAmount = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(absAmount);
    
    // In DB: positive = spending, negative = income
    // Display: spending (positive DB) = no +, income (negative DB) = +
    return amount < 0 ? `+${formattedAmount}` : formattedAmount;
  };

  const getAmountColor = (amount: number) => {
    // In DB: positive = spending, negative = income
    // Display: spending (positive DB) = red, income (negative DB) = green
    return amount >= 0 ? 'text-red-600' : 'text-green-600';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy");
  };

  // Loading skeleton component
  const TransactionSkeleton = () => (
    <div className="border rounded-lg p-4 animate-pulse">
      {/* Desktop skeleton */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-8">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Mobile skeleton */}
      <div className="md:hidden space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </div>
  );

  const pendingCount = pendingTransactions.filter(t => t.status === 'Pending' || t.status === 'PotentialDuplicate').length;

  if (isLoading) {
    return (
      <AccountRequiredWrapper>
        <div className="container mx-auto px-4 py-6">
          <PageHeader title="Review Transactions" subTitle="Review and categorize imported transactions" />
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading transactions...</p>
            </CardContent>
          </Card>
        </div>
      </AccountRequiredWrapper>
    );
  }

  return (
    <AccountRequiredWrapper>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/import'}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Import
          </Button>
        </div>
        <PageHeader title="Review Transactions" subTitle="Review and categorize imported transactions" />

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
            <Button 
              onClick={() => setError(null)} 
              variant="ghost" 
              size="sm" 
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {pendingCount === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All transactions processed!</h3>
              <p className="text-gray-600 mb-4">There are no pending transactions to review.</p>
              <Button onClick={() => window.location.href = '/import'}>
                Import More Transactions
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Transactions List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Transactions ({totalCount} total)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTransactions.map((transaction) => (
                    <div key={transaction.id} className={`border rounded-lg p-4 ${
                      transaction.status === 'PotentialDuplicate' 
                        ? 'border-orange-200 bg-orange-50' 
                        : ''
                    }`}>
                      {/* Desktop Layout: Two Column */}
                      <div className="hidden md:grid md:grid-cols-2 md:gap-8">
                        {/* Left Column - Key Details */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-xl">{transaction.counterParty}</h3>
                                {getStatusBadge(transaction.status)}
                                {transaction.status === 'Duplicate' && (
                                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                                )}
                                {transaction.status === 'PotentialDuplicate' && (
                                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                                )}
                              </div>
                              
                              {/* Reference */}
                              {transaction.reference && transaction.reference !== transaction.counterParty && (
                                <p className="text-gray-600 mb-2">
                                  {transaction.reference}
                                </p>
                              )}
                              
                              {/* Prominent date */}
                              <div className="text-lg font-semibold text-gray-800 mb-2">
                                {formatDate(transaction.transactionDate)}
                              </div>

                              {/* Amount */}
                              <div className={`text-2xl font-bold ${getAmountColor(transaction.amount)}`}>
                                {formatCurrency(transaction.amount)}
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Right Column - Actions & Details */}
                        <div className="space-y-3">
                          {/* Category status for processed transactions */}
                          {transaction.categoryName && (
                            <div className="text-green-600 font-medium bg-green-50 px-3 py-2 rounded">
                              ✓ Categorised as: {categories.find(c => c.id === transaction.categoryId)?.icon} {transaction.categoryName}
                            </div>
                          )}

                          {/* Split transaction status */}
                          {splitAssignments.has(transaction.id) && (
                            <div className="text-green-600 font-medium bg-green-50 px-3 py-2 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <span>✓ Split into {splitAssignments.get(transaction.id)!.length} categories:</span>
                              </div>
                              <div className="space-y-1 text-sm">
                                {splitAssignments.get(transaction.id)!.map((split, index) => {
                                  const category = categories.find(c => c.id === split.categoryId);
                                  return (
                                    <div key={index} className="flex justify-between items-center">
                                      <span>
                                        {category?.icon && `${category.icon} `}{category?.name}
                                        {split.description && split.description !== transaction.counterParty && (
                                          <span className="text-gray-600 ml-1">({split.description})</span>
                                        )}
                                      </span>
                                      <span className="font-mono">
                                        {formatCurrency(split.amount)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Potential duplicate warning */}
                          {transaction.status === 'PotentialDuplicate' && (
                            <div className="bg-orange-100 border border-orange-200 rounded p-3 text-sm text-orange-800">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong>Potential Duplicate:</strong> A similar transaction already exists for the same amount, date, and counter party. Please review carefully before approving.
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action buttons */}
                          {(transaction.status === 'Pending' || transaction.status === 'PotentialDuplicate') && (
                            <>
                              {splittingTransactions.has(transaction.id) ? (
                                <TransactionSplitter
                                  originalAmount={transaction.amount}
                                  categories={categories}
                                  onSplitComplete={(splits) => handleSplitComplete(transaction.id, splits)}
                                  onCancel={() => handleCancelSplit(transaction.id)}
                                  isProcessing={isProcessing}
                                  defaultDescription={transaction.counterParty}
                                />
                              ) : (
                                <div className="space-y-3">
                                  {/* Description Input */}
                                  <div>
                                    <label className="text-sm text-gray-600 block mb-1">
                                      Description (optional)
                                    </label>
                                    <Input
                                      type="text"
                                      placeholder={transaction.counterParty}
                                      value={customDescriptions.get(transaction.id) || ""}
                                      onChange={(e) => updateCustomDescription(transaction.id, e.target.value)}
                                      disabled={isProcessing}
                                      className="text-sm"
                                    />
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-3">
                                    <select
                                      onChange={(e) => {
                                        const categoryId = Number(e.target.value);
                                        if (categoryId) {
                                          handleApproveTransaction(transaction.id, categoryId);
                                        }
                                      }}
                                      disabled={isProcessing}
                                      className="flex-1 border rounded px-3 py-2"
                                      defaultValue=""
                                    >
                                      <option value="">Approve as...</option>
                                      {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                          {category.icon && `${category.icon} `}{category.name}
                                        </option>
                                      ))}
                                    </select>
                                    
                                    <Button
                                      onClick={() => handleSplitTransaction(transaction.id)}
                                      disabled={isProcessing}
                                      variant="outline"
                                      size="default"
                                      className="px-4"
                                    >
                                      <Split className="h-4 w-4 mr-2" />
                                      Split
                                    </Button>
                                    
                                    <Button
                                      onClick={() => handleRejectTransaction(transaction.id)}
                                      disabled={isProcessing}
                                      variant="destructive"
                                      size="default"
                                      className="px-4"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Show details toggle */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTransactionExpanded(transaction.id)}
                            className="w-full"
                          >
                            {expandedTransactions.has(transaction.id) ? (
                              <>
                                Hide details <ChevronUp className="h-4 w-4 ml-2" />
                              </>
                            ) : (
                              <>
                                More details <ChevronDown className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>

                          {/* Expanded details */}
                          {expandedTransactions.has(transaction.id) && (
                            <div className="bg-gray-50 rounded p-3 text-sm space-y-2">
                              <div>
                                <span className="text-gray-500 font-medium">Type:</span>
                                <span className="ml-2">{transaction.type}</span>
                              </div>
                              {transaction.externalSpendingCategory && (
                                <div>
                                  <span className="text-gray-500 font-medium">Bank Category:</span>
                                  <span className="ml-2">{transaction.externalSpendingCategory}</span>
                                </div>
                              )}
                              {transaction.notes && (
                                <div>
                                  <span className="text-gray-500 font-medium">Notes:</span>
                                  <span className="ml-2">{transaction.notes}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mobile Layout: Single Column */}
                      <div className="md:hidden space-y-4">
                        {/* Transaction Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">{transaction.counterParty}</h3>
                              {getStatusBadge(transaction.status)}
                              {transaction.status === 'Duplicate' && (
                                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                              )}
                              {transaction.status === 'PotentialDuplicate' && (
                                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                              )}
                            </div>
                            
                            {/* Date - prominent on mobile */}
                            <div className="text-sm font-medium text-gray-600 mb-1">
                              {formatDate(transaction.transactionDate)}
                            </div>
                            
                            {/* Reference if different */}
                            {transaction.reference && transaction.reference !== transaction.counterParty && (
                              <p className="text-xs text-gray-500 truncate">
                                {transaction.reference}
                              </p>
                            )}
                          </div>
                          
                          {/* Amount */}
                          <div className={`text-lg font-bold ${getAmountColor(transaction.amount)} ml-2`}>
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>

                        {/* Category status for processed transactions */}
                        {transaction.categoryName && (
                          <div className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                            ✓ Categorised as: {categories.find(c => c.id === transaction.categoryId)?.icon} {transaction.categoryName}
                          </div>
                        )}

                        {/* Split transaction status - mobile */}
                        {splitAssignments.has(transaction.id) && (
                          <div className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                            <div className="mb-1">
                              ✓ Split into {splitAssignments.get(transaction.id)!.length} categories:
                            </div>
                            <div className="space-y-1 text-xs">
                              {splitAssignments.get(transaction.id)!.map((split, index) => {
                                const category = categories.find(c => c.id === split.categoryId);
                                return (
                                  <div key={index} className="flex justify-between items-center">
                                    <span>
                                      {category?.icon && `${category.icon} `}{category?.name}
                                      {split.description && split.description !== transaction.counterParty && (
                                        <span className="text-gray-600 ml-1">({split.description})</span>
                                      )}
                                    </span>
                                    <span className="font-mono">
                                      {formatCurrency(split.amount)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Potential duplicate warning - mobile */}
                        {transaction.status === 'PotentialDuplicate' && (
                          <div className="bg-orange-100 border border-orange-200 rounded p-2 text-xs text-orange-800">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>Potential Duplicate:</strong> Similar transaction already exists. Review carefully before approving.
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Mobile Actions */}
                        {(transaction.status === 'Pending' || transaction.status === 'PotentialDuplicate') && (
                          <>
                            {splittingTransactions.has(transaction.id) ? (
                              <TransactionSplitter
                                originalAmount={transaction.amount}
                                categories={categories}
                                onSplitComplete={(splits) => handleSplitComplete(transaction.id, splits)}
                                onCancel={() => handleCancelSplit(transaction.id)}
                                isProcessing={isProcessing}
                                defaultDescription={transaction.counterParty}
                              />
                            ) : (
                              <div className="space-y-2">
                                {/* Description Input */}
                                <div>
                                  <label className="text-xs text-gray-600 block mb-1">
                                    Description (optional)
                                  </label>
                                  <Input
                                    type="text"
                                    placeholder={transaction.counterParty}
                                    value={customDescriptions.get(transaction.id) || ""}
                                    onChange={(e) => updateCustomDescription(transaction.id, e.target.value)}
                                    disabled={isProcessing}
                                    className="text-sm"
                                  />
                                </div>

                                <select
                                  onChange={(e) => {
                                    const categoryId = Number(e.target.value);
                                    if (categoryId) {
                                      handleApproveTransaction(transaction.id, categoryId);
                                    }
                                  }}
                                  disabled={isProcessing}
                                  className="w-full text-sm border rounded px-3 py-2"
                                  defaultValue=""
                                >
                                  <option value="">Approve as...</option>
                                  {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                      {category.icon && `${category.icon} `}{category.name}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleSplitTransaction(transaction.id)}
                                    disabled={isProcessing}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    <Split className="h-3 w-3 mr-1" />
                                    Split
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleTransactionExpanded(transaction.id)}
                                    className="flex-1"
                                  >
                                    {expandedTransactions.has(transaction.id) ? (
                                      <>
                                        Hide <ChevronUp className="h-3 w-3 ml-1" />
                                      </>
                                    ) : (
                                      <>
                                        More <ChevronDown className="h-3 w-3 ml-1" />
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectTransaction(transaction.id)}
                                    disabled={isProcessing}
                                    variant="destructive"
                                    size="sm"
                                    className="px-3"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Mobile expanded details */}
                        {expandedTransactions.has(transaction.id) && (
                          <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                            <div>
                              <span className="text-gray-500 font-medium">Type:</span>
                              <span className="ml-2">{transaction.type}</span>
                            </div>
                            {transaction.externalSpendingCategory && (
                              <div>
                                <span className="text-gray-500 font-medium">Bank Category:</span>
                                <span className="ml-2">{transaction.externalSpendingCategory}</span>
                              </div>
                            )}
                            {transaction.notes && (
                              <div>
                                <span className="text-gray-500 font-medium">Notes:</span>
                                <span className="ml-2">{transaction.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Loading skeletons for infinite scroll */}
                {isLoadingMore && (
                  <div className="space-y-4 pt-4">
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AccountRequiredWrapper>
  );
}