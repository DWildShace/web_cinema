using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CinemaBooking.BLL.Services;

public class AuthService(IUserRepository userRepo, IConfiguration config) : IAuthService
{
    public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await userRepo.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new InvalidOperationException("Email đã được sử dụng.");

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Customer
        };
        await userRepo.AddAsync(user);
        await userRepo.SaveChangesAsync();
        return new AuthResultDto(GenerateToken(user), user.Email, user.Role.ToString());
    }

    public async Task<AuthResultDto> LoginAsync(LoginDto dto)
    {
        var user = await userRepo.GetByEmailAsync(dto.Email)
            ?? throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        return new AuthResultDto(GenerateToken(user), user.Email, user.Role.ToString());
    }

    public async Task<UserProfileDto> GetProfileAsync(int userId)
    {
        var user = await userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Người dùng không tồn tại.");
        return new UserProfileDto(user.Id, user.Email, user.Role.ToString());
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Người dùng không tồn tại.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Mật khẩu hiện tại không đúng.");

        if (dto.NewPassword.Length < 6)
            throw new ArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await userRepo.SaveChangesAsync();
    }

    public async Task<IEnumerable<UserListItemDto>> GetAllUsersAsync()
    {
        var users = await userRepo.GetAllAsync();
        return users.Select(u => new UserListItemDto(u.Id, u.Email, u.Role.ToString()));
    }

    // Roles assignable via API — SysAdmin can only be set via DB seed/migration
    private static readonly HashSet<UserRole> AssignableRoles =
        [UserRole.Customer, UserRole.CinemaStaff, UserRole.CinemaManager];

    public async Task ChangeUserRoleAsync(int callerUserId, int targetUserId, ChangeRoleDto dto)
    {
        if (callerUserId == targetUserId)
            throw new ArgumentException("Không thể thay đổi role của chính mình.");

        var user = await userRepo.GetByIdAsync(targetUserId)
            ?? throw new KeyNotFoundException("Người dùng không tồn tại.");

        if (user.Role == UserRole.SysAdmin)
            throw new ArgumentException("Không thể thay đổi role của SysAdmin khác.");

        if (!Enum.TryParse<UserRole>(dto.Role, ignoreCase: true, out var newRole))
            throw new ArgumentException($"Role không hợp lệ: {dto.Role}");

        if (!AssignableRoles.Contains(newRole))
            throw new ArgumentException($"Không thể gán role '{dto.Role}' qua API.");

        user.Role = newRole;
        await userRepo.SaveChangesAsync();
    }

    private string GenerateToken(User user)
    {
        var secret = config["Jwt:Secret"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiryMinutes = int.TryParse(config["Jwt:ExpiryMinutes"], out var exp) ? exp : 1440;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
