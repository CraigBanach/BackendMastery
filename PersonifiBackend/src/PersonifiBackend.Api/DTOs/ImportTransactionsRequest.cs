namespace PersonifiBackend.Api.DTOs;

public class ImportTransactionsRequest
{
    public IFormFile File { get; set; } = null!;
}