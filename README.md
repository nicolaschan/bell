# Bell Schedule Countdown
Web application to synchronize a timer to indicate the end of the periods at school

## Features
- Support for weekly schedules
- Support for special schedules and holidays
- Visual indicator of the proportion of the time elapsed in current period
- Customizable theme and period names, stored with client-side cookies
- Accurately synchronizes, even if client computer time is incorrect
- Adjustable correction for use when the server time is not the exact same as the school time
- Stastistics and analytics recorded to a redis database, including number of daily hits and most popular themes

![screenshot](http://i.imgur.com/tgIC22s.png "Screenshot")
![customizable](http://i.imgur.com/5wQH81b.png "Customizable")

## Usage
The `data` folder stores all of the data about schedules, special exceptions, and correction to match the server time with the school's time. The relevant files are `schedules.txt`, `calendar.txt`, and `correction.txt`.

`schedules.txt` and `calendar.txt` use a special custom syntax that is parsed into JSON by the server. This makes it easier to change the schedules because you do not have to edit raw JSON by hand. Perhaps in the future there will be a web interface for doing this.

### Setting schedules
Before the weekly schedule can be created, we need to fill in the relevant schedules in `schedules.txt`. This file contains all of the times of each period for each schedule type. For example, a normal schedule might include all periods while an even block schedule would only include the even periods, and would have different start and end times for each.

Here is an example of how you would enter in a schedule:
```
* even (Even Block)
7:10 Passing to {0}
7:15 {0}
8:45 Passing to {2}
8:50 {2}
10:25 Brunch
10:40 Passing to {4}
10:45 {4}
12:15 Lunch
13:00 Passing to {6}
13:05 {6}
14:35 After School
```

The `*` denotes a new schedule, followed by the schedule's short name. The short name is what will identify this schedule in `calendar.txt`. In parentheses is the display name of the schedule, which is what will be shown on the website to users.

The periods are each on their own line with a starting time followed by the string with the period name. The starting time uses a 24-hour clock, so in order to indicate 2:00 P.M., for example, you must write `14:00`. Since period names can be changed by each user, they are variables and enclosed in curly braces, such as `{2}`. This block with the curly braces will be replaced with the custom period name.

### Setting up the calendar and weekly schedule
This program is designed for schools that have a weekly schedule, where each day is the same schedule based on the day of the week, although it can be used for other systems. A default week must be specified at the beginning of `calendars.txt`.

```
* Default Week
0 weekend
1 normal
2 tutorial
3 even
4 odd
5 normal
6 weekend
```

The numbers that begin each line correspond to the days of the week, with `0` corresponding to Sunday. The schedule short names are listed after the number.

The next section of `calendars.txt` is the section for specifying exceptions to the weekly schedule.

```
* Special Days
11/11/2016 holiday (Veteran's Day)
11/23/2016 holiday
12/19/2016-01/02/2017 holiday (Holiday Recess)
```

Each exception is written on its own line. The line begins with either the date or the range of dates the special schedule is in effect, followed by the schedule's short name, then a custom display name to override the normal display name, if desired. Dates are in `MM/DD/YYY` format, and a range is specified by putting a `-` between the starting and ending dates, like so: `12/19/2016-01/02/2017`.

### Setting a custom correction
Unfortunately, the server time and school's clock are not always excatly the same. It is frustrating for students to have to wait an extra two seconds for class to end if the website is two seconds early, so adjusting the website to be perfectly accurate with the school clock is a necessity. This can be done by editing `correction.txt`.

`correction.txt` contains a single number which is the number of milliseconds adjustment to match the school clock. If the server time is behind the school time, you should enter a positive adjustment. If the server time is ahead of the school time, you should enter a negative adjustment. In other words, if the school bell rings after the website expects, you should increase the adjustment. If the school bell rings before the website expects, you should reduce the adjustment. Adjustments can be made during run time and all connected clients will be updated as they periodically check in for changes every few minutes.
