class Calendar{
	
	constructor(container, lang) {
		this.container = container;
		this.daysNames = this.initDaysNames();
		this.monthNames = this.initMonthNames();
		this.currentDate = new Date();
		this.currentYear = null;
		this.currentMonth = null;
		this.lang = lang;
		this.changeMonth(0);

		this.initListeners();
	}

	initDaysNames(){
		var daysNames = [];
		daysNames.push({"fr" : "Lundi", "en" : "Monday"});
		daysNames.push({"fr" : "Mardi", "en" : "Tuesday"});
		daysNames.push({"fr" : "Mercredi", "en" : "Wednesday"});
		daysNames.push({"fr" : "Jeudi", "en" : "Thursday"});
		daysNames.push({"fr" : "Vendredi", "en" : "Friday"});
		daysNames.push({"fr" : "Samedi", "en" : "Saturday"});
        daysNames.push({"fr" : "Dimanche", "en" : "Sunday"});
		return daysNames;
	}
	
	initMonthNames(){
		var monthNames = [];
		monthNames.push({"fr" : "Janvier", "en" : "January"});
		monthNames.push({"fr" : "Février", "en" : "February"});
		monthNames.push({"fr" : "Mars", "en" : "March"});
		monthNames.push({"fr" : "Avril", "en" : "April"});
		monthNames.push({"fr" : "Mai", "en" : "May"});
		monthNames.push({"fr" : "Juin", "en" : "June"});
		monthNames.push({"fr" : "Juillet", "en" : "July"});
		monthNames.push({"fr" : "Aout", "en" : "August"});
		monthNames.push({"fr" : "Septembre", "en" : "September"});
		monthNames.push({"fr" : "Octobre", "en" : "October"});
		monthNames.push({"fr" : "Novembre", "en" : "November"});
		monthNames.push({"fr" : "Décembre", "en" : "December"});
		return monthNames;
	}

	initListeners(){
		var that = this;

        this.container.on('click', '.prev-month', function(){
        	that.prevMonth();
		});

        this.container.on('click', '.next-month', function(){
            that.nextMonth();
        });

        $(document).keydown(function(e) {
            switch(e.which) {
                case 37: // left
                    that.prevMonth();
                    break;

                case 38: // up
                    that.prevYear();
                    break;

                case 39: // right
                    that.nextMonth();
                    break;

                case 40: // down
                    that.nextYear();
                    break;

                default: return; // exit this handler for other keys
            }
        });
	}
	
	nextMonth(){
        this.changeMonth(1);
	}
	
	prevMonth(){
        this.changeMonth(-1);
	}

    nextYear(){
        this.changeYear(1);
    }

    prevYear(){
        this.changeYear(-1);
    }

	changeMonth(num){
        this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + num));

		if(this.currentMonth == null || this.currentMonth.monthInYear + num < 0 || this.currentMonth.monthInYear + num > 11){
            this.currentYear = this.createCompleteYear();
		}

        this.currentMonth = this.currentYear.months[this.currentDate.getMonth()];
        var containerToAdd = this.currentMonth.asTable(this, this.currentYear.numYear, this.lang);
        this.container.html(containerToAdd);
        this.container.width(containerToAdd.find("table").width());
	}

    changeYear(num){
        this.currentDate = new Date(this.currentDate.setFullYear(this.currentDate.getFullYear() + num));
		this.currentYear = this.createCompleteYear();
        this.changeMonth(0);
    }
	
	createCompleteYear(){
		var year = new Year(this.currentDate.getFullYear());
		var iWeek = 1;
		var iDay = 0;

		var day = new Day(new Date(year.numYear, 0, 1, 1, 0, 0, 0), this);
		while(day.date.getFullYear() === year.numYear){
			if(day.dayInMonth === 1){
				year.months.push(new Month(day.date.getMonth()));
			}
            if(iDay-- === 0) {
                iDay = 6;
                year.weeks.push(new Week(iWeek++));
            }

			year.months[year.months.length - 1].days.push(day);
			year.weeks[year.weeks.length - 1].days.push(day);

			day = new Day(new Date(day.date.getTime()+1000*60*60*24), this);
		}
		
		return year;
	}

    shortenName(name, maxLength){
        return name.length > maxLength ? name.substr(0, maxLength) : name;
    }
	
	getDayName(dayInWeek, lang){
		return this.daysNames[dayInWeek][lang];
	}
	
	getMonthName(monthInYear, lang){
		return this.monthNames[monthInYear][lang];
	}

	dayInWeekConverter(dayInWeek){
		return dayInWeek === 0 ? 6 : dayInWeek-1;
	}

    dayInWeekUnconverter(dayInWeek){
        return dayInWeek === 6 ? 0 : dayInWeek+1;
    }

    dayIsDate(date1, date2){
		return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth()
			&& date1.getFullYear() === date2.getFullYear();
	}
	
}

class Day{
	
	constructor(date, calendar) {
        this.date = date;
		this.dayInWeek = calendar.dayInWeekConverter(this.date.getDay());
		this.dayInMonth = this.date.getDate();
	}
}

class Week{
	
	constructor(weekInYear) {
		this.weekInYear = weekInYear;
		this.days = [];
	}
}

class Month{
	
	constructor(monthInYear)  {
		this.monthInYear = monthInYear;
		this.days = [];
	}
	
	asTable(calendar, year, lang){
		var container = $("<div></div>");
		var now = new Date();

        var monthName = calendar.getMonthName(this.monthInYear, lang);
        container.append("<h1>" + monthName  + " - " + year + "</h1>");

		var table = $("<table></table>").appendTo(container);
		var tHead = $("<thead></thead>").appendTo(table);
		var tr = $("<tr></tr>").appendTo(tHead);

        for(var iDay = 0; iDay < 7; iDay++){
            tr.append("<th>" + calendar.shortenName(calendar.getDayName(iDay, lang), 2) + "</th>");
        }

        var tBody = $("<tbody></tbody>").appendTo(table);


        var iDayInWeek = 6;
		for(iDay = 0; iDay < this.days.length; iDay++){
			if(iDayInWeek++ === 6){
                iDayInWeek = 0;
                tr = $("<tr></tr>").appendTo(tBody);
			}

			if(this.days[iDay].dayInWeek !== iDayInWeek){
				for(var i = 0; i < this.days[iDay].dayInWeek; i++) {
                    tr.append("<td></td>");
                    iDayInWeek++;
                }
			}
			var dayCompleteDescription = calendar.getDayName(this.days[iDay].dayInWeek, lang) + " "
				+ this.days[iDay].dayInMonth + " " + monthName + " " + year;

			var classOfDay = calendar.dayIsDate(this.days[iDay].date, now) ? "now" : "";
            tr.append('<td class="' + classOfDay + '">' +
				'<a title="' + dayCompleteDescription + '">' + this.days[iDay].dayInMonth + '</a></td>');
		}

		if(tBody.find("tr").length === 5){
            tBody.append('<tr><td class="td-hidden">1</td></tr>')
		}

		container.append('<div class="flex-container"><button type="button" class="btn prev-month"> < </button>' +
			'<span style="flex: 1"></span><button type="button" class="btn next-month"> > </button></div>');

		return container;
	}
}

class Year{
	
	constructor(numYear) {
		this.numYear = numYear;
		this.months = [];
        this.weeks = [];
	}
}