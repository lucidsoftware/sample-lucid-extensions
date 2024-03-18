# Lucid example REST API application
## Description

This is a basic application built using the [NestJS framework](https://developer.lucid.co/rest-api) that demonstrates how to integrate with [Lucid](https://lucid.co/) using the [REST API](https://developer.lucid.co/rest-api).

The application allows a user to connect their Lucid account using the [OAuth 2.0 Authentication](https://developer.lucid.co/rest-api/v1/#authentication) and then request the Lucid's user profile information to display it in the UI.

![REST API application demo](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/example_rest_api_demo.gif)

## How to use Lucid's REST API

The goal of this application is to provide guidance on how you can integrate your application with Lucid. The first step to use Lucid's API is getting an OAuth 2.0 token.
### Obtaining an OAuth 2.0 token

Once the user has logged into the application they will see this UI:

![Connect account page](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/example_rest_api_connect_account.png)

The behavior of this UI is powered by the [Connect script](assets/scripts/connect.js). When the button is clicked, it will open a new window with the URL https://localhost:4000/oauth2/authorize

```js
// src: assets/scripts/connect.js

...
  const popup = window.open('/oauth2/authorize', '_blank');
...
```

The request will be handled by the `authorize` method in the [OAuth2Controller](src/oauth2//oauth2.controller.ts). Here we apply CSRF prevention techniques and redirect to [Lucid's authorization URL](https://developer.lucid.co/rest-api/v1/#access-token-endpoints). 

The user will be prompted with the OAuth 2.0 authorization page.

![Lucid authorization page](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/example_rest_api_authorization_page.png)

If the user grants access to the application by clicking on `Grant Access` button. This page will redirect to the provided redirect URI and will include the OAuth 2.0 authorization code in the query parameters. This request is handled by the `handleRedirect` method in the [OAuth2Controller](src/oauth2//oauth2.controller.ts).

The controller completes the CSRF protection verification and uses the code included in the query parameter to perform the [OAuth2 token request](https://developer.lucid.co/rest-api/v1/#create-access-token). The obtained token is then stored and associated to the logged in user.

```ts
// src: src/oauth2/oauth2.controller.ts

...
  const token = await this.oauth2Service.authorizationCodeGrant(
    code as string,
  );

  this.userRepository.setTokenForUser(loggedInUser, token);
...
```

Finally, the controller sends the [handle connection view](views/handleconnection.hbs) which when loaded in the popup window, will notify the connection success to the parent window. The parent window then, closes the popup and reloads the page.

```js
// views/handleconnection.hbs
...
  if(!!window.opener) {
      window.opener.postMessage('Success', '/')
  }
...

// assets/scripts/connect.js
...
  const postMessageListener = window.addEventListener('message', (event) => {
    if (event.source === popup) {
      if (event.data === 'Success') {
        window.location.reload();
      } else {
        console.error(`Something went wrong, got ${event.data} back`);
      }

      // Cleanup
      clearInterval(closedPopupInterval);
      window.removeEventListener('message', postMessageListener);
      popup.close();
    }
  });
...

```

### Using the access token

Once the application has an access token for a given user, we use it to retrieve the [Lucid profile](https://developer.lucid.co/rest-api/v1/#get-profile86).

The application `/api/profile` endpoint in the [ApiController](src/api/api.controller.ts) is responsible for getting the OAuth2 token associated to the logged in user, verifying it has not expired or refreshing it, and then using it to make the profile request.

```ts
// src: src/api/api.controller.ts
...
  async getProfile(
    @Res({ passthrough: true }) res: Response,
  ): Promise<RawProfile> {
    const username = res.locals.username;
    const validAccessToken = await this.oauth2TokenService.getValidTokenForUser(
      username,
    );

    if (!validAccessToken) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const profile = await this.apiService.getProfile(validAccessToken);

    return profile.toRaw();
  }
...


// src: src/api/api.service.ts
...
  async getProfile(accessToken: string): Promise<Profile> {
    const response = await axios.get(
      this.config.lucidApiUrl + '/users/me/profile',
      {
        headers: { 
          'Lucid-Api-Version': this.config.apiVersion,
          'Authorization': `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status !== 200) {
      throw Error(
        `Failed to retrieve user profile, got ${response.status} ${response.statusText}: ${response.data}`,
      );
    }

    return new Profile(response.data);
  }
...
```

The front-end then displays the profile information:

![Lucid profile](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/example_rest_api_profile.png)

Lucid offers an extensive list of APIs that you can use. Check our [documenation](https://developer.lucid.co/rest-api) for an up-to-date list.

### Using the unfurling API
The unfurling API allows users to embed and view Lucid documents easily by entering a document link. 
![alt text](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/unfurl.png)

## Runinng the application

### Requirements
1. Create a Lucid OAuth 2.0 application. Check [our documenation](https://developer.lucid.co/guides/#step-1-create-a-new-application-on-the-developer-portal) for more information on how to do it.
2. Rename the `default.env.example` in the root directory to `default.env`.
3. Fill in the `CLIENT_ID` and `CLIENT_SECRET`.

### Running the app with Docker

Running the application with Docker is super simple. Run the following command to build the application docker image. 

```
docker build -t example-lucid-rest-api-integration .
```

Once the image has been created, you run the following command to run the image:

```
docker run -p 4000:4000 example-lucid-rest-api-integration
```

The application runs in the port 4000 by default, now you can acces the app by going to http://localhost:4000

### Local setup

To make changes to the code you will need to install the node modules using npm:

```
npm install
```

You can run the application in development mode with the following command:

```
npm run dev
```

Look at the [NestJS documenation](https://docs.nestjs.com/first-steps) for more instructions on how to run the application.

## Resources

- Author - [Carlos Amador](https://github.com/camador-lucid)
- Lucid documention - [https://nestjs.com](https://developer.lucid.co/)
- Lucid  - [@nestframework](https://twitter.com/nestframework)

## License

[Apache 2.0](LICENSE)
