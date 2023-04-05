
# Meeseeks 
Meeseeks is an app that redirects you to different URLs every time you hit a specific URL. The URLs can be images or different websites. You can set the time when you want to be redirected, such as every hour or every week. This app is specifically designed for cases where you can use a URL as an input box. When a user enters their specific URL, the app checks for any cache data in memory. If it's not found, the app finds a URL from the user's pool of URLs and redirects them to that URL. It's primarily focused on latency

***Features***:
 - Random Redirection
 - Periodical Redirection
 - Time for changing redirected URL
 - User Database
 - Easily deployable
 - Simple Authentication
 - Updating URLs, time, etc.
 - Focused on latency by using in-memory cache

***Downside***
 - No guarantee that the URL change will happen in time. 
 - No password reset functionality
 - Have bugs



## FAQ
-   **How to use it?**
    
    To use the URL Redirect app, first, register yourself. Then go to the settings page, which can be accessed from the old user page. Add the URLs that you want to be redirected to. Then select whether you want to get randomly redirected every time you hit your URL or get redirected one after another by selecting the _Use randomness_ option to false or true. If true, you will be randomly redirected; otherwise, in a serialized manner.
    
    Next, select how often you want your URL to change. Here are the options:
    
    -   Every Request - Every time you hit your URL, you will be redirected to a different URL.
    -   Every Minute - In your first request, you will be redirected to one URL. If you request it again within a minute, you will be redirected to the same URL. After a minute, if you hit your URL, it will change to a different one based on your randomness preference. If you or anyone doesn't hit your URL then it will not change untill you do.
    -   Every Hour - Your URL will stay the same for every hour, then it will change. The same case applies to days and months. 
   
    Remember to save your password because there is no reset option.
    
-   **Is it necessary for me to go to the address to change everytime?**
    
    No, it's not necessary. If anyone visits your URL, they will be redirected to your URL Redirected URL everytime, and the time will be set if applicable.
    
-   **How to reset the password?**
    
    Unfortunately, there is no option to reset your password at this time. You can create a new account and import your settings, though.
    
-   **How to delete a URL?**
    
    To delete a URL, simply replace the URL you want to remove with an existing URL. For example, if you want to delete URL2, replace it with URL3. There will be duplicate URLs, but don't worry about them as they will be removed in the backend. Remember to save your changes. You must have at least two URLs in your settings, or I will take care of that.
    
-   **Why isn't there a button to remove a URL?**
    
    This is a future plan that I have.
    
-   **Why hasn't my URL changed in an hour?**
    
    Someone from the world must hit your URL to trigger the change. If no one hits your URL, it will not change until someone does.
    
-   **Why isn't it a guarantee that my URL will change every hour or every minute?**
    
    The system is designed in such a way that the URL change function only runs when someone hits your URL. If I were to implement a clock inside the app to guarantee changes on a time basis, it would add much complexity and infrastructure cost.
    
-   **Why isn't there a password reset option?**
    
    Similar to the previous answer, adding a password reset option would add complexity and infrastructure cost. If you lose your password, your only option is to use the import/export settings feature.
    
-   **How to use the import/export option?**
    
    To use the import/export option, create a new user first. Then go to the Import/Export page and provide your user details. Your old/copyable user data will be added to your new account. Save it with your password.
    
-   **What are the best settings?**
    
    The best settings are Every Minute and 30 Random URLs. Also, remember that URLs cannot be longer than 700 characters.
    
-   **How to report a problem?**
    
    You can email me at [mt4ui6s1l@mozmail.com](mailto:mt4ui6s1l@mozmail.com) or create an issue on GitHub.
    
-   **Am I allowed to collaborate?**
    
    Yes, 1000000%!

-  **Are there any security issues?**
	
	Maybe.

-  **Who are the users?**
	
	 - Where someone can use the URL to change the image.
	 - Where someone wants to add randomness with a URL.
	 - TorrentBD
	 

## How to Deploy Locally

To deploy the `meeseeks` application locally, follow the steps below:

1. **Setup Environment Variables**: Create a `.env` file in the root directory of your project and populate it with the following sample environment variables:
```
PORT=3000
USER_LIMIT = 300

#don't forget the database name (in this sample, it's 'userdata12'). if you wish to use multiple names, please have a look at this https://github.com/fastify/fastify-mongodb
MONGODB_URI=mongodb+srv://username:password@mongodb.net/userdata12?retryWrites=true&w=majority

#don't use your personal email.
CONTACT_EMAIL = admin@email.com
```
Remember to replace `username,` `password,` and other sensitive information with your own.

2. **Configure Database**: Don't forget to set the database name (in this example, it's `userdata`). If you want to use multiple names, refer to the [fastify-mongodb documentation](https://github.com/fastify/fastify-mongodb).

3. **Install Dependencies**: Run `npm install` in your project directory to install the necessary dependencies specified in the `package.json` file.

4. **Run the Application**: Use one of the following scripts to start the application:

- For production, run `npm start`
- For development, run `npm run dev`

Once the application runs, it will be accessible at `http://localhost:3000`.
Before deploying the `meeseeks` application locally, users must have the following installed on their system:

1.  **Node.js**: A compatible version of Node.js is required to run the application. You can download it from the [official Node.js website](https://nodejs.org/).
    
2.  **npm**: The Node.js package manager (npm) is required to install dependencies. It is included with Node.js by default, so you don't need to install it separately.
    
3.  **MongoDB**: A MongoDB database is needed to store the application's data. Users can either set up a local MongoDB instance or use a cloud-based service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
    

Once these requirements are met, users can follow the instructions provided in the markdown above to deploy the `meeseeks` application locally.

You can also easily deploy them in [fly.io](https://fly.io/docs/flyctl/deploy/) or [Railway.app](https://docs.railway.app/) (tested platforms.)  
