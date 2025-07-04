using System.ComponentModel.DataAnnotations;

namespace Core.Entities
{
    public class Cart
    {
        public int Id_Cart { get; set; }
        public int Id_User { get; set; }
        public int Id_Game { get; set; }
        public int Quantity_Cart { get; set; }
        
        public DateTime Added_At { get; set; } = DateTime.Now;

        // Propriedades de navegação
        public virtual Game Game { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
