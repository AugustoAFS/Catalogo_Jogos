using System.ComponentModel.DataAnnotations;

namespace Core.Entities
{
    public class Game
    {
        public int Id_Game { get; set; }
        public string Name_Game { get; set; }
        public string Description_Game { get; set; }
        public string Category_Game { get; set; }
        public string Image_Url { get; set; }
        public decimal Price_Game { get; set; }
    }
}
