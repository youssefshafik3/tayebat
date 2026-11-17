--Ahmed Walid 64-25319 s3
go
create procedure  Add_Customer_Address 
@customer_id int, @description varchar(150), @zone_id int 
as 
begin
if @customer_id is null or @description is null or @zone_id is null 
return -1;

if exists (select * from address where @customer_id=customer_id and @description= description and @zone_id=zone_id)
return -2;





return 0;
end
go