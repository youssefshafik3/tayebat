-- Omar Waleed El-sayed 64-29234

GO
CREATE VIEW RiderPerformanceSummary
AS
SELECT r.rider_id,CONCAT(u.first_name,' ',u.last_name) AS rider_name,z.zone_name ,
COUNT(d.delivery_id) AS completed_deliveries,
AVG(f.rating) AS avg_rating

FROM ((Rider r INNER JOIN Users u ON r.rider_id = u.user_id) INNER JOIN Zone z ON r.zone_id = z.zone_id)
	LEFT OUTER JOIN (Delivery d 
	INNER JOIN ((SELECT * FROM SubOrder WHERE status = 'Delivered') AS so
	LEFT OUTER JOIN Feedback f ON f.suborder_id = so.suborder_id)
	ON d.suborder_id = so.suborder_id) ON d.rider_id = r.rider_id
GROUP BY r.rider_id,u.first_name,u.last_name,z.zone_name
GO