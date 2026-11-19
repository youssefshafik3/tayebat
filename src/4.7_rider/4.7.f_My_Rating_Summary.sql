-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION My_Rating_Summary(@rider_id INT)
RETURNS TABLE
AS
RETURN(
	SELECT AVG(CAST(d.rider_rating AS DECIMAL(10,2))) AS avg_rating ,COUNT(d.rider_rating) AS ratings_count,
	COUNT(CASE WHEN d.rider_rating = 5 THEN 1 END) AS five_star,
	COUNT(CASE WHEN d.rider_rating = 4 THEN 1 END) AS four_star,
	COUNT(CASE WHEN d.rider_rating = 3 THEN 1 END) AS three_star,
	COUNT(CASE WHEN d.rider_rating = 2 THEN 1 END) AS two_star,
	COUNT(CASE WHEN d.rider_rating = 1 THEN 1 END) AS one_star

	FROM Delivery d
	WHERE d.rider_id = @rider_id
	GROUP BY d.rider_id
);
GO