# Meeseeks

Meeseeks is a web application that offers a unique and fun browsing experience by redirecting users to different URLs every time they hit a specific URL. The app allows users to set up a pool of URLs that can be images or different websites and specify the time interval for redirection, such as every hour or every week.

Meeseeks is especially useful in cases where a URL can be used as an input box/ or the browser is fetching data from the link. When a user enters their specific URL, the app checks for any cache data in memory. The user is immediately redirected to the URL if the cache data is found. If it's not found, the app selects a URL from the user's pool of URLs and redirects them to that URL.

Meeseeks is designed by focusing on latency.

**_Features_**:

- Random Redirection

- Periodical Redirection

- Time for changing redirected URL

- User Database

- Easily deployable

- Simple Authentication

- Updating URLs, time, etc.

- Focused on latency by using in-memory cache

**_Downside_**

- No password reset functionality

- Have bugs may be ¯\_(ツ)\_/¯

## Demo

![Meeseeks Demo](https://f000.backblazeb2.com/file/ShareX2022/ShareX/chrome_fYPGukqUvq.gif "Demo how meeseeks redirects / images change for request/reload.")

## FAQ

- **How to use it?**

To use the URL Redirect app, first register yourself. Then go to the settings page, which can be accessed from the old user page. Add the URLs that you want to be redirected to. Then select whether you want to get randomly redirected every time someone hit your URL or get redirected one after another by selecting the _Use randomness_ option to true or false. If true, you will be randomly redirected; otherwise, it will be in a serialized manner. There is also a option called _Guarantee Periodicity_ which I described below.

Next, select how often you want your URL to change. Here are the options:

- Every Request - Every time you hit your URL, you will be redirected to a different URL.

- Every Minute - You will be redirected to one URL in your first request. If you request it again within a minute, you will be redirected to the same URL. After a minute, if you/someone hit your URL, it will change to a different one based on your randomness preference. If you or anyone doesn't hit your URL, it will not change.

- Every Hour - Your URL will stay the same for an hour after a URL hit, then it will change(dependent on Guarantee Periodicity settings). The same case applies to days and weeks.

Then click update. It will update your settings and resets your timings.

Remember to save your password because there is no reset option when registering as a new user.

- **Is it necessary for me to go to the address to change every time?**

No, it's not necessary. If anyone visits your URL,then it will trigger the change based on settings.

- **How to reset the password?**

Unfortunately, there is no option to reset your password at this time. You can create a new account and import your settings, though.

- **How to delete a URL?**

To delete a URL, simply replace the URL you want to remove with an existing URL. For example, if you want to delete URL2, replace it with URL3. There will be duplicate URLs; don't worry about them, as they will be removed in the backend. Remember to save your changes. You must have at least two URLs in your settings, or the system will handle that.
OR
Delete the URL/clear the field/ have a blank field, and then use the REMOVE BLANK FIELD button to remove the link and update.

- **How to reset my timing and link starting point?**

When you update your profile, it resets everything.

- **What is this app does?**

This web application allows you to change your profile picture URL to multiple URLs so that each time someone views your profile picture, they are redirected to a different URL from the list of URLs you have provided. This feature can be used for various purposes, such as having fun with friends or an audience or simply adding variety to your profile picture.

For another instance, you can set a list of URLs with random websites or images and share the link. Each time someone visits the link, they will be surprised with different content every time. This feature can be used to keep your audience engaged and entertained. Because no one will know what will be shown to them

- **What is Guarantee Periodicity?**

If the option is _false_, someone from the world must hit your URL to trigger the change. If no one hits your URL, it will not change until someone does. To clarify, if someone saves an option like "Every Hour," they might expect the URL to change at specific times, like 1:00 PM, 2:00 PM, and 3:00 PM. However, that's not how it works. The URL will only change when someone hits it. For instance, if someone visits the URL at 1:35 PM, it will remain the same until 2:35 PM, but after that, it will only change when someone hits it again. If nobody hits the URL, it will not change forever.

If the option is _true_ then no matter when someone hits your URL, they will be redirected to the specific URL for that time. For example, some save URLs at 8:23 PM; then, for the next hour, the profile will be URL 1; after 9:23 PM, it will be URL2. Then URL 3 in 10:23 PM.

- **Why isn't it a guarantee that my URL will change every minute?**

Because guaranteeing timing for every minute looks inefficient to me.

- **Why isn't there a password reset option?**

Adding a password reset option would add complexity and infrastructure cost. If you lose your password, your only option is to use the import/export settings feature.

- **How to use the import/export option?**

To use the import/export option, create a new user first. Then go to the Import/Export page and provide your user details. Your old/copyable user data will be added to your new account. Save it with your new account's password.

- **What are the best settings?**

The best settings are Every Minute and 30 Random URLs. Also, remember that URLs cannot be longer than 700 characters.

- **How to report a problem?**

You can email me at [mt4ui6s1l@mozmail.com](mailto:mt4ui6s1l@mozmail.com) or create an issue on [Github](https://github.com/Thenafi/meeseeks).

- **Am I allowed to collaborate?**

Yes, 1000000%!

- **Are there any security issues?**

Maybe.

- **Who are the users?**

1. Where someone can use the URL to change the image.

2. Where someone wants to add randomness with a URL.

3. TorrentBD Users Profile Pic

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

1. **Node.js**: A compatible version of Node.js is required to run the application. You can download it from the [official Node.js website](https://nodejs.org/).

2. **npm**: The Node.js package manager (npm) is required to install dependencies. It is included with Node.js by default, so you don't need to install it separately.

3. **MongoDB**: A MongoDB database is needed to store the application's data. Users can either set up a local MongoDB instance or use a cloud-based service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

Once these requirements are met, users can follow the instructions provided in the markdown above to deploy the `meeseeks` application locally.

You can also easily deploy them in [fly.io](https://fly.io/docs/flyctl/deploy/) or [Railway.app](https://docs.railway.app/) (tested platforms.)
