# Configuration
$API_URL = "http://localhost:3000/api"
$EMAIL = "test@example.com"
$PASSWORD = "Test123!"

# Fonction pour effectuer une requête HTTP
function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$Token
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $response = Invoke-WebRequest -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json)
    return $response.Content | ConvertFrom-Json
}

# Connexion et récupération du token
Write-Host "Connexion..."
$loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body @{
    email = $EMAIL
    password = $PASSWORD
}
$token = $loginResponse.token

if (-not $token) {
    Write-Error "Échec de la connexion. Vérifiez que le serveur est en cours d'exécution et que les identifiants sont corrects."
    exit 1
}

Write-Host "Connexion réussie !"

# Récupération de l'ID de l'utilisateur
$userId = $loginResponse.user.id

# Suppression des véhicules existants
Write-Host "Suppression des véhicules existants..."
$vehicles = Invoke-ApiRequest -Method "GET" -Endpoint "/vehicles" -Token $token
foreach ($vehicle in $vehicles) {
    Invoke-ApiRequest -Method "DELETE" -Endpoint "/vehicles/$($vehicle.id)" -Token $token
    Write-Host "Véhicule supprimé : $($vehicle.brand) $($vehicle.model)"
}

# Données de test
$vehicles = @(
    @{
        userId = $userId
        brand = "Renault"
        model = "Clio"
        year = 2018
        licensePlate = "AB-123-CD"
        energyType = "GASOLINE"
        initialMileage = 15000
        maintenanceFrequency = "EVERY_15000KM"
        vin = "VF1RFB00066201234"
        status = "ACTIVE"
    },
    @{
        userId = $userId
        brand = "Peugeot"
        model = "208"
        year = 2019
        licensePlate = "DE-456-FG"
        energyType = "DIESEL"
        initialMileage = 20000
        maintenanceFrequency = "EVERY_20000KM"
        vin = "VF3PUZKYZMT123456"
        status = "ACTIVE"
    },
    @{
        userId = $userId
        brand = "Citroën"
        model = "C3"
        year = 2020
        licensePlate = "GH-789-IJ"
        energyType = "ELECTRIC"
        initialMileage = 5000
        maintenanceFrequency = "ANNUAL"
        vin = "VF7SXKFSEKT123456"
        status = "ACTIVE"
    },
    @{
        userId = $userId
        brand = "Volkswagen"
        model = "Golf"
        year = 2017
        licensePlate = "KL-012-MN"
        energyType = "DIESEL"
        initialMileage = 45000
        maintenanceFrequency = "EVERY_30000KM"
        vin = "WVWZZZAUZJW123456"
        status = "ACTIVE"
    },
    @{
        userId = $userId
        brand = "Toyota"
        model = "Yaris"
        year = 2021
        licensePlate = "OP-345-QR"
        energyType = "HYBRID_GASOLINE"
        initialMileage = 10000
        maintenanceFrequency = "BIENNIAL"
        vin = "JTDKN3DU60J123456"
        status = "ACTIVE"
    }
)

# Création des véhicules
Write-Host "Création des véhicules..."
$createdVehicles = @()

foreach ($vehicle in $vehicles) {
    $response = Invoke-ApiRequest -Method "POST" -Endpoint "/vehicles" -Body $vehicle -Token $token
    $createdVehicles += $response
    Write-Host "Véhicule créé : $($vehicle.brand) $($vehicle.model)"
}

# Fonction pour générer des dates aléatoires
function Get-RandomDate {
    param (
        [DateTime]$StartDate,
        [DateTime]$EndDate
    )
    $randomTicks = Get-Random -Minimum $StartDate.Ticks -Maximum $EndDate.Ticks
    return [DateTime]::new($randomTicks)
}

# Création des entrées de carburant et de maintenance pour chaque véhicule
foreach ($vehicle in $createdVehicles) {
    Write-Host "`nGénération des données pour $($vehicle.brand) $($vehicle.model)..."
    
    # Dates de base
    $startDate = (Get-Date).AddMonths(-12)
    $currentMileage = $vehicle.initialMileage
    
    # Création des entrées de carburant
    $fuelEntriesCount = Get-Random -Minimum 3 -Maximum 6
    for ($i = 0; $i -lt $fuelEntriesCount; $i++) {
        $date = Get-RandomDate -StartDate $startDate -EndDate (Get-Date)
        $mileage = $currentMileage + (Get-Random -Minimum 1000 -Maximum 5000)
        $currentMileage = $mileage
        
        $quantity = [math]::Round((Get-Random -Minimum 30 -Maximum 60), 2)
        $unitPrice = [math]::Round((Get-Random -Minimum 1.5 -Maximum 2.2), 2)
        $totalCost = [math]::Round($quantity * $unitPrice, 2)
        
        $fuelEntry = @{
            vehicleId = $vehicle.id
            date = $date.ToString("yyyy-MM-dd")
            mileage = $mileage
            quantity = $quantity
            unitPrice = $unitPrice
            totalCost = $totalCost
            stationType = "PUBLIC"
            status = "ACTIVE"
            notes = "Plein effectué à la station-service"
        }
        
        Invoke-ApiRequest -Method "POST" -Endpoint "/fuel-entries" -Body $fuelEntry -Token $token
        Write-Host "  Entrée carburant créée : $($date.ToString('dd/MM/yyyy'))"
    }
    
    # Création des entrées de maintenance
    $maintenanceEntriesCount = Get-Random -Minimum 2 -Maximum 4
    for ($i = 0; $i -lt $maintenanceEntriesCount; $i++) {
        $date = Get-RandomDate -StartDate $startDate -EndDate (Get-Date)
        $mileage = $currentMileage + (Get-Random -Minimum 500 -Maximum 3000)
        $currentMileage = $mileage
        
        $maintenanceTypes = @("ROUTINE", "REPAIR", "TECHNICAL_CHECK", "TIRES", "OTHER")
        $maintenanceType = $maintenanceTypes | Get-Random
        
        $descriptions = @{
            "ROUTINE" = "Maintenance de routine"
            "REPAIR" = "Réparation effectuée"
            "TECHNICAL_CHECK" = "Contrôle technique"
            "TIRES" = "Changement des pneus"
            "OTHER" = "Autre maintenance"
        }
        
        $maintenanceEntry = @{
            vehicleId = $vehicle.id
            date = $date.ToString("yyyy-MM-dd")
            mileage = $mileage
            type = $maintenanceType
            description = $descriptions[$maintenanceType]
            cost = [math]::Round((Get-Random -Minimum 50 -Maximum 200), 2)
            providerName = "Garage Test"
            status = "ACTIVE"
            notes = "Maintenance effectuée au garage"
        }
        
        Invoke-ApiRequest -Method "POST" -Endpoint "/maintenance-entries" -Body $maintenanceEntry -Token $token
        Write-Host "  Entrée maintenance créée : $($date.ToString('dd/MM/yyyy')) - $maintenanceType"
    }
}

Write-Host "`nGénération des données de test terminée avec succès !" 