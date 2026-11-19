go
--Ahmed Walid 64-25319 s3
create procedure  Add_Customer_Address 
@customer_id int, @description varchar(150), @zone_id int 
as 
begin
if @customer_id is null or @description is null or @zone_id is null  or trim(@description)=''
return -1;

--if exists (select * from address where @customer_id=customer_id and @description= description and @zone_id=zone_id)
--return -2;


update address set is_active= 0
where @customer_id=customer_id
insert into address (customer_id, description, zone_id)
values(@customer_id, @description, @zone_id)

return 0;
end
go