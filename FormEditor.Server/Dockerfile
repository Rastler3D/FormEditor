# См. статью по ссылке https://aka.ms/customizecontainer, чтобы узнать как настроить контейнер отладки и как Visual Studio использует этот Dockerfile для создания образов для ускорения отладки.

# Этот этап используется при запуске из VS в быстром режиме (по умолчанию для конфигурации отладки)
FROM mcr.microsoft.com/dotnet/sdk:8.0.402 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


# Этот этап используется для сборки проекта службы
FROM mcr.microsoft.com/dotnet/sdk:8.0.402 AS with-node
RUN apt-get update
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get -y install nodejs


FROM with-node AS build

ARG MEILISEARCH_MASTER_KEY
ARG MEILISEARCH_API_KEY_UUID
ARG VITE_MEILISEARCH_SEARCH_API_KEY
ARG VITE_MEILISEARCH_URL
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ARG VITE_CLOUDINARY_CLOUD_NAME

ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["FormEditor.Server/FormEditor.Server.csproj", "FormEditor.Server/"]
COPY ["formeditor.client/formeditor.client.esproj", "formeditor.client/"]
RUN dotnet restore "./FormEditor.Server/FormEditor.Server.csproj"
COPY . .
WORKDIR "/src/FormEditor.Server"
RUN dotnet build "./FormEditor.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Этот этап используется для публикации проекта службы, который будет скопирован на последний этап
FROM build AS publish
ARG BUILD_CONFIGURATION=Release

ARG MEILISEARCH_MASTER_KEY
ARG MEILISEARCH_API_KEY_UUID
ARG VITE_MEILISEARCH_SEARCH_API_KEY
ARG VITE_MEILISEARCH_URL
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ARG VITE_CLOUDINARY_CLOUD_NAME

RUN dotnet publish "./FormEditor.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Этот этап используется в рабочей среде или при запуске из VS в обычном режиме (по умолчанию, когда конфигурация отладки не используется)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FormEditor.Server.dll"]
