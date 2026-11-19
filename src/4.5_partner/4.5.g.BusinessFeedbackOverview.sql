--Omar Waleed El-sayed 64-29234

CREATE FUNCTION dbo.BusinessFeedbackOverview (@business_id INT)
RETURNS TABLE
AS
RETURN(
SELECT AVG(CAST(F.rating AS DECIMAL(10,2))) AS avg_rating, COUNT(F.feedback_id) AS number_of_feedbacks,
SUM(CASE WHEN F.rating = 5 THEN 1 ELSE 0 END) AS five_star, SUM(CASE WHEN F.rating = 4 THEN 1 ELSE 0 END) AS four_star, 
SUM(CASE WHEN F.rating = 3 THEN 1 ELSE 0 END) AS three_star, SUM(CASE WHEN F.rating = 2 THEN 1 ELSE 0 END) AS two_star,
SUM(CASE WHEN F.rating = 1 THEN 1 ELSE 0 END) AS one_star
FROM  Business B
LEFT OUTER JOIN SubOrder S ON S.business_id = B.business_id
LEFT OUTER JOIN Feedback F ON S.suborder_id = F.suborder_id
WHERE B.business_id = @business_id
GROUP BY B.business_id
);
GO

