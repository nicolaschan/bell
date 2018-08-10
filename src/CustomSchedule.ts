import { default as Calendar, ISpecialSchedules, IWeeklySchedules } from './Calendar'
import Period from './Period'
import Schedule from './Schedule'

type FullDayName = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
type TimeArray = [number, number]
type Section = [FullDayName, TimeArray, TimeArray]

interface ICourse {
  name: string
  sections: Section[]
}

export interface ICourses {
  [name: string]: ICourse
}

export function getCustomCalendar (courses: ICourses) {
  // Make sure there is at least one section, otherwise it will infinite loop
  let foundSection = false
  for (const name in courses) {
    if (courses.hasOwnProperty(name)) {
      const course = courses[name]
      if (course.sections.length) {
        foundSection = true
        break
      }
    }
  }
  if (!foundSection) {
    courses = {
      none: {
        name: 'No sections',
        sections: [
          ['Wednesday', [0, 0],
            [24, 0]
          ]
        ]
      }
    }
  }

  const week: IWeeklySchedules = {
    Sun: {
      display: null,
      name: 'Sunday'
    },

    Mon: {
      display: null,
      name: 'Monday'
    },

    Tue: {
      display: null,
      name: 'Tuesday'
    },

    Wed: {
      display: null,
      name: 'Wednesday'
    },

    Thu: {
      display: null,
      name: 'Thursday'
    },

    Fri: {
      display: null,
      name: 'Friday'
    },

    Sat: {
      display: null,
      name: 'Saturday'
    }
  }
  const special: ISpecialSchedules = {}
  const schedules: { [name: string]: Schedule } = {}

  const periods: { [day: string]: Period[] } = {}

  for (const i in courses) {
    if (courses.hasOwnProperty(i)) {
      const course = courses[i]
      const name = course.name
      const sections = course.sections

      for (const section of sections) {
        const [day, start, end] = section
        if (!periods[day]) { periods[day] = [] }

        periods[day].push(new Period({
          hour: start[0],
          min: start[1]
        }, name))
        periods[day].push(new Period({
          hour: end[0],
          min: end[1]
        }, 'Free'))
      }
    }
  }

  for (let day in week) {
    if (week.hasOwnProperty(day)) {
      day = week[day].name
      schedules[day] = new Schedule(day, day, periods[day] || [])
    }
  }

  return new Calendar(week, special, schedules)
}
