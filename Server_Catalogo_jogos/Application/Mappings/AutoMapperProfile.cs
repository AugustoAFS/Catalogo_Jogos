using AutoMapper;
using Core.Entities;
using Application.DTOs;

namespace Application.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Mapeamentos para User
            CreateMap<User, RegisterDto>().ReverseMap();
            CreateMap<User, LoginDto>().ReverseMap();
            CreateMap<User, UpdateUserDto>().ReverseMap();
            CreateMap<User, DeleteUserDto>().ReverseMap();

            // Mapeamentos para Game
            CreateMap<Game, GameDto>().ReverseMap();
            CreateMap<Game, CreateGameDto>().ReverseMap();
            CreateMap<Game, UpdateGameDto>().ReverseMap();

            // Mapeamentos para Rating
            CreateMap<Rating, RatingDto>().ReverseMap();
            CreateMap<Rating, CreateRatingDto>().ReverseMap();
            CreateMap<Rating, UpdateRatingDto>().ReverseMap();

            // Mapeamentos para Cart
            CreateMap<Cart, CartDto>()
                .ForMember(dest => dest.Game, opt => opt.MapFrom(src => src.Game))
                .ReverseMap();
            CreateMap<Cart, AddToCartDto>().ReverseMap();
            CreateMap<Cart, UpdateCartItemDto>().ReverseMap();
        }
    }
} 