go
--Ahmed Walid 64-25319 s3
create procedure Change_Active_Address 
@customer_id int, @new_address_id int
as
begin
if @customer_id is null or @new_address_id is null
return -1;

if not exists (select * from address where @customer_id=customer_id and @new_address_id=address_id) 
return -3;

update address set is_active= case when @new_address_id =address_id then 1 else 0 end
where @customer_id=customer_id
return 0;

end 
go