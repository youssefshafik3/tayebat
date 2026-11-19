-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION Platform_Health_Snapshot()
RETURNS TABLE
AS
RETURN(
	SELECT (SELECT COUNT(*) FROM Business WHERE status = 'Active') AS active_businesses,
	(SELECT COUNT(*) FROM Rider WHERE is_available=1) AS available_riders,
	(SELECT COUNT(*) FROM Orders WHERE CAST(order_date AS DATE) = CAST(GETDATE() AS DATE)) AS orders_today,
	(SELECT AVG(CAST(tracking_time AS DECIMAL(10,2))) FROM Delivery WHERE CAST(delivered_at AS DATE) = CAST(GETDATE() AS DATE)) AS avg_delivery_time_today,
	(SELECT COUNT(*) FROM Feedback WHERE rating <=2 AND CAST(feedback_date AS DATE) = CAST(GETDATE() AS DATE)) AS low_ratings_today
)
GO