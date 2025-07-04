using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class UserDto
    {
        public int Id_User { get; set; }
        public string Name_User { get; set; }
        public string Email_User { get; set; }
        public string Password_User { get; set; }
        public int Id_Role { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }

    public class RegisterDto
    {
        public string Name_User { get; set; }
        public string Email_User { get; set; }
        public string Password_User { get; set; }
        public int Id_Role { get; set; }
    }

    public class CreateUserDto
    {
        public string Name_User { get; set; }
        public string Email_User { get; set; }
        public string Password_User { get; set; }
        public int Id_Role { get; set; }
    }

    public class UpdateUserDto
    {
        public string Name_User { get; set; }
        public string Email_User { get; set; }
        public string Password_User { get; set; }
    }

    public class DeleteUserDto
    {
        public int Id_User { get; set; }
    }

    public class LoginDto
    {
        public string Email_User { get; set; }
        public string Password_User { get; set; }
    }
} 