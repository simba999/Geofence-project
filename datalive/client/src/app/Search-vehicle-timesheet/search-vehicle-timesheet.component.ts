import { Component, Output, EventEmitter, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DatePipe } from '@angular/common'

import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { Subject } from "rxjs/Subject";

import { GlobalsPaths } from '../app.config';
import { APIsettings } from '../app.config';
import { VehiclesTimesheetService } from '../_services/vehicle-timesheet.service'
import { WeekPipe } from '../_services/weekPipe.service';
import { VehiclesGroupsService } from '../_services/vehicles-groups.service';
import { TripService } from '../_services/trip.service';


import * as moment from 'moment';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
//import * as _moment from 'moment';
//import {default as _rollupMoment} from 'moment';
//const moment =  _moment;


@Component({
  moduleId: module.id,
  selector: 'search-vehicle-timesheet-app',
  templateUrl: `./search-vehicle-timesheet.html`
})



export class SearchVehicleTimesheetComponent implements OnInit, OnDestroy {
  static LOCALSTORE_SELECTED_VEHICLE_NAME = "selectedVehicle";
  static LOCALSTORE_SEARCH_FIELDS_NAME = "searchFields";
  static LOCALSTORE_DAY_DATE_NAME = "dateDay";
  static LOCALSTORE_WEEK_DATE_NAME = "dateWeek";


  img: string = this.globalsPaths.img;
  dateFormat: string = this.apiSettings.apiDateTimeFormat;
  selectedVehicle: ISelectedVehile = {id: undefined, registration: undefined, type: undefined};
  isLoading: boolean = true;
  vehicleCtrl: FormControl;
  searchAutocomplete: string; // selcted vehicle value from vehicle serch box
  timeWeek: string;
  showPage: boolean = true;
  day: string;
  searchForDay: boolean = false;
  prefs: string;
  trip: any;
  //urlParams: Object = {};
  //urlParametersSub: any;
  userPerm: any = JSON.parse(localStorage.getItem('userPerm')).perms;
  timesheetDetails: any;
  cameFromTimesheet:boolean = false;

  // List of timesheet data
  timesheet: any = [];
  copyTimesheet: any = [];

  // List of vehicles to search
  vehicle: any = [];

  // List of vehicles groups -- may not be needed
  userVehicleGroupList: any = [];
  selectedVehicleId: number;


  // Date buttons week
  dropdownTimesheetsSelect: string;
  dropdownTimesheets: any = [
    {value: 'this-week', viewValue: 'This week'},
    {value: 'last-week', viewValue: 'Last week'},
    {value: 'custom', viewValue: 'Custom'}
  ];

  // Date buttons days
  dropdownTripsStopsSelect: string = 'this-week';
  dropdownTripsStops: any = [
    {value: 'today', viewValue: 'Today'},
    {value: 'yesterday', viewValue: 'Yesterday'},
    {value: 'custom', viewValue: 'Custom'}
  ];

  startDateTime: Date;
  endDateTime: Date;
  weekStartEndTime: string;

  localStoreSelectedVehicle: any = JSON.parse(localStorage.getItem(SearchVehicleTimesheetComponent.LOCALSTORE_SELECTED_VEHICLE_NAME));
  localSearchField: any = JSON.parse(localStorage.getItem(SearchVehicleTimesheetComponent.LOCALSTORE_SEARCH_FIELDS_NAME));

  @Output() outputTimesheet: EventEmitter<any> = new EventEmitter<any>();
  @Output() outputShowPage: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() outputVehicleName: EventEmitter<string> = new EventEmitter<string>();
  @Output() outputTripTitle: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() outputApiIsLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() outputStartDate: EventEmitter<any> = new EventEmitter<any>();
  @Output() outputEndDate: EventEmitter<any> = new EventEmitter<any>();
  @Output() outputTripDistance: EventEmitter<any> = new EventEmitter<any>();
  @Output() outputTripDuration: EventEmitter<any> = new EventEmitter<any>();
  @Output() outputStopDuration: EventEmitter<any> = new EventEmitter<any>();
  @Output() outputDrivingDuration: EventEmitter<any> = new EventEmitter<any>();
  

