-- Youssef Sameh 64-10650
CREATE OR ALTER VIEW BusinessesPerZone AS
    SELECT Z.zone_id, Z.zone_name, COUNT(B.business_id) AS business_count
    FROM Zone Z LEFT JOIN Business B ON Z.zone_id = B.zone_id AND B.status = 'Active'
    GROUP BY Z.zone_id, Z.zone_name;
GO