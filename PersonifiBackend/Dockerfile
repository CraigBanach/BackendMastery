# Learn about building .NET container images:
# https://github.com/dotnet/dotnet-docker/blob/main/samples/README.md
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG TARGETARCH
WORKDIR /source

# Copy project file and restore as distinct layers
COPY --link ./PersonifiBackend.sln ./
COPY --link ./src/PersonifiBackend.Api/PersonifiBackend.Api.csproj ./src/PersonifiBackend.Api/PersonifiBackend.Api.csproj
COPY --link ./src/PersonifiBackend.Application/PersonifiBackend.Application.csproj ./src/PersonifiBackend.Application/PersonifiBackend.Application.csproj
COPY --link ./src/PersonifiBackend.Core/PersonifiBackend.Core.csproj ./src/PersonifiBackend.Core/PersonifiBackend.Core.csproj
COPY --link ./src/PersonifiBackend.Infrastructure/PersonifiBackend.Infrastructure.csproj ./src/PersonifiBackend.Infrastructure/PersonifiBackend.Infrastructure.csproj
RUN dotnet restore -a $TARGETARCH ./src/PersonifiBackend.Api/PersonifiBackend.Api.csproj

# Copy source code and publish app
COPY --link ./src/ ./src/
RUN dotnet publish ./src/PersonifiBackend.Api/PersonifiBackend.Api.csproj -a $TARGETARCH -o /app

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
EXPOSE 8080
WORKDIR /app
COPY --link --from=build /app .
USER $APP_UID
ENTRYPOINT ["dotnet", "PersonifiBackend.Api.dll"]