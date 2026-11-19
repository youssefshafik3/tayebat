go 
--Ahmed Walid 64-25319 s3
create procedure Update_Delete_Customer_Address
@customer_id int, @address_id int, @description varchar(150), @zone_id int, @action varchar(20) 
as
begin

declare @validupd bit
select @validupd = case when exists(select * from cart c
inner join orders o on o.cart_id=c.cart_id
where @customer_id=c.customer_id and @address_id=c.address_id and o.status in ('Placed', 'In Progress') ) then 0 else 1 end

declare @validdel bit
select @validdel = case when not exists(select * from cart c 
where @customer_id=c.customer_id and @address_id=c.address_id )
then 1 else 0 end

if (@customer_id is null or @address_id is null or @action is null) or
(@action='update' and (@description is null or @description='' or @zone_id is null))or
(@action!='update' and @action!='delete')
return -1;

if not exists (select * from address where address_id=@address_id and @customer_id=customer_id)
return -3;

if @validupd=0 or (@action='delete' and @validdel=0)
return -4;

if @action='delete' and @validdel=1
begin
declare @wasactive bit
select @wasactive=(select is_active from address where @address_id=address_id and @customer_id=customer_id and is_active=1)
delete from address where @address_id=address_id and @customer_id=customer_id

if @wasactive=1
update address set is_active=1 where address_id=(select min(address_id) from address where customer_id=@customer_id)
end

if @validupd=1 and @action='update'
update address set description=@description, zone_id=@zone_id where @address_id=address_id and @customer_id=customer_id

return 0;
end
go