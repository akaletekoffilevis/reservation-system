using Booking.Core.Interfaces;
using Booking.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Booking.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _db;
    protected readonly DbSet<T> _set;

    public Repository(AppDbContext db)
    {
        _db = db;
        _set = db.Set<T>();
    }

    public async Task<T?> GetByIdAsync(int id) => await _set.FindAsync(id);

    public async Task<List<T>> GetAllAsync() => await _set.ToListAsync();

    public async Task<T> CreateAsync(T entity)
    {
        _set.Add(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    public Task UpdateAsync(T entity)
    {
        _set.Update(entity);
        return _db.SaveChangesAsync();
    }

    public Task DeleteAsync(T entity)
    {
        _set.Remove(entity);
        return _db.SaveChangesAsync();
    }
}
