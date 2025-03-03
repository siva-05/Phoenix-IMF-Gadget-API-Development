NOTE:
For operations like add, update, delete, destroy we need JWT token(which is generated when we login)
We need to add it to the Authorization header of your request,Here's how you can do it:


Open Postman:
Go to the Headers Tab:
In the Key field, enter Authorization.
In the Value field, enter Bearer YOUR_JWT_TOKEN. 

(or)

Go to the Authorization Tab: 
From the Type dropdown, select Bearer Token.
In the Token field, enter your JWT token.

