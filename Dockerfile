FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["API/src/ToyShop.API/ToyShop.API.csproj", "API/src/ToyShop.API/"]
COPY ["API/src/ToyShop.Application/ToyShop.Application.csproj", "API/src/ToyShop.Application/"]
COPY ["API/src/ToyShop.Domain/ToyShop.Domain.csproj", "API/src/ToyShop.Domain/"]
COPY ["API/src/ToyShop.Infrastructure/ToyShop.Infrastructure.csproj", "API/src/ToyShop.Infrastructure/"]
COPY ["API/src/ToyShop.Shared/ToyShop.Shared.csproj", "API/src/ToyShop.Shared/"]

RUN dotnet restore "API/src/ToyShop.API/ToyShop.API.csproj"

# Copy full source code and publish release build
COPY API/ API/
WORKDIR "/src/API/src/ToyShop.API"
RUN dotnet publish "ToyShop.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Environment settings for container runtime
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

# Expose default port
EXPOSE 8080

ENTRYPOINT ["dotnet", "ToyShop.API.dll"]
