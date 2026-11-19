CREATE VIEW PendingBusinessApprovals
AS
SELECT B.business_id, B.name AS business_name, CASE WHEN R.business_id IS NOT NULL THEN 'Restaurant'
WHEN P.business_id IS NOT NULL THEN 'Pharmacy' END AS business_type,
Z.zone_name, (U.first_name + ' ' + U.last_name) AS partner_name
FROM Business B
INNER JOIN Zone Z ON B.zone_id = Z.zone_id
INNER JOIN Users U ON B.partner_id = U.user_id
LEFT OUTER JOIN Restaurant R ON B.business_id = R.business_id
LEFT OUTER JOIN Pharmacy P ON B.business_id = P.business_id
WHERE B.status = 'Pending' 
GO