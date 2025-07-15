using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Exceptions;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Controllers
{
    /// <summary>
    /// Category management endpoints for authenticated users
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly IUserContext _userContext;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(
            ICategoryService categoryService,
            IUserContext userContext,
            ILogger<CategoryController> logger
        )
        {
            _categoryService = categoryService;
            _userContext = userContext;
            _logger = logger;
        }

        /// <summary>
        /// Gets a specific category by ID for the authenticated user
        /// </summary>
        /// <param name="id">The category ID</param>
        /// <returns>The category details</returns>
        /// <response code="200">Returns the category</response>
        /// <response code="404">Category not found</response>
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id, _userContext.UserId);
            if (category == null)
                return NotFound();
            return Ok(category);
        }

        /// <summary>
        /// Gets all categories for the authenticated user
        /// </summary>
        /// <returns>List of user's categories</returns>
        /// <response code="200">Returns the list of categories</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetUserCategories()
        {
            var categories = await _categoryService.GetUserCategoriesAsync(_userContext.UserId);
            return Ok(categories);
        }

        /// <summary>
        /// Creates a new category for the authenticated user
        /// </summary>
        /// <param name="dto">Category details</param>
        /// <returns>The created category with assigned ID</returns>
        /// <response code="201">Category created successfully</response>
        /// <response code="400">Invalid category data</response>
        /// <response code="409">Category name already exists</response>
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryDto dto)
        {
            _logger.LogInformation(
                "Creating category for authenticated user with name {CategoryName}",
                dto.Name
            );

            var created = await _categoryService.CreateAsync(dto, _userContext.UserId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Updates an existing category for the authenticated user
        /// </summary>
        /// <param name="id">The category ID to update</param>
        /// <param name="dto">Updated category details</param>
        /// <returns>The updated category</returns>
        /// <response code="200">Category updated successfully</response>
        /// <response code="404">Category not found</response>
        /// <response code="400">Invalid category data</response>
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> Update(
            int id,
            [FromBody] UpdateCategoryDto dto
        )
        {
            _logger.LogInformation(
                "Updating category {CategoryId} for authenticated user with name {CategoryName}",
                id,
                dto.Name
            );
            var updated = await _categoryService.UpdateAsync(id, dto, _userContext.UserId);
            if (updated == null)
                return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Deletes a category for the authenticated user
        /// </summary>
        /// <param name="id">The category ID to delete</param>
        /// <returns>No content on success</returns>
        /// <response code="204">Category deleted successfully</response>
        /// <response code="404">Category not found</response>
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            _logger.LogInformation(
                "Deleting category {CategoryId} for authenticated user",
                id
            );
            var deleted = await _categoryService.DeleteAsync(id, _userContext.UserId);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