  @Input() redirectToTimesheet: boolean;
  @Input() namePage: string;
  @Input() urlParams: Object;

  componentDestroyed$: Subject<boolean> = new Subject();

  constructor(private router: Router,
              private vehiclesTimesheetService: VehiclesTimesheetService,
              private datePipe: DatePipe,
              private weekPipe: WeekPipe,
              private vehiclesGroupsService: VehiclesGroupsService,
              private tripService: TripService,
              private route: ActivatedRoute,
              private globalsPaths: GlobalsPaths,
              private apiSettings: APIsettings) {
    this.vehicleCtrl = new FormControl();
  }

  ngOnInit() {
    this.outputApiIsLoading.emit(true);
    this.getUsersVehicleGroups();
    this.determineDistance();

    // check if the user has clicked a row from timesheet to get to Trip
    // this.urlParametersSub = this.route.queryParams.subscribe(params => {
    //    this.urlParams = params;
       if(this.urlParams != undefined && 'from' in this.urlParams) {
         if(this.urlParams['from'] == 'timesheet')
            this.cameFromTimesheet = true;
       }
  //  });


    if (this.userPerm.is_limited_user == false) {
      this.searchInf();
    }

  }

  ngOnDestroy() {
    this.componentDestroyed$.next(true);
    this.componentDestroyed$.complete();
  }

  public getUsersVehicleGroups(){
    this.vehiclesGroupsService.getVehiclesGroups()
    .takeUntil(this.componentDestroyed$)
    .subscribe(data => {
        console.log('Subscribed #1 - to getVehicleGroups GET');
        for (let i in data) {
          if (data[i].vehicles.length > 0) {
            this.userVehicleGroupList.push(data[i]);
          }
        }

        // Selected vehicle
        this.selectVehicle();

        this.isLoading = false;

        //TODO - move this and have it check if the localstoarage is set and not waiting for this subscription to complete
         // Perform a Timesheet search
        if (this.namePage == 'timesheet') {
          this.mainSearch();
        }
        // Perform a Trip search
        if (this.namePage == 'trip') {
            this.searchOnDay();
        }

      });
  }

  public addTimes(start, end) {
  let times = [];
  let times1 = start.split(':');
  let times2 = end.split(':');

  for (var i = 0; i < 3; i++) {
    times1[i] = (isNaN(parseInt(times1[i]))) ? 0 : parseInt(times1[i])
    times2[i] = (isNaN(parseInt(times2[i]))) ? 0 : parseInt(times2[i])
    times[i] = times1[i] + times2[i];
  }

  var seconds = times[2];
  var minutes = times[1];
  var hours = times[0];

  if (seconds > 59) {

    let res = (seconds / 60) | 0;
    minutes += res;
    seconds = seconds - (60 * res);
    seconds = ('0' + seconds).slice(-2);
  }

  if (minutes > 59) {
    let res = (minutes / 60) | 0;
    hours += res;
    minutes = minutes - (60 * res);
    minutes = ('0' + minutes).slice(-2);
  }

  hours = ('0' + hours).slice(-2);

  return hours + ':' + minutes + ':' + seconds;
}


  public getTripInf(vehicleObj){
    this.trip = '';
    this.tripService.getTrip(vehicleObj.id, moment(vehicleObj.start).format(this.dateFormat), moment(vehicleObj.end).format(this.dateFormat) )
        .takeUntil(this.componentDestroyed$)
        .subscribe(data => {
          let overallDistance = 0;
          let overallDuration, overallDurationStops;
          overallDuration = overallDurationStops = "00:00:00";
          // calculate trips total distance, durations
          for (let i in data.trips) {
            if (this.prefs == 'KMS'){
              data.trips[i].distance = (data.trips[i].distance*1.6).toFixed(1);
            }
            // calc overalls
            overallDistance += (data.trips[i].distance == null) ? 0 : data.trips[i].distance;
            overallDuration = this.addTimes(overallDuration, data.trips[i].duration);
          }
          // calculate stops total duration
          for (let i in data.stops) {
            if (this.prefs == 'KMS'){
              data.stops[i].distance = (data.stops[i].distance*1.6).toFixed(1);
            }

            overallDurationStops = this.addTimes(overallDurationStops, data.stops[i].duration);
          }

          // Convert to KM's

          this.trip = data;
          this.outputTripDistance.emit(overallDistance);
          this.outputTripDuration.emit(overallDuration);
          this.outputStopDuration.emit(overallDurationStops);
          this.outputTrip.emit(this.trip);
          this.outputTripTitle.emit(true);
          this.outputApiIsLoading.emit(false);


          return data;
        });
    }


