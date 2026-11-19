--Ziad Yasser Ibrahim 65-33790

CREATE FUNCTION dbo.Search_Platform (@customer_id INT, @keyword VARCHAR(100))
RETURNS TABLE
AS 
RETURN(
SELECT TOP 100 PERCENT B.business_id, B.name AS business_name, CASE WHEN B.name = @keyword THEN 1 
WHEN B.name LIKE @keyword + '%' THEN 2 ELSE 3 END AS priority
FROM Business B
INNER JOIN Address A ON B.zone_id = A.zone_id
WHERE A.customer_id = @customer_id AND A.is_active = 1 AND B.status = 'Active'
AND @keyword IS NOT NULL AND LTRIM(RTRIM(@keyword)) <> '' AND B.name LIKE '%' + @keyword + '%'
ORDER BY priority ASC
);
GO

