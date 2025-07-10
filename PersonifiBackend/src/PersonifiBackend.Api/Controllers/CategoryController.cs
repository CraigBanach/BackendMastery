using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Exceptions;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Controllers
{
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

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id, _userContext.UserId);
            if (category == null)
                return NotFound();
            return Ok(category);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetUserCategories()
        {
            var categories = await _categoryService.GetUserCategoriesAsync(_userContext.UserId);
            return Ok(categories);
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryDto dto)
        {
            _logger.LogInformation(
                "Creating category for user {UserId}: {@Category}",
                _userContext.UserId,
                dto
            );

            try
            {
                var created = await _categoryService.CreateAsync(dto, _userContext.UserId);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (CategoryAlreadyExistsException ex)
            {
                _logger.LogWarning(
                    ex,
                    "Category creation failed for user {UserId}: {@Category}",
                    _userContext.UserId,
                    dto
                );
                return Conflict(new { message = "Category already exists." });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "An error occurred while creating category for user {UserId}: {@Category}",
                    _userContext.UserId,
                    dto
                );
                return StatusCode(
                    500,
                    new { message = "An error occurred while creating the category." }
                );
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> Update(
            int id,
            [FromBody] UpdateCategoryDto dto
        )
        {
            _logger.LogInformation(
                "Updating category {CategoryId} for user {UserId}: {@Category}",
                id,
                _userContext.UserId,
                dto
            );
            var updated = await _categoryService.UpdateAsync(id, dto, _userContext.UserId);
            if (updated == null)
                return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            _logger.LogInformation(
                "Deleting category {CategoryId} for user {UserId}",
                id,
                _userContext.UserId
            );
            var deleted = await _categoryService.DeleteAsync(id, _userContext.UserId);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
