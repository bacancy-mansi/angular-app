import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PaginationComponent implements OnInit {
  @Input() items: Array<any> = [];
  @Output() changePage = new EventEmitter<any>(true);
  @Input() pageIndex = 1;
  @Input() pageSize = 2;
  @Input() totalPages = 10;

  pager: any = {};

  ngOnInit(): void {
    // set page if items array isn't empty
    if (this.items && this.items.length) {
      this.setPage(this.pageIndex);
    }
  }

  public setPage(page: number): any {
    // get new pager object for specified page
    this.pager = this.paginate(
      this.items.length,
      page,
      this.pageSize,
      this.totalPages
    );

    // call change page function in parent component
    this.changePage.emit(this.pager);
  }

  // pagination logic
  public paginate(
    totalItems: number,
    currentPage: number,
    pageSize: number,
    maxPages: number
  ): any {
    // calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);

    // ensure current page isn't out of range
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startPage: number;
    let endPage: number;
    if (maxPages === 0) {
      maxPages = totalPages;
    }
    startPage = 1;
    endPage = totalPages;

    // calculate start and end item indexes
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    const pages = Array.from(Array(endPage + 1 - startPage).keys()).map(
      (i) => startPage + i
    );

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages,
    };
  }
}
