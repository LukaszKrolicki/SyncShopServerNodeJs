# :computer: SyncShopServer

Node.js was chosen as the platform for this application for several reasons:

• Asynchronicity and Performance: The asynchronous nature of Node.js makes it ideal for handling multiple requests simultaneously without blocking threads, which is crucial for high-traffic web applications.

• Ecosystem and Community: Node.js boasts a vast ecosystem of packages available through npm (Node Package Manager). This enables rapid addition of functionality to the application by leveraging existing modules.

• Ease of Scaling: Applications written in Node.js are easy to scale, allowing for seamless growth as demand increases.

-----------------------------------------------------

![image](https://github.com/LukaszKrolicki/SyncShopServerNodeJs/assets/54467678/c2948790-37e4-4388-9dc2-6cd95cf4279b)

The app.js file contains the configuration and main logic of the Express.js server. It manages routes, user sessions, authentication, and various user and shopping list management functions.

## Authentication using Passport.js:

passport.use(new LocalStrategy(...)): We use the local strategy of Passport.js to authenticate users using their username and password. We check if the user exists and then verify the password using bcrypt.

![image](https://github.com/LukaszKrolicki/SyncShopServerNodeJs/assets/54467678/7100d50e-7f14-4680-b629-a76eeff7ca26)

passport.serializeUser(...) and passport.deserializeUser(...): These functions manage the serialization and deserialization of users to store user session information.

![image](https://github.com/LukaszKrolicki/SyncShopServerNodeJs/assets/54467678/01176baa-857a-485e-ac82-b87263a61d15)

## Session Handling:

app.use(session(...)): Configuration of sessions using express-session. Sessions are used to maintain the logged-in state of the user across different requests.

![image](https://github.com/LukaszKrolicki/SyncShopServerNodeJs/assets/54467678/f90f9df6-73cb-418b-bffa-427c53fa3c4b)

## Authentication Routes:

![image](https://github.com/LukaszKrolicki/SyncShopServerNodeJs/assets/54467678/7cfc4b58-ad81-46f8-acac-0e914e72484b)

## Helper functions for authorization:

![image](https://github.com/LukaszKrolicki/SyncShopServerNodeJs/assets/54467678/ad7de35c-2f8f-4a4a-a840-d111bfa3e022)

## Password Encryption:

For encrypting user passwords, we use the bcrypt library. bcrypt is widely regarded as a secure tool for hashing passwords due to its salt function and multiple hashing mechanism, which makes brute force attacks (a trial-and-error method used to crack passwords or encryption keys by systematically checking all possible combinations) more difficult.

## Summary:

The entire code in app.js is designed to enable comprehensive management of users and shopping lists, while ensuring security through user authentication and authorization, as well as error handling.

The database.js file is responsible for establishing a connection with the MySQL database using the mysql2 library. The connection configuration is retrieved from the .env file, which stores authentication data in environment variables.



