FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY . .
RUN dotnet build *.sqlproj -c Release -o /app/out

FROM mcr.microsoft.com/mssql/server:2022-latest
USER root

RUN apt-get update && \
    apt-get install -y curl unzip libunwind8 ca-certificates && \
    curl -k -L -o sqlpackage.zip "https://aka.ms/sqlpackage-linux" && \
    unzip sqlpackage.zip -d /opt/sqlpackage && \
    chmod +x /opt/sqlpackage/sqlpackage && \
    rm sqlpackage.zip

RUN mkdir -p /var/opt/mssql/data /var/opt/mssql/log /var/opt/mssql/dacpac && \
    chown -R mssql:0 /var/opt/mssql/data /var/opt/mssql/log /var/opt/mssql/dacpac && \
    chmod -R g=u /var/opt/mssql/data /var/opt/mssql/log /var/opt/mssql/dacpac

    RUN mkdir -p /var/opt/mssql/dacpac

COPY --from=build /app/out/*.dacpac /var/opt/mssql/dacpac/Database.dacpac

COPY startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

USER mssql

ENV ACCEPT_EULA=Y
ENV MSSQL_SA_PASSWORD=YourStrong!Passw0rd

ENTRYPOINT ["/usr/local/bin/startup.sh"]