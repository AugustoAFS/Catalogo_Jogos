using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Application.DTOs;
using Core.Entities;
using Core.Interfaces;
using Core.Exceptions;
using System.Security.Cryptography;
using System.Text;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<UserService> _logger;

        public UserService(ApplicationDbContext context, IMapper mapper, ILogger<UserService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsers()
        {
            try
            {
                var users = await _context.Users
                    .ToListAsync();

                return users.Select(user => new UserDto
                {
                    Id_User = user.Id_User,
                    Name_User = user.Name_User,
                    Email_User = user.Email_User,
                    Password_User = user.Password_User,
                    Id_Role = user.Id_Role
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar todos os usuários");
                throw;
            }
        }

        public async Task<UserDto> GetUserById(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    throw new InvalidOperationException("Usuário não encontrado");
                }

                return new UserDto
                {
                    Id_User = user.Id_User,
                    Name_User = user.Name_User,
                    Email_User = user.Email_User,
                    Password_User = user.Password_User,
                    Id_Role = user.Id_Role
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar usuário com ID {UserId}", id);
                throw;
            }
        }

        public async Task<UserDto> CreateUser(CreateUserDto createUserDto)
        {
            try
            {
                // Verificar se o email já existe
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email_User == createUserDto.Email_User);

                if (existingUser != null)
                {
                    throw new InvalidOperationException("Email já está em uso");
                }

                var user = new User
                {
                    Name_User = createUserDto.Name_User,
                    Email_User = createUserDto.Email_User,
                    Password_User = HashPassword(createUserDto.Password_User),
                    Id_Role = createUserDto.Id_Role
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var userDto = _mapper.Map<UserDto>(user);
                return userDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar usuário");
                throw;
            }
        }

        public async Task<UserDto> UpdateUser(int id, UpdateUserDto updateUserDto)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    throw new InvalidOperationException("Usuário não encontrado");
                }

                // Verificar se o novo email já existe (se foi fornecido)
                if (!string.IsNullOrEmpty(updateUserDto.Email_User) && updateUserDto.Email_User != user.Email_User)
                {
                    var existingUser = await _context.Users
                        .FirstOrDefaultAsync(u => u.Email_User == updateUserDto.Email_User);

                    if (existingUser != null)
                    {
                        throw new InvalidOperationException("Email já está em uso");
                    }
                }

                // Atualizar propriedades
                user.Name_User = updateUserDto.Name_User;
                user.Email_User = updateUserDto.Email_User;
                if (!string.IsNullOrEmpty(updateUserDto.Password_User))
                {
                    user.Password_User = HashPassword(updateUserDto.Password_User);
                }

                await _context.SaveChangesAsync();

                return new UserDto
                {
                    Id_User = user.Id_User,
                    Name_User = user.Name_User,
                    Email_User = user.Email_User,
                    Password_User = user.Password_User,
                    Id_Role = user.Id_Role
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar usuário com ID {UserId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return false;
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao deletar usuário com ID {UserId}", id);
                throw;
            }
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
} 