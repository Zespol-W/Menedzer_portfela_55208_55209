#!/bin/bash

# Uruchom SQL Server w tle
/opt/mssql/bin/sqlservr &

echo "Czekam na uruchomienie SQL Server..."

for i in {1..30}; do
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" -C > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "SQL Server gotowy."
        break
    fi
    echo "Serwer jeszcze nie wstaje... (próba $i)"
    sleep 2
done

echo "Wdrażam plik .dacpac..."
/opt/sqlpackage/sqlpackage \
    /Action:Publish \
    /SourceFile:/var/opt/mssql/dacpac/Database.dacpac \
    /TargetConnectionString:"Server=localhost;Database=$DB_NAME;User Id=sa;Password=$MSSQL_SA_PASSWORD;Encrypt=False;TrustServerCertificate=True;" \
    /v:APP_DB_USER=$APP_DB_USER \
    /v:APP_DB_PASSWORD=$APP_DB_PASSWORD \
    /v:DB_NAME=$DB_NAME \
    /p:BlockOnPossibleDataLoss=false

# Pozwala procesowi sqlservr działać dalej na pierwszym planie
wait