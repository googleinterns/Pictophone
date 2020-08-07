# Pictophone

Pictophone is a real-time multiplayer drawing game built to solve the logistical problems around playing visual telephone between friends.

## Screenshots
Dashboard <br />
<img src="https://user-images.githubusercontent.com/44682631/89606323-7f09ea80-d824-11ea-8194-7c9a8b57e5f1.png" width=400>
<br /> 
In-game canvas ability <br />
<img src="https://user-images.githubusercontent.com/44682631/89606480-ecb61680-d824-11ea-91fa-bea6484cee16.png" width=400>

## Technologies Used
### Frontend
- [React](https://reactjs.org/)
- [literallycanvas](http://literallycanvas.com/)
- [Fabric.js](http://fabricjs.com/)

### Backend
- [Spring Boot framework](https://www.tutorialspoint.com/spring_boot/spring_boot_introduction.htm)
- [Gmail API](https://developers.google.com/gmail/api)

### Google Cloud Platform
- Hosted on [Google App Engine](https://cloud.google.com/appengine)
- [Google Cloud Storage](https://cloud.google.com/storage)
- [Cloud Vision API](https://cloud.google.com/vision)
- [Cloud functions](https://cloud.google.com/functions)
- [Firebase platform](https://firebase.google.com/)
    - [Firebase auth](https://firebase.google.com/docs/auth)
    - [Cloud Firestore](https://firebase.google.com/docs/firestore)

## CLI Tools
This project makes use of the `gcloud` SDK for project deployment to Google Cloud, the `npm` package manager for Node.js, and the `nvm` Node.js version manager. Node.js 10 is the specific version required for this project.

Install `gcloud`:
```
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get install apt-transport-https ca-certificates gnupg
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
sudo apt-get update && sudo apt-get install google-cloud-sdk
```
Then run `gcloud init` to specify that development is being done on the correct GCP project.

To access the Google APIs used in this project, make sure you are logged in to use Application Default Credentials (ADC) for this project.
```
gcloud auth application-default login
```

Install `nvm`:
```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

Install `npm`:
```
nvm install node
```

Using Node.js 10:
```
nvm install 10
nvm use 10
```

## Project Structure
This project consists of a frontend component and a backend component.

### Frontend
The frontend is built using React.js and makes use of Firebase. It has the following (simplified) directory tree:
```
client/
├── package.json
├── package-lock.json
├── public
│   └── ...
├── src
│   ├── index.js
│   ├── components
│   │   └── ...
│   ├── constants
│   │   └── ...
│   └──...
└── ...
```
The `package.json` and `package-lock.json` files contain all the dependencies for the frontend component, including React, while the `public` subdirectory contains the `index.html` file as well as other external assets that may be needed, such as images. The `src` subdirectory contains the main bulk of the React code.

#### `src` Directory

##### 'index.js' File
The index.js file contained in the src directory is the main entrypoint for the web application, as it is used to render the `root` div element in index.html. It currently uses whatever is defined by the App component.

##### `components` Subdirectory
The components subdirectory contains all the various components and pages to be used in the web application. Each component should be placed in its own directory, with public facing parts exported in an `index.js` file. For example, if a component named "Navbar" was being developed, it should have at the very least `src/components/Navbar/index.js`. Any other JS files can be placed in the Navbar directory, but public facing parts should be exported in `index.js`. Another component, say "TestComponent", can then access Navbar via `import '../Navbar'`.

###### The `App` Component
The most important component in the components subdirectory, which is ultimately what is fed into `src/index.js`. This component uses React Router (`import 'react-router-dom'`) to specify which pages of the web application can be visited and what component each of these pages uses.

##### 'constants' Subdirectory
Contains any global constants for the projects. Currently contains a [routes.js](client/src/constants/routes.js) file that defines and exports the names for URL paths.

### Backend
The backend runs on the Spring Boot framework and is built using Maven. It has the following (simplified) directory tree:
```
api/
├── pom.xml
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── google
│   │   │           └── sps
│   │   │               └── ...
│   │   └── resources
│   │       └── application.properties
│   └── test
│       └── java
│           └── com
│               └── google
│                   └── sps
|                       └── ...
└── ...
```
Servlets developed in the backend must be routed to the prefix `/api/` in the `@RequestMapping` annotation, e.g.:
```
@RequestMapping(value = "/api/test-servlet", method = RequestMethod.GET)
@ResponseBody
public String testGet() {
    return "This is a test";
}
```
The servlet can then be accessed from the frontend with a fetch request, e.g. `fetch('api/test-servlet').then( ... )`.

Images are uploaded and downloaded to and from private Google Cloud Storage buckets. A [service account key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys) is required to sign URLs and retrieve them.

Emails are sent with the Gmail API. This must be turned on, and a [credentials file](https://developers.google.com/gmail/api/quickstart/java) must be used to authorize the email sending.
## Styling
The React Bootstrap tool was imported for use in the frontend. Available components can be found [here](https://react-bootstrap.github.io/components/alerts/).

## Testing
There is no testing currently set up, but it is something we have our eyes on.

## Running Locally

The frontend and backend components must be run in two separate terminals.

Frontend (from the `client` directory):
If you are pulling new changes or running for the first time, make sure you have all the dependencies from our `package-lock.json`.
```
npm ci
```
Now, you just need to start the service!
```
npm start
```

Backend (from the `api` directory):
```
mvn spring-boot:run
```

When testing in this environment, any changes made to the frontend code will be immediately updated and redployed locally in realtime. Maven must be stopped and rerun when any changes are made to the backend code.

## Deploying

The frontend and backend components must be deployed separately:

Frontend (from the `client` directory):
```
npm run build
gcloud app deploy client.yml
```

Backend (from the `api` directory):
```
mvn package
gcloud app deploy api.yml
```

## License
[Apache 2.0](https://github.com/googleinterns/Pictophone/blob/master/LICENSE)