  public getTimesheetInf(vehicle, startDate, endDate) {
    startDate = startDate.replace(/\-/g, '/');
    endDate = endDate.replace(/\-/g, '/');
    this.vehiclesTimesheetService.getVehiclesTimesheet(vehicle, moment(startDate).format(this.dateFormat), moment(endDate).format(this.dateFormat))
      .takeUntil(this.componentDestroyed$)
      .subscribe(data => {
        this.timesheet = [];
        this.copyTimesheet = [];
        let overallDistance = 0;
        let overallDuration = "00:00:00";
        let drivingDurationOverall = "00:00:00";
        for (let i in data) {
          if (this.prefs == 'KMS') {
            data[i].distance = (data[i].distance*1.6).toFixed(1);
          }
          console.log('overallDuration: ', overallDuration);
          // calc overalls
          overallDistance += (data[i].distance == null) ? 0 : data[i].distance;
          overallDuration = this.addTimes(overallDuration, data[i].duration);
          drivingDurationOverall = this.addTimes(drivingDurationOverall, data[i].durationDriving);
          
          this.timesheet.push(data[i]);
          this.copyTimesheet.push(data[i]);
          console.log('Timesheet data: ', this.timesheet);
        }


        this.outputStartDate.emit(startDate);
        this.outputEndDate.emit(endDate);

        this.outputTimesheet.emit(this.timesheet);
        this.outputTripDistance.emit(overallDistance);
        this.outputTripDuration.emit(overallDuration);
        this.outputDrivingDuration.emit(drivingDurationOverall);
        this.outputApiIsLoading.emit(false);
      });
  };


  public determineDistance() {
    let userPerm = JSON.parse(localStorage.getItem('userPerm'));
    if (userPerm && userPerm.prefs != null) {
      this.prefs = userPerm.prefs;
    } else {
      this.prefs = 'MLS';
    }
  }

  public todayYesterday(day) {
    let today = moment().format('YYYY-MM-DD');
    if (day == today) {
      this.dropdownTripsStopsSelect = 'today';
    } else {
      this.dropdownTripsStopsSelect = 'custom';
    }
  }

  public searchInf() {
     this.localSearchField = JSON.parse(localStorage.getItem(SearchVehicleTimesheetComponent.LOCALSTORE_SEARCH_FIELDS_NAME));
     let _dateDay = JSON.parse(localStorage.getItem(SearchVehicleTimesheetComponent.LOCALSTORE_DAY_DATE_NAME));
     let _dateWeek = JSON.parse(localStorage.getItem(SearchVehicleTimesheetComponent.LOCALSTORE_WEEK_DATE_NAME));

      if (this.searchForDay != true && this.showPage == true || this.searchForDay != true && this.showPage != true) {
        let url = window.location.toString().split('/');
        if (url[url.length-1] == 'timesheet') {
          this.router.navigate(['/timesheet']);
        } else if (url[url.length-1] == 'trips/details') {
         this.router.navigate(['/timesheet']);
        }
      }

    /*
    * Set dates for search
    */

    // if on Trip Screen
    if (this.namePage == "trip") {
      this.dropdownTripsStopsSelect = 'custom';
      if (this.cameFromTimesheet){
        this.day = this.urlParams['date'];
      }
      else{
        if (_dateDay != undefined) {
          this.day = _dateDay;
        }
        else {
          // Set to current todays date
          //let today = new Date();
         // let dayFormated = this.datePipe.transform(today, 'yyyy-MM-dd');
          this.day = moment().format('YYYY-MM-DD');//dayFormated;
        }
      }
        this.day = this.datePipe.transform(this.day, 'yyyy-MM-dd');
        this.searchForDay = true;
        this.outputTripTitle.emit(this.searchForDay);
        this.todayYesterday(this.day);
    }

    // If on Timesheet screen
    if (this.namePage == "timesheet") {
      if (_dateWeek != undefined) {
        this.timeWeek = moment(_dateWeek).format('YYYY-MM-DD');
        let toWeek = this.toWeek();
        if (this.timeWeek == toWeek) {
          this.dropdownTimesheetsSelect = 'this-week';
        } else {
          this.dropdownTimesheetsSelect = 'custom';
        }
      }
      else if (_dateDay != undefined) {
        this.timeWeek = moment(new Date()).format('YYYY-MM-DD');
        this.dropdownTimesheetsSelect = 'this-week';
      }
      else{
        this.timeWeek = moment(new Date()).format('YYYY-MM-DD');
        this.dropdownTimesheetsSelect = 'this-week';
      }
      console.log('timeWeek: ', this.timeWeek);
    }

    this.outputVehicleName.emit(this.searchAutocomplete);
  };

