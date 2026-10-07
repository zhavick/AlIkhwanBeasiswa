using System.Text;
using AlIkhwanBeasiswa.Core.Interfaces;
using AlIkhwanBeasiswa.Infrastructure.Data;
using AlIkhwanBeasiswa.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Context (PostgreSQL with SQLite local dev fallback)
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (dbProvider.Equals("Postgres", StringComparison.OrdinalIgnoreCase) ||
        (connectionString != null && connectionString.Contains("Username=", StringComparison.OrdinalIgnoreCase)))
    {
        options.UseNpgsql(connectionString ?? "Host=localhost;Port=5432;Database=alikhwan_beasiswa;Username=postgres;Password=secret");
    }
    else
    {
        var sqliteConn = connectionString != null && connectionString.Contains("Data Source=", StringComparison.OrdinalIgnoreCase)
            ? connectionString
            : "Data Source=alikhwan_beasiswa.db";
        options.UseSqlite(sqliteConn);
    }
});

// 2. Dependency Injection Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPengurusService, PengurusService>();
builder.Services.AddScoped<IRbacService, RbacService>();
builder.Services.AddScoped<IPenerimaService, PenerimaService>();
builder.Services.AddScoped<IBeasiswaService, BeasiswaService>();
builder.Services.AddScoped<IKaderisasiAlumniService, KaderisasiAlumniService>();
builder.Services.AddScoped<IPortalCmsService, PortalCmsService>();
builder.Services.AddScoped<IDokumenService, DokumenService>();

// 3. JWT Authentication & Policy-Based RBAC
var jwtKey = builder.Configuration["Jwt:Key"] ?? "AlIkhwanSuperSecretKeyForJwtAuthentication2026!@#";
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "AlIkhwanBeasiswa",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "AlIkhwanPortal",
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanVerifyBeasiswa", policy => policy.RequireClaim("permission", "beasiswa.verify"));
    options.AddPolicy("CanApproveTahap1", policy => policy.RequireClaim("permission", "beasiswa.approve_tahap1"));
    options.AddPolicy("CanApproveTahap2", policy => policy.RequireClaim("permission", "beasiswa.approve_tahap2"));
    options.AddPolicy("CanApproveTahap3", policy => policy.RequireClaim("permission", "beasiswa.approve_tahap3"));
    options.AddPolicy("CanDisburse", policy => policy.RequireClaim("permission", "pencairan.disburse"));
    options.AddPolicy("CanManagePortal", policy => policy.RequireClaim("permission", "portal.manage"));
    options.AddPolicy("CanManagePengurus", policy => policy.RequireClaim("permission", "pengurus.manage"));
    options.AddPolicy("CanManageRbac", policy => policy.RequireClaim("permission", "rbac.manage"));
});

// 4. CORS Policy for Frontend (Vite & Nginx)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 5. Swagger with JWT Bearer Definition
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Al-Ikhwan Beasiswa Management & Portal API", 
        Version = "v1",
        Description = "API Layanan Manajemen Beasiswa, Transaksi Approval 3-Tahap, Kaderisasi, Tracer Alumni & CMS Portal Al-Ikhwan"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header menggunakan skema Bearer. Contoh: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 6. Initial Database Seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await DbSeeder.SeedAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Terjadi kesalahan saat mengeksekusi Database Seeder.");
    }
}

// 7. HTTP Pipeline Configuration
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Al-Ikhwan Beasiswa API v1");
    });
}

var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
