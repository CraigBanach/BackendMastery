using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Api.DTOs;

public class ImportTransactionsRequest
{
    public IFormFile File { get; set; } = null!;
}

public class CsvPreviewRequest
{
    public IFormFile File { get; set; } = null!;
}

public class ImportTransactionsWithMappingRequest
{
    public IFormFile File { get; set; } = null!;
    public CsvColumnMapping Mapping { get; set; } = null!;
}