  public customFunctionality(option) {
    if (option == 'week' && this.dropdownTimesheetsSelect == 'custom') {
      return false;
    }
    if (option == 'day' && this.dropdownTripsStopsSelect == 'custom') {
      return false;
    }
    return true;
  }

  public changeDateWeekOption(event) {
    if (event == 'this-week') {
      this.timeWeek = moment(new Date()).format('YYYY-MM-DD');
    } else if (event == 'last-week') {
      this.timeWeek = moment(this.timeWeek).add(-7, 'days').format('YYYY-MM-DD');
    }
  }

  public changeDateDayOption(event) {
    let today = moment(new Date()).format('YYYY-MM-DD');
    if (event == 'today') {
      this.day = today;
    } else if (event == 'yesterday') {
      this.day = moment(this.timeWeek).add(-1, 'days').format('YYYY-MM-DD');
    }
  }

  public toWeek() {
    let today = moment(new Date()).format('YYYY-MM-DD');
    return today;
  }

  public getTimeWeek(date) {
    if (date instanceof Date == false){
      date = new Date(date);
    }
    return date.getFullYear() + '-W' + this.weekPipe.transform(date);
  }

  public selectVehicle(vehicle?:any) {
    // If the vehile is passed in as a parameter
    if(vehicle){

      this.selectedVehicle = {id: vehicle.id, registration: vehicle.registration, type: vehicle.type}
      this.selectedVehicleId = vehicle.id;
      return;
    }
    // get the vehilce from local storage
    else if (this.localStoreSelectedVehicle){
      let vehicle = this.localStoreSelectedVehicle;
      this.selectedVehicle = {id: vehicle.id, registration: vehicle.registration, type: vehicle.type}
      this.selectedVehicleId = vehicle.id;
      return;
    }
    // get the first vehilce in the first group
    else {
        let groupList = this.userVehicleGroupList;
        let firstVehicle = groupList[0].vehicles[0];
        this.selectedVehicle = {id: firstVehicle.id, registration: firstVehicle.registration, type: firstVehicle.type};
        this.selectedVehicleId = firstVehicle.id;
    }

  };

  public validSearch(validWeek, validVehicle) {
    if (validWeek == false && validVehicle == false ) {
      return false;
    } else {
      return true;
    }
  };

  public changeField(event, params) {
    if (this.localSearchField) {
      if (params == 'week' && event != this.timeWeek || params == 'day' && event != this.day) {
        this.timeWeek = event;
      }
      if (params == 'search' && event != this.searchAutocomplete) {
        this.searchAutocomplete = event;
      }
    }
  };

  public getDateForApi(date) {
    return date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' +  ("0" + date.getDate()).slice(-2) + 'T00:00:00.' + ((date.getTimezoneOffset()/60) * (-1)) + 'Z';
  };

