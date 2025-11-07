using System.ComponentModel.DataAnnotations;

namespace HiHSK.Api.Models;

public class RegisterRequest : IValidatableObject
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, ErrorMessage = "Mật khẩu phải có ít nhất {2} ký tự.", MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    public string? ConfirmPassword { get; set; }
    
    // Custom validation: chỉ validate Compare khi ConfirmPassword có giá trị
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var results = new List<ValidationResult>();
        
        // Chỉ validate Compare khi ConfirmPassword có giá trị
        if (!string.IsNullOrEmpty(ConfirmPassword) && ConfirmPassword != Password)
        {
            results.Add(new ValidationResult(
                "Mật khẩu xác nhận không khớp.",
                new[] { nameof(ConfirmPassword) }
            ));
        }
        
        return results;
    }
}

