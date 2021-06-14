import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, of, Subscription, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { PaginationConstants } from '../enums/pagination-constants.enum';
import { Employee } from '../modal/employee.modal';
import { EmployeeService } from '../shared/employee.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  public get query(): string {
    return this.searchForm.get('query')!.value as string;
  }
  public set query(value: string) {
    this.searchForm.patchValue({ query: value });
  }

  public loading = false;
  public timer: Observable<any> = timer(2000);

  public employeeForm: FormGroup = this.fb.group({
    id: [''],
    name: [''],
    email: [''],
    mobile: [''],
    totalSales: [''],
    salary: [''],
    status: [false],
  });
  public employeeDetailsData: Employee = new Employee();
  public employeeList: Array<Employee> = [];
  public allEmployeeList: Array<Employee> = [];

  // search
  public searchForm = new FormGroup({ query: new FormControl('') });
  public match = '';

  // paginate
  public pageSize = Number(PaginationConstants.DEFAULT_PAGE_SIZE);
  public pageCount = 10;
  public pageIndex = 1;

  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private readonly ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.employeeForm.controls.status.setValue(false);

    this.fetchAllEmployees();

    // List search
    this.searchForm
      .get('query')
      ?.valueChanges.pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        switchMap((term) => {
          if (!term) {
            this.match = '';
          } else {
            const match = term.trim();
            if (match.length <= 2) {
              return of(null);
            }
            this.match = match;
          }

          return this.getAllEmployeeObservable();
        })
      )
      .subscribe((res: any) => {
        this.handleEmployeeResponse(res);
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public onSearch(text: string): void {
    this.searchForm.get('query')?.patchValue(text);
  }

  // Add or Update details
  public addOrUpdateEmployeeDetails(): void {
    this.employeeDetailsData = this.employeeForm.value as Employee;

    if (!this.employeeDetailsData.status) {
      this.employeeDetailsData.status = false;
    }

    if (
      this.employeeList.find(
        (value) => this.employeeDetailsData.id === value.id
      )
    ) {
      this.subscriptions.add(
        this.employeeService.updateEmployee(this.employeeDetailsData).subscribe(
          (res) => {
            alert('Updated Successfully !!');
            this.closeModel();
          },
          (err) => {
            alert('Something went wrong.');
          }
        )
      );
    } else {
      this.subscriptions.add(
        this.employeeService.addEmployee(this.employeeDetailsData).subscribe(
          (res) => {
            alert('Added Successfully');
            const ref = document.getElementById('cancel');
            this.closeModel();
          },
          (err) => {
            alert('Something went wrong.');
          }
        )
      );
    }
  }

  // To fetch List of Employees
  public fetchAllEmployees(): any {
    this.loading = true;
    this.subscriptions.add(
      this.getAllEmployeeObservable().subscribe((res) => {
        this.handleEmployeeResponse(res);
      })
    );
  }

  private getAllEmployeeObservable(): Observable<Employee> {
    return this.employeeService.fetchAllEmployees$(
      this.pageIndex,
      this.pageSize,
      this.match
    );
  }

  private handleEmployeeResponse(response: any): any {
    this.allEmployeeList = [...response];

    this.pageCount = this.employeeList.length / this.pageSize;
    const newData =
      this.pageIndex === 1
        ? this.allEmployeeList.slice(0, this.pageSize)
        : this.allEmployeeList.slice(0, Number(this.pageIndex * this.pageSize));

    this.employeeList = [...newData];
    this.subscriptions.add(
      this.timer.subscribe(() => {
        // set loading to false to hide loading div from view after 5 seconds
        this.loading = false;
        this.ref.detectChanges();
      })
    );
  }

  // delete employee from the list
  public deleteEmployee(rowData: Employee): void {
    this.subscriptions.add(
      this.employeeService.deleteEmployee(rowData.id).subscribe((res) => {
        alert('Employee Successfully Deleted.');
        this.fetchAllEmployees();
      })
    );
  }

  // to get details of employee while edit functionality
  public onEdit(rowData: Employee): any {
    this.employeeForm.patchValue(rowData);
  }

  public resetForm(): void {
    this.employeeForm.reset();
  }

  public resetFilter(): void {
    this.query = this.match = '';
  }

  // on page change (for pagination)
  public onChangePage(pager: any): any {
    if (this.pageIndex === pager.currentPage) {
      return;
    } else {
      this.pageIndex = pager.currentPage;
      this.loading = true;
      this.pageCount = this.employeeList.length / this.pageSize;
      const newData =
        this.pageIndex === 1
          ? this.allEmployeeList.slice(0, this.pageSize)
          : this.allEmployeeList.slice(
              0,
              Number(this.pageIndex * this.pageSize)
            );

      this.employeeList = [...newData];
      this.subscriptions.add(
        this.timer.subscribe(() => {
          // set loading to false to hide loading div from view after 5 seconds
          this.loading = false;
          this.ref.detectChanges();
        })
      );
    }
  }

  // For changing status from the list
  public onStatusChange(employeeData: Employee): any {
    employeeData.status = !employeeData.status;
    this.employeeForm.patchValue(employeeData);
    this.addOrUpdateEmployeeDetails();
  }

  // Close employeeDetail modal
  private closeModel(): void {
    this.resetForm();
    const ref = document.getElementById('cancel');
    ref?.click();
    this.fetchAllEmployees();
  }
}
