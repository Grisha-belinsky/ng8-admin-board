import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

// array in local storage for registered users
let users = JSON.parse(localStorage.getItem('users')) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/auth') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users/register') && method === 'POST':
                    return register();
                case url.endsWith('/editrow') && method === 'POST':
                    return editTableRow();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.endsWith('/getxy') && method === 'GET':
                    return getChartData();
                case url.endsWith('/gettableinfo') && method === 'GET':
                    return getTableData();
                case url.match(/\/users\/\d+$/) && method === 'DELETE':
                    return deleteUser();
                case url.match(/\/deleterow\/\d+$/) && method === 'DELETE':
                    return deleteTabelRow();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            const { username, password } = body;
            const user = users.find(x => x.username === username && x.password === password);
            if (!user) return error('Username or password is incorrect');
            return ok({
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                token: 'fake-jwt-token'
            })
        }

        function register() {
            const user = body

            if (users.find(x => x.username === user.username)) {
                return error('Username "' + user.username + '" is already taken')
            }

            user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));

            return ok();
        }

        function getUsers() {
            if (!isLoggedIn()) return unauthorized();
            return ok(users);
        }

        function deleteUser() {
            if (!isLoggedIn()) return unauthorized();

            users = users.filter(x => x.id !== idFromUrl());
            localStorage.setItem('users', JSON.stringify(users));
            return ok();
        }

        function getChartData() {
            let cData = {
                x: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Auguest', 'September', 'October', 'November', 'December'],
                y: [85, 72, 78, 75, 77, 75, 73, 68, 78, 79, 84, 80]
            }
            return ok(cData);
        }

        function getTableData() {
            let tData = [
                {id: "1", name: "Samppa Nori", date: "2019-11-01", role: "Member", status: "Active"},
                {id: "2", name: "Estavan Lykos", date: "2019-11-15", role: "Staff", status: "Banned"},
                {id: "3", name: "Chetan Mohamed", date: "2019-11-20", role: "Admin", status: "Inactive"},
                {id: "4", name: "Derick Maximinus", date: "2019-11-25", role: "Member", status: "Pending"},
                {id: "5", name: "Friderik Dávid", date: "2019-12-01", role: "Staff", status: "Active"},
            ];
            return ok(tData);
        }

        function editTableRow() {
            // let postData = body;
            let returnData = {status: "success", error: "none"};
            return ok(returnData);
        }

        function deleteTabelRow() {
            let returnData = {status: "success", error: "none"};
            return ok(returnData);
        }

        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function isLoggedIn() {
            return headers.get('Authorization') === 'Bearer fake-jwt-token';
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};