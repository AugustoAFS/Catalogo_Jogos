using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class GameDto
    {
        public int Id_Game { get; set; }
        public string Name_Game { get; set; }
        public string Description_Game { get; set; }
        public string Category_Game { get; set; }
        public string Image_Url { get; set; }
        public decimal Price_Game { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
    }

    public class CreateGameDto
    {
        public string Name_Game { get; set; }
        public string Description_Game { get; set; }
        public string Category_Game { get; set; }
        public string? Image_Url { get; set; }
        public decimal Price_Game { get; set; }
    }

    public class UpdateGameDto
    {
        public string? Name_Game { get; set; }
        public string? Description_Game { get; set; }
        public string? Category_Game { get; set; }
        public string? Image_Url { get; set; }
        public decimal? Price_Game { get; set; }
    }
} 