# Connexion et récupération du token
$loginResponse = curl -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Test123!"}' http://localhost:3000/api/auth/login | ConvertFrom-Json
$token = $loginResponse.token
$userId = $loginResponse.user.id

if (-not $token) {
    Write-Error "Échec de la connexion. Vérifiez que le serveur est en cours d'exécution et que les identifiants sont corrects."
    exit 1
}

# Définition des véhicules de test
$vehicles = @(
    @{
        brand = "Renault"
        model = "Clio"
        year = 2019
        licensePlate = "AA-123-BB"
        energyType = "GASOLINE"
        initialMileage = 15000  # Kilométrage plus réaliste
        vin = "VF1RFB00066201234"
    },
    @{
        brand = "Peugeot"
        model = "e-208"
        year = 2021
        licensePlate = "CC-456-DD"
        energyType = "ELECTRIC"
        initialMileage = 8000
        vin = "VF3PUZKYZMT1234567"
    },
    @{
        brand = "Toyota"
        model = "Corolla"
        year = 2020
        licensePlate = "EE-789-FF"
        energyType = "HYBRID_GASOLINE"
        initialMileage = 12000
        vin = "JTDDH3FH503123456"
    },
    @{
        brand = "Volkswagen"
        model = "Golf"
        year = 2018
        licensePlate = "GG-012-HH"
        energyType = "DIESEL"
        initialMileage = 25000
        vin = "WVWZZZAUZJW123456"
    },
    @{
        brand = "Hyundai"
        model = "Nexo"
        year = 2022
        licensePlate = "II-345-JJ"
        energyType = "HYDROGEN"
        initialMileage = 5000
        vin = "KMHDR81CBNU123456"
    },
    @{
        brand = "Dacia"
        model = "Sandero"
        year = 2020
        licensePlate = "KK-678-LL"
        energyType = "GPL"
        initialMileage = 18000
        vin = "UU1BSDA1P45123456"
    }
)

# Fonction pour générer une date aléatoire dans les 6 derniers mois
function Get-RandomDate {
    $endDate = Get-Date
    $startDate = $endDate.AddMonths(-6)
    $randomTicks = Get-Random -Minimum $startDate.Ticks -Maximum $endDate.Ticks
    return [DateTime]::new($randomTicks)
}

# Fonction pour générer un kilométrage croissant
function Get-IncrementalMileage {
    param (
        [int]$baseKm,
        [int]$increment
    )
    return $baseKm + $increment
}

# Pour chaque véhicule
foreach ($vehicle in $vehicles) {
    # Créer le véhicule
    $vehicleJson = $vehicle | ConvertTo-Json
    Write-Host "Création du véhicule: $($vehicle.brand) $($vehicle.model)"
    $createdVehicle = $(curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $vehicleJson http://localhost:3000/api/vehicles | ConvertFrom-Json)
    $vehicleId = $createdVehicle.id

    if (-not $vehicleId) {
        Write-Error "Échec de la création du véhicule $($vehicle.brand) $($vehicle.model)"
        continue
    }

    Write-Host "Véhicule créé avec l'ID: $vehicleId"

    # Générer 3-5 entrées de carburant
    $numEntries = Get-Random -Minimum 3 -Maximum 6
    $currentMileage = $vehicle.initialMileage
    $dates = @()

    # Générer d'abord toutes les dates pour assurer qu'elles sont dans l'ordre
    for ($i = 1; $i -le $numEntries; $i++) {
        $dates += Get-RandomDate
    }
    $dates = $dates | Sort-Object

    Write-Host "Génération de $numEntries entrées de carburant"
    for ($i = 0; $i -lt $numEntries; $i++) {
        $mileageIncrement = Get-Random -Minimum 500 -Maximum 2000
        $mileage = Get-IncrementalMileage -baseKm $currentMileage -increment $mileageIncrement
        $currentMileage = $mileage

        $quantity = if ($vehicle.energyType -eq "ELECTRIC") {
            Get-Random -Minimum 30 -Maximum 60  # kWh
        } else {
            Get-Random -Minimum 30 -Maximum 50  # Litres
        }

        $unitPrice = if ($vehicle.energyType -eq "ELECTRIC") {
            Get-Random -Minimum 0.15 -Maximum 0.25  # €/kWh
        } else {
            Get-Random -Minimum 1.5 -Maximum 2.2  # €/L
        }

        $totalCost = [math]::Round($quantity * $unitPrice, 2)

        $fuelEntry = @{
            vehicleId = $vehicleId
            date = $dates[$i].ToString("yyyy-MM-dd")
            mileage = $mileage
            quantity = $quantity
            unitPrice = $unitPrice
            totalCost = $totalCost
            stationType = "PUBLIC"
        } | ConvertTo-Json

        Write-Host "Ajout d'une entrée de carburant: $mileage km"
        curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $fuelEntry http://localhost:3000/api/fuel-entries
    }

    # Générer 3-5 entrées de maintenance
    $numEntries = Get-Random -Minimum 3 -Maximum 6
    $maintenanceTypes = @("ROUTINE", "REPAIR", "TECHNICAL_CHECK", "TIRES", "OTHER")
    $dates = @()

    # Générer d'abord toutes les dates pour assurer qu'elles sont dans l'ordre
    for ($i = 1; $i -le $numEntries; $i++) {
        $dates += Get-RandomDate
    }
    $dates = $dates | Sort-Object

    Write-Host "Génération de $numEntries entrées de maintenance"
    for ($i = 0; $i -lt $numEntries; $i++) {
        $mileageIncrement = Get-Random -Minimum 0 -Maximum 1000
        $mileage = Get-IncrementalMileage -baseKm $currentMileage -increment $mileageIncrement
        $currentMileage = [math]::Max($mileage, $currentMileage)

        $maintenanceEntry = @{
            vehicleId = $vehicleId
            date = $dates[$i].ToString("yyyy-MM-dd")
            type = $maintenanceTypes[(Get-Random -Maximum $maintenanceTypes.Count)]
            description = "Maintenance planifiée"
            cost = Get-Random -Minimum 50 -Maximum 500
            mileage = $mileage
            providerName = "Garage Test"
        } | ConvertTo-Json

        Write-Host "Ajout d'une entrée de maintenance: $mileage km"
        curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $maintenanceEntry http://localhost:3000/api/maintenance-entries
    }

    Write-Host "Terminé pour le véhicule $($vehicle.brand) $($vehicle.model)`n"
}

Write-Host "Données de test générées avec succès !" 