using System.ComponentModel.DataAnnotations;

namespace Core.Entities
{
    public class Rating
    {
        public int Id_Rating { get; set; }
        public int Id_Game { get; set; }
        public int Id_User { get; set; }
        public int Rating_Value { get; set; }
        public string Comment { get; set; }

        public DateTime Created_At { get; set; } = DateTime.Now;
        public DateTime? Updated_At { get; set; }
    }
} 