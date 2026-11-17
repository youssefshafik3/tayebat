-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION My_Rating_Summary(@rider_id INT)
RETURNS TABLE
AS
RETURN(
	SELECT AVG(f.rating) AS avg_rating ,COUNT(f.rating) AS ratings_count,
	COUNT(CASE WHEN f.rating = 5 THEN 1 END) AS five_star,
	COUNT(CASE WHEN f.rating = 4 THEN 1 END) AS four_star,
	COUNT(CASE WHEN f.rating = 3 THEN 1 END) AS three_star,
	COUNT(CASE WHEN f.rating = 2 THEN 1 END) AS two_star,
	COUNT(CASE WHEN f.rating = 1 THEN 1 END) AS one_star

	FROM Rider r LEFT OUTER JOIN (Delivery d 
	INNER JOIN(SubOrder so LEFT OUTER JOIN Feedback f ON f.suborder_id = so.suborder_id) 
	ON so.suborder_id = d.suborder_id) ON r.rider_id = d.rider_id
	WHERE r.rider_id = @rider_id
);
GO