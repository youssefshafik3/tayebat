CREATE VIEW allBusinessProfiles
AS
SELECT B.business_id, B.name AS business_name, CASE WHEN R.business_id IS NOT NULL THEN 'Restaurant'
WHEN P.business_id IS NOT NULL THEN 'Pharmacy' END AS business_type, 
Z.zone_name,(U.first_name + ' ' + U.last_name) AS partner_name,
status, opening_hour, closing_hour
FROM Business B 
INNER JOIN Users U ON B.partner_id = U.user_id
INNER JOIN Zone Z ON B.zone_id = Z.zone_id
LEFT JOIN Restaurant R ON B.business_id = R.business_id
LEFT JOIN Pharmacy P ON B.business_id = P.business_id
GO