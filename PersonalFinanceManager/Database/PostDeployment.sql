
/*
Skrypt Post-Deployment
Ten skrypt zostanie wykonany PO wdrożeniu dacpaca.
Używamy zmiennych SQLCMD, które zostaną przekazane z docker-compose.
*/

-- 1. Tworzymy LOGIN (na poziomie serwera), jeśli nie istnieje
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = '$(APP_DB_USER)')
BEGIN
    CREATE LOGIN [$(APP_DB_USER)] WITH PASSWORD = '$(APP_DB_PASSWORD)';
END
GO

-- 2. Przełączamy się na kontekst Twojej bazy (na wypadek, gdyby skrypt ruszył w master)
USE [$(DB_NAME)];
GO

-- 3. Tworzymy UŻYTKOWNIKA (na poziomie bazy danych), jeśli nie istnieje
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = '$(APP_DB_USER)')
BEGIN
    CREATE USER [$(APP_DB_USER)] FOR LOGIN [$(APP_DB_USER)];
END
GO

-- 4. Nadajemy uprawnienia CRUD (DML: Select, Insert, Update, Delete)
ALTER ROLE db_datareader ADD MEMBER [$(APP_DB_USER)];
ALTER ROLE db_datawriter ADD MEMBER [$(APP_DB_USER)];
GO

-- 5. Opcjonalnie: Uprawnienie do wykonywania procedur (jeśli ich używasz)
GRANT EXECUTE TO [$(APP_DB_USER)];
GO