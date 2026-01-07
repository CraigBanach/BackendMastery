using AutoMapper;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Transaction mappings
        CreateMap<Transaction, TransactionDto>();
        CreateMap<CreateTransactionDto, Transaction>();
        CreateMap<UpdateTransactionDto, Transaction>();

        // Category mappings
        CreateMap<Category, CategoryDto>();
        CreateMap<CreateCategoryDto, Category>();
        CreateMap<UpdateCategoryDto, Category>();

        // Bucket mappings
        CreateMap<Bucket, BucketDto>();
        CreateMap<CreateBucketDto, Bucket>();
        CreateMap<UpdateBucketDto, Bucket>()
            .ForMember(dest => dest.CurrentBalance, opt => opt.Ignore());
    }
}
