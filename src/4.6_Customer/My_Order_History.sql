go
--Ahmed Walid 64-25319 s3
create function dbo.My_Order_History(@customer_id int)
returns table
as
return(
select o.order_id as order_id,
o.order_date as order_date,
z.zone_name as zone_name,
o.status as status,
count(so.suborder_id) as number_of_suborders,
o.discount_amount as discount_amount,
o.total_amount as total_amount,
p.method as payment_method,
p.refunded_amount as refunded_amount
from orders o inner join zone z on z.zone_id=o.zone_id
inner join suborder so on o.order_id=so.order_id
left outer join payment p on p.order_id=o.order_id
inner join cart c on c.cart_id=o.cart_id
where c.customer_id=@customer_id
group by o.order_id,o.order_date,z.zone_name,o.status,o.discount_amount,o.total_amount,p.method,p.refunded_amount
)

go