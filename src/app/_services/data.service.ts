import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': "Origin, X-Requested-With, Content-Type, Accept"
    })
};

@Injectable({ providedIn: 'root' })
export class DataService {
    constructor(private http: HttpClient) { }

    getLineChartData() {
        return this.http.get(`${config.apiUrl}/getxy`);
    }

    getTableData() {
        return this.http.get(`${config.apiUrl}/gettableinfo`);
    }

    editRow(data) {
        return this.http.post(`${config.apiUrl}/editrow`, data, httpOptions);
    }

    deleteRow(id) {
        return this.http.get(`${config.apiUrl}/deleterow/${id}`);
    }

}