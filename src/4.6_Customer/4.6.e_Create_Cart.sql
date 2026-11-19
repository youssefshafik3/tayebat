go
--Ahmed Walid 64-25319 s3
create procedure Create_Cart
@customer_id int
as 
begin
declare @add int
select @add=(select a.address_id from address a where a.customer_id = @customer_id and a.is_active=1 )
if @customer_id is null
return -1;

if exists(select* from users where @customer_id=user_id and account_status='Blacklisted')
return -3;

if @add is null
return -1;

if exists(select * from cart c 
where customer_id = @customer_id and address_id = @add and status = 'Active')
return -2;



insert into cart (customer_id,address_id) values(@customer_id,@add)
return 0;
end 
go