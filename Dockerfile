FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy source files
COPY API/ API/

# Restore dependencies and publish release build
WORKDIR "/src/API/src/ToyShop.API"
RUN dotnet restore "ToyShop.API.csproj"
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
