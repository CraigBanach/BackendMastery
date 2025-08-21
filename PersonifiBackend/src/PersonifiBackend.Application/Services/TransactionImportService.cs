using System.Globalization;
using Microsoft.AspNetCore.Http;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Application.Services;

public class TransactionImportService : ITransactionImportService
{
    private readonly IPendingTransactionRepository _pendingTransactionRepository;
    private readonly ITransactionImportRepository _transactionImportRepository;
    private readonly ITransactionRepository _transactionRepository;

    public TransactionImportService(
        IPendingTransactionRepository pendingTransactionRepository,
        ITransactionImportRepository transactionImportRepository,
        ITransactionRepository transactionRepository)
    {
        _pendingTransactionRepository = pendingTransactionRepository;
        _transactionImportRepository = transactionImportRepository;
        _transactionRepository = transactionRepository;
    }

    public async Task<TransactionImportDto> ImportTransactionsFromCsvAsync(IFormFile file, int accountId, int userId)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is required");

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Only CSV files are supported");

        var transactionImport = new TransactionImport
        {
            FileName = file.FileName,
            AccountId = accountId,
            ImportedByUserId = userId,
            Status = TransactionImportStatus.Processing
        };

        await _transactionImportRepository.CreateAsync(transactionImport);

        try
        {
            var pendingTransactions = await ParseCsvFileAsync(file, transactionImport.Id, accountId, userId);
            
            // Detect potential duplicates against approved transactions only
            var duplicateCount = 0;
            var potentialDuplicateCount = 0;
            foreach (var transaction in pendingTransactions)
            {
                // Check against existing approved transactions with exact matching
                var existingDuplicates = await _transactionRepository.FindExactDuplicatesAsync(
                    accountId, transaction.Amount, transaction.TransactionDate, transaction.CounterParty);

                if (existingDuplicates.Any())
                {
                    transaction.Status = PendingTransactionStatus.PotentialDuplicate;
                    potentialDuplicateCount++;
                }
            }

            await _pendingTransactionRepository.CreateRangeAsync(pendingTransactions);

            transactionImport.TotalTransactions = pendingTransactions.Count;
            transactionImport.DuplicateTransactions = potentialDuplicateCount;
            transactionImport.ProcessedTransactions = pendingTransactions.Count;
            transactionImport.Status = TransactionImportStatus.Completed;
            transactionImport.CompletedAt = DateTime.UtcNow;

            await _transactionImportRepository.UpdateAsync(transactionImport);

            return MapToDto(transactionImport);
        }
        catch (Exception)
        {
            transactionImport.Status = TransactionImportStatus.Failed;
            await _transactionImportRepository.UpdateAsync(transactionImport);
            throw;
        }
    }

    private async Task<List<PendingTransaction>> ParseCsvFileAsync(IFormFile file, int transactionImportId, int accountId, int userId)
    {
        var pendingTransactions = new List<PendingTransaction>();
        
        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync();
        
        if (string.IsNullOrEmpty(headerLine))
            throw new ArgumentException("CSV file appears to be empty");

        var headers = headerLine.Split(',');
        
        // Validate expected headers for Starling Bank format
        var expectedHeaders = new[] { "Date", "Counter Party", "Reference", "Type", "Amount (GBP)", "Balance (GBP)", "Spending Category", "Notes" };
        
        string? line;
        var lineNumber = 2;
        
        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (string.IsNullOrWhiteSpace(line))
                continue;

            try
            {
                var fields = ParseCsvLine(line);
                
                if (fields.Length < 8)
                    continue;

                var rawAmount = ParseAmount(fields[4]);
                
                var pendingTransaction = new PendingTransaction
                {
                    TransactionImportId = transactionImportId,
                    AccountId = accountId,
                    ImportedByUserId = userId,
                    ExternalTransactionId = $"{transactionImportId}-{lineNumber}",
                    TransactionDate = ParseDate(fields[0]),
                    CounterParty = fields[1].Trim(),
                    Reference = fields[2].Trim(),
                    Type = fields[3].Trim(),
                    Amount = -rawAmount, // Invert amount: negative bank balance = positive expense
                    Balance = ParseAmount(fields[5]),
                    ExternalSpendingCategory = fields[6].Trim(),
                    Notes = fields[7].Trim(),
                    Description = !string.IsNullOrEmpty(fields[1].Trim()) ? fields[1].Trim() : fields[2].Trim(),
                    Status = PendingTransactionStatus.Pending,
                    RawData = line
                };

                pendingTransactions.Add(pendingTransaction);
            }
            catch (Exception ex)
            {
                // Log parsing error but continue with other records
                // You could add to an errors collection if needed
            }

            lineNumber++;
        }

        return pendingTransactions;
    }

    private string[] ParseCsvLine(string line)
    {
        var fields = new List<string>();
        var current = new System.Text.StringBuilder();
        var inQuotes = false;
        
        for (int i = 0; i < line.Length; i++)
        {
            var c = line[i];
            
            if (c == '"')
            {
                inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                fields.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }
        
        fields.Add(current.ToString());
        return fields.ToArray();
    }

    private DateTime ParseDate(string dateStr)
    {
        if (DateTime.TryParseExact(dateStr, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            return date;
        
        if (DateTime.TryParse(dateStr, out date))
            return date;
            
        throw new ArgumentException($"Unable to parse date: {dateStr}");
    }

    private decimal ParseAmount(string amountStr)
    {
        if (string.IsNullOrEmpty(amountStr))
            return 0;
            
        if (decimal.TryParse(amountStr, NumberStyles.Currency, CultureInfo.InvariantCulture, out var amount))
            return amount;
            
        if (decimal.TryParse(amountStr, out amount))
            return amount;
            
        throw new ArgumentException($"Unable to parse amount: {amountStr}");
    }

    public async Task<PaginationResult<PendingTransactionDto>> GetPendingTransactionsAsync(int accountId, int page = 1, int pageSize = 20)
    {
        var transactions = await _pendingTransactionRepository.GetByAccountIdAsync(accountId, page, pageSize);
        var totalCount = await _pendingTransactionRepository.GetCountByAccountIdAsync(accountId);
        
        var dtos = transactions.Select(MapPendingTransactionToDto).ToList();
        
        return new PaginationResult<PendingTransactionDto>(dtos, totalCount);
    }

    public async Task<PendingTransactionDto?> GetPendingTransactionByIdAsync(int id, int accountId)
    {
        var transaction = await _pendingTransactionRepository.GetByIdAsync(id, accountId);
        return transaction == null ? null : MapPendingTransactionToDto(transaction);
    }

    public async Task<bool> ApprovePendingTransactionAsync(int id, int accountId, ApprovePendingTransactionRequest request)
    {
        var pendingTransaction = await _pendingTransactionRepository.GetByIdAsync(id, accountId);
        if (pendingTransaction == null || pendingTransaction.Status != PendingTransactionStatus.Pending)
            return false;

        // Create actual transaction
        var transaction = new Transaction
        {
            AccountId = accountId,
            Amount = pendingTransaction.Amount,
            Description = pendingTransaction.Description,
            TransactionDate = pendingTransaction.TransactionDate,
            CategoryId = request.CategoryId,
            CreatedByUserId = pendingTransaction.ImportedByUserId,
            Notes = request.Notes ?? pendingTransaction.Notes
        };

        await _transactionRepository.CreateAsync(transaction);

        // Update pending transaction status
        pendingTransaction.Status = PendingTransactionStatus.Approved;
        pendingTransaction.CategoryId = request.CategoryId;
        await _pendingTransactionRepository.UpdateAsync(pendingTransaction);

        return true;
    }

    public async Task<bool> RejectPendingTransactionAsync(int id, int accountId)
    {
        var pendingTransaction = await _pendingTransactionRepository.GetByIdAsync(id, accountId);
        if (pendingTransaction == null || pendingTransaction.Status != PendingTransactionStatus.Pending)
            return false;

        pendingTransaction.Status = PendingTransactionStatus.Rejected;
        await _pendingTransactionRepository.UpdateAsync(pendingTransaction);

        return true;
    }

    public async Task<int> BulkApproveTransactionsAsync(int accountId, BulkApproveTransactionsRequest request)
    {
        var approvedCount = 0;
        
        foreach (var transactionId in request.TransactionIds)
        {
            var approveRequest = new ApprovePendingTransactionRequest
            {
                CategoryId = request.DefaultCategoryId ?? 1, // You might want to handle this better
                Notes = null
            };
            
            var success = await ApprovePendingTransactionAsync(transactionId, accountId, approveRequest);
            if (success)
                approvedCount++;
        }
        
        return approvedCount;
    }

    public async Task<int> BulkRejectTransactionsAsync(int accountId, BulkRejectTransactionsRequest request)
    {
        var rejectedCount = 0;
        
        foreach (var transactionId in request.TransactionIds)
        {
            var success = await RejectPendingTransactionAsync(transactionId, accountId);
            if (success)
                rejectedCount++;
        }
        
        return rejectedCount;
    }

    public async Task<List<TransactionImportDto>> GetImportHistoryAsync(int accountId)
    {
        var imports = await _transactionImportRepository.GetByAccountIdAsync(accountId);
        return imports.Select(MapToDto).ToList();
    }

    private TransactionImportDto MapToDto(TransactionImport import)
    {
        return new TransactionImportDto
        {
            Id = import.Id,
            FileName = import.FileName,
            TotalTransactions = import.TotalTransactions,
            ProcessedTransactions = import.ProcessedTransactions,
            ApprovedTransactions = import.ApprovedTransactions,
            RejectedTransactions = import.RejectedTransactions,
            DuplicateTransactions = import.DuplicateTransactions,
            Status = import.Status.ToString(),
            CreatedAt = import.CreatedAt,
            CompletedAt = import.CompletedAt
        };
    }

    private PendingTransactionDto MapPendingTransactionToDto(PendingTransaction transaction)
    {
        return new PendingTransactionDto
        {
            Id = transaction.Id,
            Amount = transaction.Amount,
            Description = transaction.Description,
            CounterParty = transaction.CounterParty,
            Reference = transaction.Reference,
            Type = transaction.Type,
            Balance = transaction.Balance,
            ExternalSpendingCategory = transaction.ExternalSpendingCategory,
            Notes = transaction.Notes,
            TransactionDate = transaction.TransactionDate,
            Status = transaction.Status.ToString(),
            CategoryId = transaction.CategoryId,
            CategoryName = transaction.Category?.Name,
            CreatedAt = transaction.CreatedAt
        };
    }
}