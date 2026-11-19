-- Omar Waleed El-sayed 64-29234

GO
CREATE VIEW BusinessRatingsSummary
AS

SELECT b.business_id,b.name AS business_name,
AVG(CAST(f.rating AS DECIMAL(10,2))) AS avg_rating,COUNT(f.rating) AS ratings_count

FROM Business b LEFT OUTER JOIN 
(SubOrder so LEFT OUTER JOIN Feedback f ON so.suborder_id=f.suborder_id)
ON b.business_id = so.business_id

GROUP BY b.business_id , b.name


GO