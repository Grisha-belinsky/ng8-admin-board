import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { User } from '@/_models';
import { UserService, AuthenticationService, DataService } from '@/_services';

/* == Import Chart === */
import { ChartDataSets, ChartType, ChartOptions } from 'chart.js';
import { Color, Label, SingleDataSet, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import {NgbModal, ModalDismissReasons, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit {
    currentUser: User;
    users = [];
    cData:any;  // Chart Data -> {"x": [val1, val2, val3, val4, ....], "y": [val1, val2, val3, val4, .....]}
    tData:any;  // Table Data -> [{"id": "id_value", "col1": val1, "col2": val2, ..., "coln": valn}, {.....}, {.....}]

    chartDataLoaded = false;
    tableDataLoaded = false;

    // Modal Options
    closeResult: string;
    modalOptions:NgbModalOptions;
    submitted = false;
    loading = false;
    editForm: FormGroup;

    modalData = {
        id: '',
        col1: '',
        col2: ''
    };

    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private dataService: DataService,
        private modalService: NgbModal,
        private formBuilder: FormBuilder,
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
        monkeyPatchChartJsTooltip();
        monkeyPatchChartJsLegend();
        this.modalOptions = {
            backdrop:'static',
            backdropClass:'customBackdrop'
        }
    }

    ngOnInit() {
        this.loadAllUsers();
        this.getLineChartData();
        this.getTableData();

        this.editForm = this.formBuilder.group({
            id: ['', Validators.required],
            col1: ['', Validators.required],
            col2: ['', Validators.required],
        });
    }

    deleteUser(id: number) {
        this.userService.delete(id)
            .pipe(first())
            .subscribe(() => this.loadAllUsers());
    }

    private loadAllUsers() {
        this.userService.getAll()
            .pipe(first())
            .subscribe(users => {
                this.users = users;
            });
    }

    private getLineChartData() {
        this.dataService.getLineChartData()
            .pipe(first())
            .subscribe(data => {
                this.cData = data;
                this.chartDataLoaded = true;
                this.lineChartData = [{
                    data: this.cData.y,
                    label: 'Crude oil prices'
                }];
                this.lineChartLabels = this.cData.x;
            });
    }

    private getTableData() {
        this.dataService.getTableData()
            .pipe(first())
            .subscribe(data => {
                this.tData = data;
                this.tableDataLoaded = true;
            });
    }

    // convenience getter for easy access to form fields
    get f() { return this.editForm.controls; }

    open(content, item) {
        this.modalData.id = item.id;
        this.modalData.col1 = item.col1;
        this.modalData.col2 = item.col2;

        this.modalService.open(content, this.modalOptions).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }
     
    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
    }

    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.editForm.invalid) {
            return;
        }

        // this.loading = true;
        this.dataService.editRow(this.modalData)
            .pipe(first())
            .subscribe(data => {
                console.log(data);
                // this.loading = false;
                this.tData.forEach(item => {
                    if(item.id == this.modalData.id) {
                        item.col1 = this.modalData.col1;
                        item.col2 = this.modalData.col2;
                    }
                });
            });
    }

    delete(rowId) {
        this.dataService.deleteRow(rowId)
            .pipe(first())
            .subscribe(data => {
                console.log(data);
                let index = 0;
                this.tData.forEach(item => {
                    if(item.id == rowId) {
                        this.tData.splice(index, 1);
                    }
                    index++;
                });
            });
    }

    /* == Line Chart == */
    lineChartData: ChartDataSets[];

    lineChartLabels: Label[];

    lineChartOptions = {
        responsive: true,
    };

    lineChartColors: Color[] = [
        {
        borderColor: 'black',
        backgroundColor: 'rgba(255,255,0,0.28)',
        },
    ];

    lineChartLegend = true;
    lineChartPlugins = [];
    lineChartType = 'line';

    /* === Bar Chart == */
    barChartOptions: ChartOptions = {
        responsive: true,
    };
    barChartLabels: Label[] = ['Apple', 'Banana', 'Kiwifruit', 'Blueberry', 'Orange', 'Grapes'];
    barChartType: ChartType = 'bar';
    barChartLegend = true;
    barChartPlugins = [];

    barChartData: ChartDataSets[] = [
        { data: [45, 37, 60, 70, 46, 33], label: 'Best Fruits' }
    ];

    /* === Pie Chart === */
    public pieChartOptions: ChartOptions = {
        responsive: true,
    };
    public pieChartLabels: Label[] = [['SciFi'], ['Drama'], 'Comedy'];
    public pieChartData: SingleDataSet = [30, 50, 20];
    public pieChartType: ChartType = 'pie';
    public pieChartLegend = true;
    public pieChartPlugins = [];
}