using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Booking.Core.DTOs;
using Booking.Core.Entities;
using Booking.Core.Enums;
using Booking.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Booking.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IProfessionalRepository _pros;
    private readonly IRefreshTokenRepository _refreshTokens;
    private readonly IConfiguration _config;

    public AuthService(
        IUserRepository users,
        IProfessionalRepository pros,
        IRefreshTokenRepository refreshTokens,
        IConfiguration config)
    {
        _users = users;
        _pros = pros;
        _refreshTokens = refreshTokens;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _users.EmailExistsAsync(request.Email))
            throw new InvalidOperationException("Email already registered");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCryptHasher.Hash(request.Password),
            DisplayName = request.DisplayName,
            Phone = request.Phone,
            Timezone = request.Timezone,
            Role = request.IsProfessional ? UserRole.Professional : UserRole.Client
        };

        user = await _users.CreateAsync(user);

        if (request.IsProfessional)
        {
            var businessName = request.BusinessName ?? request.DisplayName;
            var pro = new Professional
            {
                UserId = user.Id,
                BusinessName = businessName,
                Slug = GenerateSlug(businessName),
                Phone = request.Phone
            };
            await _pros.CreateAsync(pro);
        }

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _users.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Invalid credentials");

        if (!BCryptHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials");

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var stored = await _refreshTokens.GetByTokenAsync(refreshToken)
            ?? throw new UnauthorizedAccessException("Invalid refresh token");

        if (!stored.IsActive)
            throw new UnauthorizedAccessException("Refresh token expired or revoked");

        await _refreshTokens.RevokeAsync(refreshToken);
        return await GenerateAuthResponse(stored.User);
    }

    public async Task LogoutAsync(string refreshToken) =>
        await _refreshTokens.RevokeAsync(refreshToken);

    private async Task<AuthResponse> GenerateAuthResponse(User user)
    {
        var token = GenerateJwtToken(user);
        var refreshToken = await GenerateRefreshToken(user);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Role = user.Role.ToString(),
                Timezone = user.Timezone
            }
        };
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "DefaultSecretKey12345678901234567890"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "BookingAPI",
            audience: _config["Jwt:Audience"] ?? "BookingApp",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<RefreshToken> GenerateRefreshToken(User user)
    {
        var token = new RefreshToken
        {
            UserId = user.Id,
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        await _refreshTokens.CreateAsync(token);
        return token;
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        slug = slug.Trim('-');
        return slug + "-" + RandomNumberGenerator.GetInt32(1000, 9999);
    }
}

internal static class BCryptHasher
{
    public static string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password);

    public static bool Verify(string password, string hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash);
}
