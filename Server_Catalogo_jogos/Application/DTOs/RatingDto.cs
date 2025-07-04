using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class RatingDto
    {
        public int Id_Rating { get; set; }
        public int Id_Game { get; set; }
        public int Id_User { get; set; }
        public int Rating_Value { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime Created_At { get; set; }
        public DateTime? Updated_At { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string GameName { get; set; } = string.Empty;
    }

    public class GameRatingSummaryDto
    {
        public int Id_Game { get; set; }
        public string GameName { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public List<RatingDto> Ratings { get; set; } = new List<RatingDto>();
    }

    public class CreateRatingDto
    {
        [Required]
        public int Id_Game { get; set; }
        
        [Required]
        public int Id_User { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int Rating_Value { get; set; }
        
        [StringLength(500)]
        public string? Comment { get; set; }
    }

    public class UpdateRatingDto
    {
        [Required]
        [Range(1, 5)]
        public int Rating_Value { get; set; }
        
        [StringLength(500)]
        public string? Comment { get; set; }
    }
} 