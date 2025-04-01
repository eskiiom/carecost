-- Insertion des carburants pour les véhicules Essence (GASOLINE)
INSERT INTO "FuelType" (id, name, "energyType", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Sans plomb 95 (E5)', 'GASOLINE', NOW(), NOW()),
  (gen_random_uuid(), 'Sans plomb 98 (E5)', 'GASOLINE', NOW(), NOW()),
  (gen_random_uuid(), 'Sans plomb 95-E10 (E10)', 'GASOLINE', NOW(), NOW()),
  (gen_random_uuid(), 'Sans plomb 98-E10 (E10)', 'GASOLINE', NOW(), NOW()),
  (gen_random_uuid(), 'Sans plomb 95-E85 (E85)', 'GASOLINE', NOW(), NOW());

-- Insertion des carburants pour les véhicules Diesel (DIESEL)
INSERT INTO "FuelType" (id, name, "energyType", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Diesel B7 (7% de biodiesel)', 'DIESEL', NOW(), NOW()),
  (gen_random_uuid(), 'Diesel B10 (10% de biodiesel)', 'DIESEL', NOW(), NOW()),
  (gen_random_uuid(), 'Diesel B30 (30% de biodiesel)', 'DIESEL', NOW(), NOW()),
  (gen_random_uuid(), 'Diesel XTL (synthétique)', 'DIESEL', NOW(), NOW());

-- Insertion des carburants pour les véhicules GPL (GPL)
INSERT INTO "FuelType" (id, name, "energyType", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'GPLc (GPL carburant)', 'GPL', NOW(), NOW()),
  (gen_random_uuid(), 'GPLc + Essence (bimodal)', 'GPL', NOW(), NOW());

-- Insertion des carburants pour les véhicules Hybrides Essence (HYBRID_GASOLINE)
INSERT INTO "FuelType" (id, name, "energyType", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Sans plomb 95 (E5)', 'HYBRID_GASOLINE', NOW(), NOW()),
  (gen_random_uuid(), 'Sans plomb 98 (E5)', 'HYBRID_GASOLINE', NOW(), NOW()),
  (gen_random_uuid(), 'Sans plomb 95-E10 (E10)', 'HYBRID_GASOLINE', NOW(), NOW()),
  (gen_random_uuid(), 'Sans plomb 98-E10 (E10)', 'HYBRID_GASOLINE', NOW(), NOW()),
  (gen_random_uuid(), 'Sans plomb 95-E85 (E85)', 'HYBRID_GASOLINE', NOW(), NOW());

-- Insertion des carburants pour les véhicules Hybrides Diesel (HYBRID_DIESEL)
INSERT INTO "FuelType" (id, name, "energyType", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Diesel B7 (7% de biodiesel)', 'HYBRID_DIESEL', NOW(), NOW()),
  (gen_random_uuid(), 'Diesel B10 (10% de biodiesel)', 'HYBRID_DIESEL', NOW(), NOW()),
  (gen_random_uuid(), 'Diesel B30 (30% de biodiesel)', 'HYBRID_DIESEL', NOW(), NOW()),
  (gen_random_uuid(), 'Diesel XTL (synthétique)', 'HYBRID_DIESEL', NOW(), NOW());

-- Insertion des carburants pour les véhicules Électriques (ELECTRIC)
INSERT INTO "FuelType" (id, name, "energyType", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Électricité domestique (AC)', 'ELECTRIC', NOW(), NOW()),
  (gen_random_uuid(), 'Électricité rapide (DC)', 'ELECTRIC', NOW(), NOW()),
  (gen_random_uuid(), 'Électricité super-rapide (DC)', 'ELECTRIC', NOW(), NOW()),
  (gen_random_uuid(), 'Électricité semi-rapide (AC)', 'ELECTRIC', NOW(), NOW());

-- Insertion des carburants pour les véhicules Hydrogène (HYDROGEN)
INSERT INTO "FuelType" (id, name, "energyType", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Hydrogène comprimé (H2)', 'HYDROGEN', NOW(), NOW()),
  (gen_random_uuid(), 'Hydrogène liquide (LH2)', 'HYDROGEN', NOW(), NOW());

-- Insertion des carburants pour les véhicules Flex-Fuel (FLEX_FUEL)
INSERT INTO "FuelType" (id, name, "energyType", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'E85', 'FLEX_FUEL', NOW(), NOW()),
  (gen_random_uuid(), 'E100', 'FLEX_FUEL', NOW(), NOW());

-- Insertion des carburants pour les véhicules Biocarburants (BIOFUEL)
INSERT INTO "FuelType" (id, name, "energyType", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'B100 (100% biodiesel)', 'BIOFUEL', NOW(), NOW()),
  (gen_random_uuid(), 'E100 (100% bioéthanol)', 'BIOFUEL', NOW(), NOW()); 