  // Timesheet search
  public mainSearch() {
    this.outputApiIsLoading.emit(true);
    //set week date in localstorage
    localStorage.setItem(SearchVehicleTimesheetComponent.LOCALSTORE_WEEK_DATE_NAME, JSON.stringify( this.timeWeek ));

    localStorage.setItem(SearchVehicleTimesheetComponent.LOCALSTORE_SEARCH_FIELDS_NAME, JSON.stringify({ day: -1, searchForDay: false, showPage: true, timeWeek: this.timeWeek, searchAutocomplete: this.searchAutocomplete }));
    localStorage.setItem(SearchVehicleTimesheetComponent.LOCALSTORE_SELECTED_VEHICLE_NAME, JSON.stringify(this.selectedVehicle));

    if (this.redirectToTimesheet == true) {
      this.router.navigate(['/timesheet']);
    } else {

      // TODO - get start and end dates of timeWeek
      // let startDate = "2017-04-10T00:00:00.000000Z";
      // let endDate = "2017-04-16T00:00:00.000000Z";

      // let year = moment(this.timeWeek).year();
      // let month = moment(this.timeWeek).month();
      //
      // let stringDateStart = this.weekPipe.dayAndWeek(year, month, 0, false);
      // let stringDateEnd = this.weekPipe.dayAndWeek(year, month, 6, false);
      //
      // let startDate = this.getDateForApi(new Date(stringDateStart));
      // let endDate = this.getDateForApi(new Date(stringDateEnd));

      let startDate = moment(this.timeWeek).startOf('isoWeek').format('MM-DD-YYYY');
      let endDate = moment(this.timeWeek).endOf('isoWeek').format('MM-DD-YYYY');

      this.timesheet = [];

      //TODO get vehicle ID of selected vehicle


      this.getTimesheetInf(this.selectedVehicle.id, startDate, endDate);

      this.outputShowPage.emit(this.showPage);
      this.outputVehicleName.emit(this.selectedVehicle.registration);

    }
  };

  @Output() outputTrip: EventEmitter<any> = new EventEmitter<any>();

  //Trip search
  public searchOnDay() {
    this.outputApiIsLoading.emit(true);
    //set day date in localstorage
    localStorage.setItem(SearchVehicleTimesheetComponent.LOCALSTORE_DAY_DATE_NAME, JSON.stringify( moment(this.day).format('YYYY-MM-DD') ));
    localStorage.setItem('searchFields', JSON.stringify({ day: this.datePipe.transform(this.day, 'yyyy-MM-dd'), searchForDay: true, showPage: true, timeWeek: this.timeWeek, searchAutocomplete: this.searchAutocomplete }));
    localStorage.setItem(SearchVehicleTimesheetComponent.LOCALSTORE_SELECTED_VEHICLE_NAME, JSON.stringify(this.selectedVehicle));

    let url = window.location.toString().split('/');

    if (url[url.length-1] == 'trips/details') {
      this.router.navigate(['/trip']);
    } else {

       let vehicleObj;
      // let startDatePlus24Hours = new Date(this.day) // your date object
      //     startDatePlus24Hours.setHours(startDatePlus24Hours.getHours() + 24)

          vehicleObj = {
            id: this.selectedVehicle.id,
            start: this.day,// this.datePipe.transform(this.day, 'yyyy-MM-dd') + 'T' + this.datePipe.transform(this.day, 'HH:mm:ss') + '.000000Z',//this.day,
            end: moment(this.day).add(1, 'days')//startDatePlus24Hours// this.datePipe.transform(startDatePlus24Hours, 'yyyy-MM-dd') + 'T' + this.datePipe.transform(startDatePlus24Hours, 'HH:mm:ss') + '.000000Z'//startDatePlus24Hours
          };
         this.getTripInf(vehicleObj);

        this.showPage = true;
        this.outputShowPage.emit(this.showPage);
        this.outputVehicleName.emit(this.selectedVehicle.registration);
        this.outputStartDate.emit(this.day);

        return;

    }
  };

  public toggleWeek(option) {
    this.timeWeek = moment(this.timeWeek).add(option*7, 'days').format('YYYY-MM-DD');
  }

  public addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  public toggleDay(option) {
    if (this.router.url != '/timesheet') {
      let resultAddDay = this.addDays(this.day, option);
      let resultDate = moment(resultAddDay).format('YYYY-MM-DD');
      this.day = resultDate.toString();
    }
  }
}

export interface ISelectedVehile {
    id: number,
    registration: string,
    type: string
}
