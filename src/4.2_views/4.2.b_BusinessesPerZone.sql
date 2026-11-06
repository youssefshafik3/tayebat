-- Youssef Sameh 64-10650
CREATE VIEW BusinessesPerZone AS
    SELECT Z.zone_id,Z.zone_name,COUNT(B.business_id)
    FROM Zone Z JOIN Business B ON Z.zone_id = B.zone_id
    WHERE B.status = 'Active'
    GROUP BY zone_id,zone_name;
GO