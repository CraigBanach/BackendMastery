using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(
            ICategoryService categoryService,
            ILogger<CategoryController> logger
        )
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetById(int id)
        {
            var userId = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var category = await _categoryService.GetByIdAsync(id, userId);
            if (category == null)
                return NotFound();
            return Ok(category);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetUserCategories()
        {
            var userId = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var categories = await _categoryService.GetUserCategoriesAsync(userId);
            return Ok(categories);
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryDto dto)
        {
            var userId = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            _logger.LogInformation("Creating category for user {UserId}: {@Category}", userId, dto);
            var created = await _categoryService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> Update(
            int id,
            [FromBody] UpdateCategoryDto dto
        )
        {
            var userId = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            _logger.LogInformation(
                "Updating category {CategoryId} for user {UserId}: {@Category}",
                id,
                userId,
                dto
            );
            var updated = await _categoryService.UpdateAsync(id, dto, userId);
            if (updated == null)
                return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var userId = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            _logger.LogInformation("Deleting category {CategoryId} for user {UserId}", id, userId);
            var deleted = await _categoryService.DeleteAsync(id, userId);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
