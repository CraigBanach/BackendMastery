using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Controllers
{
    /// <summary>
    /// Bucket management endpoints for authenticated users
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class BucketController : ControllerBase
    {
        private readonly IBucketService _bucketService;
        private readonly IUserContext _userContext;
        private readonly ILogger<BucketController> _logger;

        public BucketController(
            IBucketService bucketService,
            IUserContext userContext,
            ILogger<BucketController> logger
        )
        {
            _bucketService = bucketService;
            _userContext = userContext;
            _logger = logger;
        }

        /// <summary>
        /// Gets a specific bucket by ID for the authenticated user
        /// </summary>
        /// <param name="id">The bucket ID</param>
        /// <returns>The bucket details</returns>
        /// <response code="200">Returns the bucket</response>
        /// <response code="404">Bucket not found</response>
        [HttpGet("{id}")]
        public async Task<ActionResult<BucketDto>> GetById(int id)
        {
            if (!_userContext.AccountId.HasValue)
                return BadRequest("Please create an account first using POST /api/account/create");

            var bucket = await _bucketService.GetByIdAsync(id, _userContext.AccountId.Value);
            if (bucket == null)
                return NotFound();
            return Ok(bucket);
        }

        /// <summary>
        /// Gets all buckets for the authenticated user
        /// </summary>
        /// <returns>List of user's buckets</returns>
        /// <response code="200">Returns the list of buckets</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BucketDto>>> GetAccountBuckets()
        {
            if (!_userContext.AccountId.HasValue)
                return BadRequest("Please create an account first using POST /api/account/create");

            var buckets = await _bucketService.GetAccountBucketsAsync(_userContext.AccountId.Value);
            return Ok(buckets);
        }

        /// <summary>
        /// Creates a new bucket for the authenticated user
        /// </summary>
        /// <param name="dto">Bucket details</param>
        /// <returns>The created bucket with assigned ID</returns>
        /// <response code="201">Bucket created successfully</response>
        /// <response code="400">Invalid bucket data</response>
        [HttpPost]
        public async Task<ActionResult<BucketDto>> Create([FromBody] CreateBucketDto dto)
        {
            if (!_userContext.AccountId.HasValue)
                return BadRequest("Please create an account first using POST /api/account/create");

            _logger.LogInformation(
                "Creating bucket for account {AccountId} with name {BucketName}",
                _userContext.AccountId.Value,
                dto.Name
            );

            var created = await _bucketService.CreateAsync(dto, _userContext.AccountId.Value);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Updates an existing bucket for the authenticated user
        /// </summary>
        /// <param name="id">The bucket ID to update</param>
        /// <param name="dto">Updated bucket details</param>
        /// <returns>The updated bucket</returns>
        /// <response code="200">Bucket updated successfully</response>
        /// <response code="404">Bucket not found</response>
        /// <response code="400">Invalid bucket data</response>
        [HttpPut("{id}")]
        public async Task<ActionResult<BucketDto>> Update(
            int id,
            [FromBody] UpdateBucketDto dto
        )
        {
            if (!_userContext.AccountId.HasValue)
                return BadRequest("Please create an account first using POST /api/account/create");

            _logger.LogInformation(
                "Updating bucket {BucketId} for account {AccountId} with name {BucketName}",
                id,
                _userContext.AccountId.Value,
                dto.Name
            );
            var updated = await _bucketService.UpdateAsync(id, dto, _userContext.AccountId.Value);
            if (updated == null)
                return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Deletes a bucket for the authenticated user
        /// </summary>
        /// <param name="id">The bucket ID to delete</param>
        /// <returns>No content on success</returns>
        /// <response code="204">Bucket deleted successfully</response>
        /// <response code="404">Bucket not found</response>
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            if (!_userContext.AccountId.HasValue)
                return BadRequest("Please create an account first using POST /api/account/create");

            _logger.LogInformation(
                "Deleting bucket {BucketId} for account {AccountId}",
                id,
                _userContext.AccountId.Value
            );
            var deleted = await _bucketService.DeleteAsync(id, _userContext.AccountId.Value);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
