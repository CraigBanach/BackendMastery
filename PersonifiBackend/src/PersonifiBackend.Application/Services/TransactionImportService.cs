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
    private readonly ICategoryRepository _categoryRepository;

    public TransactionImportService(
        IPendingTransactionRepository pendingTransactionRepository,
        ITransactionImportRepository transactionImportRepository,
        ITransactionRepository transactionRepository,
        ICategoryRepository categoryRepository)
    {
        _pendingTransactionRepository = pendingTransactionRepository;
        _transactionImportRepository = transactionImportRepository;
        _transactionRepository = transactionRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<CsvPreviewResponse> PreviewCsvAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is required");

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Only CSV files are supported");

        using var reader = new StreamReader(file.OpenReadStream());
        
        var headerLine = await reader.ReadLineAsync();
        if (string.IsNullOrEmpty(headerLine))
            throw new ArgumentException("CSV file appears to be empty");

        var headers = ParseCsvLine(headerLine);
        var previewRows = new List<List<string>>();
        var totalRows = 0;
        
        // Read up to 5 preview rows
        string? line;
        while ((line = await reader.ReadLineAsync()) != null && previewRows.Count < 5)
        {
            totalRows++;
            if (string.IsNullOrWhiteSpace(line))
                continue;
                
            var fields = ParseCsvLine(line);
            previewRows.Add(fields.ToList());
        }
        
        // Count remaining rows
        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (!string.IsNullOrWhiteSpace(line))
                totalRows++;
        }

        return new CsvPreviewResponse
        {
            Headers = headers.ToList(),
            PreviewRows = previewRows,
            TotalRows = totalRows
        };
    }

    public async Task<TransactionImportDto> ImportTransactionsFromCsvWithMappingAsync(IFormFile file, CsvColumnMapping mapping, int accountId, int userId)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is required");

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Only CSV files are supported");

        if (string.IsNullOrEmpty(mapping.DateColumn) || string.IsNullOrEmpty(mapping.DescriptionColumn) || string.IsNullOrEmpty(mapping.AmountColumn))
            throw new ArgumentException("Date, Description, and Amount columns must be specified");

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
            var pendingTransactions = await ParseCsvFileWithMappingAsync(file, mapping, transactionImport.Id, accountId, userId);
            
            // Detect potential duplicates against approved transactions only
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

    public async Task<TransactionImportDto> ImportTransactionsFromCsvAsync(IFormFile file, int accountId, int userId)
    {
        // Use default Starling Bank mapping for backwards compatibility
        var starlingMapping = new CsvColumnMapping
        {
            DateColumn = "Date",
            DescriptionColumn = "Counter Party",
            AmountColumn = "Amount (GBP)",
            ExpensesArePositive = true
        };
        
        return await ImportTransactionsFromCsvWithMappingAsync(file, starlingMapping, accountId, userId);
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
            catch (Exception)
            {
                // Log parsing error but continue with other records
                // You could add to an errors collection if needed
            }

            lineNumber++;
        }

        return pendingTransactions;
    }

    private async Task<List<PendingTransaction>> ParseCsvFileWithMappingAsync(IFormFile file, CsvColumnMapping mapping, int transactionImportId, int accountId, int userId)
    {
        var pendingTransactions = new List<PendingTransaction>();
        
        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync();
        
        if (string.IsNullOrEmpty(headerLine))
            throw new ArgumentException("CSV file appears to be empty");

        var headers = ParseCsvLine(headerLine);
        
        // Find column indexes based on mapping
        var dateIndex = Array.IndexOf(headers, mapping.DateColumn);
        var descriptionIndex = Array.IndexOf(headers, mapping.DescriptionColumn);
        var amountIndex = Array.IndexOf(headers, mapping.AmountColumn);
        
        if (dateIndex == -1)
            throw new ArgumentException($"Date column '{mapping.DateColumn}' not found in CSV headers");
        if (descriptionIndex == -1)
            throw new ArgumentException($"Description column '{mapping.DescriptionColumn}' not found in CSV headers");
        if (amountIndex == -1)
            throw new ArgumentException($"Amount column '{mapping.AmountColumn}' not found in CSV headers");
        
        string? line;
        var lineNumber = 2;
        
        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (string.IsNullOrWhiteSpace(line))
                continue;

            try
            {
                var fields = ParseCsvLine(line);
                
                if (fields.Length <= Math.Max(dateIndex, Math.Max(descriptionIndex, amountIndex)))
                    continue; // Skip rows that don't have enough columns

                var rawAmount = ParseAmount(fields[amountIndex]);
                var transactionDate = ParseDateFlexible(fields[dateIndex]);
                var description = fields[descriptionIndex].Trim();
                
                // Create canonical storage: Positive = Income, Negative = Expense
                var isIncomeTransaction = mapping.ExpensesArePositive ? (rawAmount < 0) : (rawAmount > 0);
                var finalAmount = isIncomeTransaction ? Math.Abs(rawAmount) : -Math.Abs(rawAmount);
                
                var pendingTransaction = new PendingTransaction
                {
                    TransactionImportId = transactionImportId,
                    AccountId = accountId,
                    ImportedByUserId = userId,
                    ExternalTransactionId = $"{transactionImportId}-{lineNumber}",
                    TransactionDate = transactionDate,
                    CounterParty = description,
                    Reference = description, // Map description to reference as requested
                    Type = "GENERIC", // Generic type for mapped imports
                    Amount = finalAmount,
                    Balance = null, // Not mapped in simplified version
                    ExternalSpendingCategory = null, // Not mapped in simplified version
                    Notes = null, // Not mapped in simplified version
                    Description = description,
                    Status = PendingTransactionStatus.Pending,
                    RawData = line
                };

                pendingTransactions.Add(pendingTransaction);
            }
            catch (Exception)
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

    private DateTime ParseDateFlexible(string dateStr)
    {
        if (string.IsNullOrEmpty(dateStr))
            throw new ArgumentException("Date is required");
        
        // Try common date formats
        var formats = new[]
        {
            "dd/MM/yyyy",   // UK format
            "MM/dd/yyyy",   // US format
            "yyyy-MM-dd",   // ISO format
            "dd-MM-yyyy",   // Alternative UK format
            "MM-dd-yyyy",   // Alternative US format
            "d/M/yyyy",     // Single digit day/month
            "M/d/yyyy",     // Single digit month/day
            "yyyy/MM/dd"    // Alternative ISO format
        };
        
        foreach (var format in formats)
        {
            if (DateTime.TryParseExact(dateStr, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                return date;
        }
        
        // Fallback to general parsing
        if (DateTime.TryParse(dateStr, out var parsedDate))
            return parsedDate;
            
        throw new ArgumentException($"Unable to parse date '{dateStr}'. Supported formats: dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd");
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
        if (pendingTransaction == null || 
            (pendingTransaction.Status != PendingTransactionStatus.Pending && 
             pendingTransaction.Status != PendingTransactionStatus.PotentialDuplicate))
            return false;

        // Get category to determine final amount sign
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, accountId);
        if (category == null)
            return false;

        // Apply canonical storage logic: 
        // - Income (positive) → Income category = positive
        // - Income (positive) → Expense category = negative (credit)  
        // - Expense (negative) → Expense category = positive
        // - Expense (negative) → Income category = negative (debit)
        var isIncomeTransaction = pendingTransaction.Amount > 0;
        var isIncomeCategory = category.Type == CategoryType.Income;
        
        var finalAmount = (isIncomeTransaction == isIncomeCategory) 
            ? Math.Abs(pendingTransaction.Amount)  // Same type: positive
            : -Math.Abs(pendingTransaction.Amount); // Cross type: negative

        // Create actual transaction
        var transaction = new Transaction
        {
            AccountId = accountId,
            Amount = finalAmount,
            Description = request.Description ?? pendingTransaction.Description,
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

        // Update import counts
        await UpdateImportCountsAsync(pendingTransaction.TransactionImportId);

        return true;
    }

    public async Task<bool> ApprovePendingTransactionSplitAsync(int id, int accountId, ApprovePendingTransactionSplitRequest request)
    {
        var pendingTransaction = await _pendingTransactionRepository.GetByIdAsync(id, accountId);
        if (pendingTransaction == null || 
            (pendingTransaction.Status != PendingTransactionStatus.Pending && 
             pendingTransaction.Status != PendingTransactionStatus.PotentialDuplicate))
            return false;

        if (request.Splits == null || request.Splits.Count < 2)
            return false;

        // Create multiple transactions from splits
        var transactions = new List<Transaction>();
        foreach (var split in request.Splits)
        {
            // Get category to determine proper amount sign
            var category = await _categoryRepository.GetByIdAsync(split.CategoryId, accountId);
            if (category == null)
                return false;

            // Apply canonical storage logic for split transactions
            var isIncomeTransaction = pendingTransaction.Amount > 0;
            var isIncomeCategory = category.Type == CategoryType.Income;
            var finalAmount = (isIncomeTransaction == isIncomeCategory) 
                ? Math.Abs(split.Amount)  // Same type: positive
                : -Math.Abs(split.Amount); // Cross type: negative

            var transaction = new Transaction
            {
                AccountId = accountId,
                Amount = finalAmount,
                Description = split.Description ?? pendingTransaction.Description,
                TransactionDate = pendingTransaction.TransactionDate,
                CategoryId = split.CategoryId,
                CreatedByUserId = pendingTransaction.ImportedByUserId,
                Notes = pendingTransaction.Notes
            };
            
            transactions.Add(transaction);
        }

        // Create all split transactions
        foreach (var transaction in transactions)
        {
            await _transactionRepository.CreateAsync(transaction);
        }

        // Update pending transaction status
        pendingTransaction.Status = PendingTransactionStatus.Approved;
        await _pendingTransactionRepository.UpdateAsync(pendingTransaction);

        // Update import counts
        await UpdateImportCountsAsync(pendingTransaction.TransactionImportId);

        return true;
    }

    public async Task<bool> RejectPendingTransactionAsync(int id, int accountId)
    {
        var pendingTransaction = await _pendingTransactionRepository.GetByIdAsync(id, accountId);
        if (pendingTransaction == null || pendingTransaction.Status != PendingTransactionStatus.Pending)
            return false;

        pendingTransaction.Status = PendingTransactionStatus.Rejected;
        await _pendingTransactionRepository.UpdateAsync(pendingTransaction);

        // Update import counts
        await UpdateImportCountsAsync(pendingTransaction.TransactionImportId);

        return true;
    }

    public async Task<int> BulkApproveTransactionsAsync(int accountId, BulkApproveTransactionsRequest request)
    {
        var approvedCount = 0;
        var affectedImports = new HashSet<int>();
        
        foreach (var transactionId in request.TransactionIds)
        {
            var pendingTransaction = await _pendingTransactionRepository.GetByIdAsync(transactionId, accountId);
            if (pendingTransaction == null || pendingTransaction.Status != PendingTransactionStatus.Pending)
                continue;

            var approveRequest = new ApprovePendingTransactionRequest
            {
                CategoryId = request.DefaultCategoryId ?? 1,
                Notes = null
            };

            // Get category to determine correct amount sign
            var category = await _categoryRepository.GetByIdAsync(approveRequest.CategoryId, accountId);
            if (category == null)
                continue;

            // Apply canonical storage logic
            var isIncomeTransaction = pendingTransaction.Amount > 0;
            var isIncomeCategory = category.Type == CategoryType.Income;
            var finalAmount = (isIncomeTransaction == isIncomeCategory) 
                ? Math.Abs(pendingTransaction.Amount)  // Same type: positive
                : -Math.Abs(pendingTransaction.Amount); // Cross type: negative

            // Create actual transaction
            var transaction = new Transaction
            {
                AccountId = accountId,
                Amount = finalAmount,
                Description = approveRequest.Description ?? pendingTransaction.Description,
                TransactionDate = pendingTransaction.TransactionDate,
                CategoryId = approveRequest.CategoryId,
                CreatedByUserId = pendingTransaction.ImportedByUserId,
                Notes = approveRequest.Notes ?? pendingTransaction.Notes
            };

            await _transactionRepository.CreateAsync(transaction);

            // Update pending transaction status
            pendingTransaction.Status = PendingTransactionStatus.Approved;
            pendingTransaction.CategoryId = approveRequest.CategoryId;
            await _pendingTransactionRepository.UpdateAsync(pendingTransaction);

            affectedImports.Add(pendingTransaction.TransactionImportId);
            approvedCount++;
        }

        // Update import counts once per affected import
        foreach (var importId in affectedImports)
        {
            await UpdateImportCountsAsync(importId);
        }
        
        return approvedCount;
    }

    public async Task<int> BulkRejectTransactionsAsync(int accountId, BulkRejectTransactionsRequest request)
    {
        var rejectedCount = 0;
        var affectedImports = new HashSet<int>();
        
        foreach (var transactionId in request.TransactionIds)
        {
            var pendingTransaction = await _pendingTransactionRepository.GetByIdAsync(transactionId, accountId);
            if (pendingTransaction == null || pendingTransaction.Status != PendingTransactionStatus.Pending)
                continue;

            pendingTransaction.Status = PendingTransactionStatus.Rejected;
            await _pendingTransactionRepository.UpdateAsync(pendingTransaction);

            affectedImports.Add(pendingTransaction.TransactionImportId);
            rejectedCount++;
        }

        // Update import counts once per affected import
        foreach (var importId in affectedImports)
        {
            await UpdateImportCountsAsync(importId);
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

    private async Task UpdateImportCountsAsync(int transactionImportId)
    {
        var import = await _transactionImportRepository.GetByIdAsync(transactionImportId);
        if (import == null) return;

        // Count transactions by status for this import
        var pendingTransactions = await _pendingTransactionRepository.GetByImportIdAsync(transactionImportId);
        
        import.ApprovedTransactions = pendingTransactions.Count(t => t.Status == PendingTransactionStatus.Approved);
        import.RejectedTransactions = pendingTransactions.Count(t => t.Status == PendingTransactionStatus.Rejected);

        // Update the import
        await _transactionImportRepository.UpdateAsync(import);
    }
}