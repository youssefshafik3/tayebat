-- Omar Waleed El-sayed 64-29234

GO
CREATE VIEW ZoneDeliveryPerformance
AS
SELECT z.zone_id,z.zone_name,
COUNT(d.delivery_id) AS delivery_count,
AVG(CAST(d.tracking_time AS DECIMAL(10,2))) AS avg_tracking_time

FROM (Zone z LEFT OUTER JOIN Orders o ON z.zone_id = o.zone_id)
LEFT OUTER JOIN (Delivery d 
INNER JOIN (SELECT * FROM SubOrder WHERE status = 'Delivered') AS so ON d.suborder_id = so.suborder_id)
ON o.order_id = so.order_id
GROUP BY z.zone_id,z.zone_name
GO
