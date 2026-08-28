# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY src/DWPTS.Shared/*.csproj src/DWPTS.Shared/
COPY src/DWPTS.Domain/*.csproj src/DWPTS.Domain/
COPY src/DWPTS.Application/*.csproj src/DWPTS.Application/
COPY src/DWPTS.Infrastructure/*.csproj src/DWPTS.Infrastructure/
COPY src/DWPTS.API/*.csproj src/DWPTS.API/

RUN dotnet restore src/DWPTS.API/DWPTS.API.csproj

COPY src/ src/
RUN dotnet publish src/DWPTS.API/DWPTS.API.csproj -c Release -o /out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "DWPTS.API.dll"]
