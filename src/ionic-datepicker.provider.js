export default angular.module('ionic-datepicker.provider', [])
.provider('ionicDatePicker', function () {

    var config = {
      titleLabel: null,
      setLabel: 'Set',
      todayLabel: 'Today',
      closeLabel: 'Close',
      inputDate: new Date(),
      mondayFirst: true,
      weeksList: ["S", "M", "T", "W", "T", "F", "S"],
      monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      templateType: 'popup',
      showTodayButton: false,
      closeOnSelect: false,
      disableWeekdays: []
    };

    this.configDatePicker = function (inputObj) {
      angular.extend(config, inputObj);
    };

    this.$get = ['$rootScope', '$ionicPopup', '$ionicModal', 'IonicDatepickerService', function ($rootScope, $ionicPopup, $ionicModal, IonicDatepickerService) {

      var provider = {};

      var $scope = $rootScope.$new();
      $scope.today = resetHMSM(new Date()).getTime();
      $scope.disabledDates = [];
      $scope.data = {};

      //Reset the hours, minutes, seconds and milli seconds
      function resetHMSM(currentDate) {
        currentDate.setHours(0);
        currentDate.setMinutes(0);
        currentDate.setSeconds(0);
        currentDate.setMilliseconds(0);
        return currentDate;
      }

      //Previous month
      $scope.prevMonth = function () {
        if ($scope.currentDate.getMonth() === 1) {
          $scope.currentDate.setFullYear($scope.currentDate.getFullYear());
        }
        $scope.currentDate.setMonth($scope.currentDate.getMonth() - 1);
        $scope.data.currentMonth = $scope.mainObj.monthsList[$scope.currentDate.getMonth()];
        $scope.data.currentYear = $scope.currentDate.getFullYear();
        refreshDateList($scope.currentDate);
        changeDaySelected();
      };

      //Next month
      $scope.nextMonth = function () {
        if ($scope.currentDate.getMonth() === 11) {
          $scope.currentDate.setFullYear($scope.currentDate.getFullYear());
        }
        $scope.currentDate.setDate(1);
        $scope.currentDate.setMonth($scope.currentDate.getMonth() + 1);
        $scope.data.currentMonth = $scope.mainObj.monthsList[$scope.currentDate.getMonth()];
        $scope.data.currentYear = $scope.currentDate.getFullYear();
        $scope.monthChanged($scope.currentDate.getMonth());
        refreshDateList(new Date());
        changeDaySelected();
      };

      var changeDaySelected = function() {
        var newSelectedDate = new Date($scope.selctedDateEpoch);
        newSelectedDate.setMonth($scope.currentDate.getMonth());
        newSelectedDate.setYear($scope.currentDate.getFullYear());
        $scope.selctedDateEpoch = newSelectedDate.getTime();
        $scope.mainObj.callback($scope.selctedDateEpoch);
      }

      //Date selected
      $scope.dateSelected = function (selectedDate) {
        if (!selectedDate || Object.keys(selectedDate).length === 0) return;
        $scope.selctedDateEpoch = selectedDate.epoch;
        if ($scope.mainObj.closeOnSelect) {
          $scope.mainObj.callback($scope.selctedDateEpoch);
          if ($scope.mainObj.templateType.toLowerCase() == 'popup') {
            $scope.popup.close();
          } else {
            closeModal();
          }
        }
      };

      //Set today as date for the modal
      $scope.setIonicDatePickerTodayDate = function () {
        $scope.dateSelected($scope.today);
      };

      //Set date for the modal
      $scope.setIonicDatePickerDate = function () {
        $scope.mainObj.callback($scope.selctedDateEpoch);
        closeModal();
      };

      //Setting the disabled dates list.
      function setDisabledDates(mainObj) {
        if (!mainObj.disabledDates || mainObj.disabledDates.length === 0) {
          $scope.disabledDates = [];
        } else {
          $scope.disabledDates = [];
          angular.forEach(mainObj.disabledDates, function (val, key) {
            val = resetHMSM(new Date(val));
            $scope.disabledDates.push(val.getTime());
          });
        }
      }

      //Refresh the list of the dates of a month
      function refreshDateList(currentDate) {
        currentDate = resetHMSM(currentDate);
        $scope.currentDate = angular.copy(currentDate);

        var firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDate();
        var lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        $scope.monthsList = [];
        if ($scope.mainObj.monthsList && $scope.mainObj.monthsList.length === 12) {
          $scope.monthsList = $scope.mainObj.monthsList;
        } else {
          $scope.monthsList = IonicDatepickerService.monthsList;
        }

        $scope.yearsList = IonicDatepickerService.getYearsList($scope.mainObj.from, $scope.mainObj.to);

        $scope.dayList = [];

        var tempDate, disabled;
        $scope.firstDayEpoch = resetHMSM(new Date(currentDate.getFullYear(), currentDate.getMonth(), firstDay)).getTime();
        $scope.lastDayEpoch = resetHMSM(new Date(currentDate.getFullYear(), currentDate.getMonth(), lastDay)).getTime();

        for (var i = firstDay; i <= lastDay; i++) {
          tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
          disabled = (tempDate.getTime() < $scope.fromDate) || (tempDate.getTime() > $scope.toDate) || $scope.mainObj.disableWeekdays.indexOf(tempDate.getDay()) >= 0;

          $scope.dayList.push({
            date: tempDate.getDate(),
            month: tempDate.getMonth(),
            year: tempDate.getFullYear(),
            day: tempDate.getDay(),
            epoch: tempDate.getTime(),
            disabled: disabled
          });
        }

        //To set Monday as the first day of the week.
        var firstDayMonday = $scope.dayList[0].day - $scope.mainObj.mondayFirst;
        firstDayMonday = (firstDayMonday < 0) ? 6 : firstDayMonday;

        for (var j = 0; j < firstDayMonday; j++) {
          $scope.dayList.unshift({});
        }

        $scope.rows = [0, 7, 14, 21, 28, 35];
        $scope.cols = [0, 1, 2, 3, 4, 5, 6];

        $scope.data.currentMonth = $scope.mainObj.monthsList[currentDate.getMonth()];
        $scope.data.currentYear = currentDate.getFullYear();
        $scope.data.currentMonthSelected = angular.copy($scope.data.currentMonth);
        $scope.currentYearSelected = angular.copy($scope.data.currentYear);
        $scope.numColumns = 7;
      }

      //Month changed
      $scope.monthChanged = function (month) {
        var monthNumber = $scope.monthsList.indexOf(month);
        $scope.currentDate.setMonth(monthNumber);
        refreshDateList($scope.currentDate);

        changeDaySelected();
      };

      //Year changed
      $scope.yearChanged = function (year) {
        $scope.currentDate.setFullYear(year);
        refreshDateList($scope.currentDate);

        changeDaySelected();
      };

      //Setting up the initial object
      function setInitialObj(ipObj) {
        $scope.mainObj = angular.copy(ipObj);
        $scope.selctedDateEpoch = resetHMSM($scope.mainObj.inputDate).getTime();

        if ($scope.mainObj.weeksList && $scope.mainObj.weeksList.length === 7) {
          $scope.weeksList = $scope.mainObj.weeksList;
        } else {
          $scope.weeksList = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        }
        if ($scope.mainObj.mondayFirst) {
          $scope.weeksList.push($scope.mainObj.weeksList.shift());
        }
        $scope.disableWeekdays = $scope.mainObj.disableWeekdays;

        refreshDateList($scope.mainObj.inputDate);
        setDisabledDates($scope.mainObj);
      }

      $scope.modal = $ionicModal.fromTemplate('<ion-modal-view class=ionic_datepicker_modal><ion-header-bar class=header><h1 class=title>{{mainObj.titleLabel || selctedDateEpoch | date : mainObj.dateFormat}}</h1></ion-header-bar><ion-content class=ionic_datepicker_modal_content><div><div class="row text-center"><div class="col col-10 left_arrow" ng-click=prevMonth()><button class="button-clear font_22px" ng-class="{\'pointer_events_none\':((firstDayEpoch - 86400000) < fromDate)}"><i class="icon ion-chevron-left"></i></button></div><div class="col col-80 text-center"><div class="row select_section"><div class="col col-50 padding_right_5px"><label class="item item-input item-select month_select"><span class=input-label>&nbsp;</span><select ng-model=data.currentMonth ng-change=monthChanged(data.currentMonth)><option ng-repeat="month in monthsList" ng-selected="month == data.currentMonthSelected" value={{month}}>{{month}}</option></select></label></div><div class="col col-50 padding_left_5px"><label class="item item-input item-select year_select"><span class=input-label>&nbsp;</span><select ng-model=data.currentYear ng-change=yearChanged(data.currentYear) ng-options="year for year in yearsList"></select></label></div></div></div><div class="col col-10 right_arrow" ng-click=nextMonth()><button class="button-clear font_22px" ng-class="{\'pointer_events_none\':((lastDayEpoch + 86400000)> toDate)}"><i class="icon ion-chevron-right"></i></button></div></div><div class=calendar_grid><div class="row padding-top weeks_row"><div class="col text-center font_bold" ng-repeat="weekName in weeksList track by $index" ng-bind=weekName></div></div><div><div class="row text-center padding_top_zero" ng-repeat="row in rows track by $index"><div class="col padding_zero date_col" ng-repeat="col in cols track by $index" ng-class="{\'selected_date\': (dayList[row + $index].epoch === selctedDateEpoch), \'today\' : (dayList[row + $index].epoch == today), \'pointer_events_none\':((disabledDates.indexOf(dayList[row + $index].epoch) >= 0) || (dayList[row + $index].disabled))}" ng-click="dateSelected(dayList[row + $index])"><div class=date_cell>{{dayList[row + col].date}}</div></div></div></div></div></div></ion-content><ion-footer-bar class=footer><div class="row padding_zero"><button class="button button-clear button-block button_set" ng-if=!mainObj.closeOnSelect ng-click=setIonicDatePickerDate()>{{mainObj.setLabel}}</button> <button class="button button-clear button-block button_today" ng-if=mainObj.showTodayButton ng-click=setIonicDatePickerTodayDate()>{{mainObj.todayLabel}}</button> <button class="button button-clear button-block button_close" ng-click=closeIonicDatePickerModal()>{{mainObj.closeLabel}}</button></div></ion-footer-bar></ion-modal-view>', {
        scope: $scope,
        animation: 'slide-in-up'
      });

      $scope.$on('$destroy', function () {
        $scope.modal.remove();
      });

      function openModal() {
        $scope.modal.show();
      }

      function closeModal() {
        $scope.modal.hide();
      }

      $scope.closeIonicDatePickerModal = function () {
        closeModal();
      };

      //Open datepicker popup
      provider.openDatePicker = function (ipObj) {
        var buttons = [];
        delete $scope.fromDate;
        delete $scope.toDate;

        $scope.mainObj = angular.extend({}, config, ipObj);
        if ($scope.mainObj.from) {
          $scope.fromDate = resetHMSM(new Date($scope.mainObj.from)).getTime();
        }
        if ($scope.mainObj.to) {
          $scope.toDate = resetHMSM(new Date($scope.mainObj.to)).getTime();
        }

        if (ipObj.disableWeekdays && config.disableWeekdays) {
          $scope.mainObj.disableWeekdays = ipObj.disableWeekdays.concat(config.disableWeekdays);
        }
        setInitialObj($scope.mainObj);

        if (!$scope.mainObj.closeOnSelect) {
          buttons = [{
            text: $scope.mainObj.setLabel,
            type: 'button_set',
            onTap: function (e) {
              $scope.mainObj.callback($scope.selctedDateEpoch);
            }
          }];
        }

        if ($scope.mainObj.showTodayButton) {
          buttons.push({
            text: $scope.mainObj.todayLabel,
            type: 'button_today',
            onTap: function (e) {
              var today = new Date($scope.today);
              var today_obj = {
                date: today.getDate(),
                month: today.getMonth(),
                year: today.getFullYear(),
                day: today.getDay(),
                epoch: today.getTime(),
                disabled: false
              };
              $scope.dateSelected(today_obj);
              
              refreshDateList(new Date());
              $scope.selctedDateEpoch = resetHMSM(today).getTime();
              $scope.mainObj.callback($scope.selctedDateEpoch);
              if (!$scope.mainObj.closeOnSelect) {
                e.preventDefault();
              }
            }
          });
        }

        buttons.push({
          text: $scope.mainObj.closeLabel,
          type: 'button_close',
          onTap: function (e) {
            // 'ionic-datepicker popup closed.'
          }
        });

        if ($scope.mainObj.templateType.toLowerCase() == 'popup') {
          $scope.popup = $ionicPopup.show({
            template: '<div class=selected_date_full>{{mainObj.titleLabel || selctedDateEpoch | date : mainObj.dateFormat}}</div><div class=date_selection><div class="row show_nav"><div class="col col-10 prev_btn_section col-center" ng-click=prevMonth()><button class=button-clear ng-class="{\'pointer_events_none\':((firstDayEpoch - 86400000) < fromDate)}"><i class="icon ion-chevron-left"></i></button></div><div class="col col-80 month_year_section text-center"><div class="row select_section"><div class="col col-50 padding_right_5px"><label class="item item-input item-select month_select"><span class=input-label>&nbsp;</span><select ng-model=data.currentMonth ng-change=monthChanged(data.currentMonth)><option ng-repeat="month in monthsList" ng-selected="month==data.currentMonthSelected" value={{month}}>{{month}}</option></select></label></div><div class="col col-50 padding_left_5px"><label class="item item-input item-select year_select"><span class=input-label>&nbsp;</span><select ng-model=data.currentYear ng-change=yearChanged(data.currentYear) ng-options="year for year in yearsList"></select></label></div></div></div><div class="col col-10 next_btn_section col-center" ng-click=nextMonth()><button class=button-clear ng-class="{\'pointer_events_none\':((lastDayEpoch + 86400000)> toDate)}"><i class="icon ion-chevron-right"></i></button></div></div><div class=calendar_grid><div class="row weeks_row"><div class="col text-center font_bold" ng-repeat="weekName in weeksList track by $index" ng-bind=weekName></div></div><div><div class="row text-center padding_zero" ng-repeat="row in rows track by $index"><div class="col no_padding date_col" ng-repeat="col in cols track by $index" ng-class="{\'selected_date\': (dayList[row + $index].epoch === selctedDateEpoch), \'today\' : (dayList[row + $index].epoch == today), \'pointer_events_none\':((disabledDates.indexOf(dayList[row + $index].epoch) >= 0) || dayList[row + $index].disabled)}" ng-click="dateSelected(dayList[row + $index])"><div class=date_cell>{{dayList[row + col].date}}</div></div></div></div></div></div>',
            scope: $scope,
            cssClass: 'ionic_datepicker_popup',
            buttons: buttons
          });
        } else {
          openModal();
        }
      };

      return provider;

    }];

  })
.name;
