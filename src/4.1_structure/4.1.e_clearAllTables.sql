-- Youssef Sameh 64-10650
CREATE PROCEDURE clearAllTables
AS
    TRUNCATE TABLE Feedback;
    TRUNCATE TABLE Payment;
    TRUNCATE TABLE Delivery;
    TRUNCATE TABLE Pharmacy;
    TRUNCATE TABLE Restaurant;
    TRUNCATE TABLE Card;
    TRUNCATE TABLE SubOrder;
    TRUNCATE TABLE Rider;
    TRUNCATE TABLE Orders;
    TRUNCATE TABLE CartItem;
    TRUNCATE TABLE Cart;
    TRUNCATE TABLE Voucher;
    TRUNCATE TABLE Favorite_Business;
    TRUNCATE TABLE Favorite_Product;
    TRUNCATE TABLE Product;
    TRUNCATE TABLE Address;
    TRUNCATE TABLE Business_Phone;
    TRUNCATE TABLE Business;
    TRUNCATE TABLE Blacklist;
    TRUNCATE TABLE Customer;
    TRUNCATE TABLE Partner;
    TRUNCATE TABLE User_Phone;
    TRUNCATE TABLE Admin;
    TRUNCATE TABLE Users;
    TRUNCATE TABLE Zone; 
GO