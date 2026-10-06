# Multi-stage build for ASP.NET Core Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy solution and project files for layer caching
COPY src/AlIkhwanBeasiswa.sln ./src/
COPY src/AlIkhwanBeasiswa.Core/*.csproj ./src/AlIkhwanBeasiswa.Core/
COPY src/AlIkhwanBeasiswa.Infrastructure/*.csproj ./src/AlIkhwanBeasiswa.Infrastructure/
COPY src/AlIkhwanBeasiswa.Api/*.csproj ./src/AlIkhwanBeasiswa.Api/

# Restore dependencies
RUN dotnet restore ./src/AlIkhwanBeasiswa.sln

# Copy the entire source code
COPY src/ ./src/

# Build and publish release output
RUN dotnet publish ./src/AlIkhwanBeasiswa.Api/AlIkhwanBeasiswa.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for docker healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# Create uploads directory
RUN mkdir -p /app/uploads

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "AlIkhwanBeasiswa.Api.dll"]
