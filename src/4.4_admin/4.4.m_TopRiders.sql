-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION TopRiders(@from_date DATE,@to_date DATE)
RETURNS TABLE
AS
RETURN(
	SELECT *
	FROM(
	SELECT ROW_NUMBER() OVER (ORDER BY COUNT(d.delivery_id) DESC, r.rider_id ASC) AS rider_rank,
	r.rider_id, CONCAT(u.first_name,' ',u.last_name) AS rider_name,
	COUNT(d.delivery_id) AS completed_delivery_count
	FROM Rider r INNER JOIN Users u ON r.rider_id = u.user_id
	INNER JOIN (SELECT * FROM Delivery WHERE CAST(delivered_at AS DATE) >= @from_date AND CAST(delivered_at AS DATE) <= @to_date)
	AS d ON d.rider_id = r.rider_id
	GROUP BY r.rider_id,u.first_name,u.last_name
	)AS T
	WHERE T.rider_rank BETWEEN 1 AND 5
);
GO
