using System.ComponentModel.DataAnnotations;

namespace PersonifiBackend.Core.Entities
{
    public class Subscription
    {
        public int Id { get; set; }
        
        [Required]
        public int OwnerUserId { get; set; }
        
        [Required]
        public int AccountId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public User OwnerUser { get; set; } = null!;
        public Account Account { get; set; } = null!;
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}