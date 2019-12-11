# simple angular-8-admin dashboard

API config url: webpack.config.json

1. Getting started
    install latest version node.js
    run command:
        > npm install
    run server:
        > npm start

2. login component
    component: src/app/login
    sevice: src/app/_services/authentication.service.ts

3. register component
    src/app/register
    service: src/app/_services/user.service.ts

4. dashboard component
    src/app/home
    model: src/app/_model/user.ts
    service: src/app/_services/...

5. login api endpoint
    src/app/_services/authentication.service.ts
    -> config.apiUrl/auth

6. register api endpoint
    service: src/app/_services/user.service.ts
    -> config.apiUrl/users/register

7. data api endpoints
    service: src/app/_services/data.service.ts
    -> There are endpoints