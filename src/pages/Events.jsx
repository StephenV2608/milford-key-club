import { Calendar, MapPin, Clock } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';

const upcomingEvents = [
  {
    date: 'April 2, 2026',
    title: 'Weekly Club Meeting',
    time: '3:00 PM – 4:00 PM',
    location: 'Room 204, Milford High School',
    type: 'meeting',
  },
  {
    date: 'April 9, 2026',
    title: 'Got Bags Collection Drive',
    time: '10:00 AM – 2:00 PM',
    location: 'Milford Town Green',
    type: 'project',
  },
  {
    date: 'April 16, 2026',
    title: 'Weekly Club Meeting',
    time: '3:00 PM – 4:00 PM',
    location: 'Room 204, Milford High School',
    type: 'meeting',
  },
  {
    date: 'April 22, 2026',
    title: 'Earth Day Cleanup',
    time: '9:00 AM – 12:00 PM',
    location: 'Eisenhower Park',
    type: 'volunteer',
  },
  {
    date: 'May 1, 2026',
    title: 'Care Closet Restock',
    time: '2:30 PM – 4:00 PM',
    location: 'Milford High School',
    type: 'project',
  },
  {
    date: 'May 7, 2026',
    title: 'End-of-Year Banquet',
    time: '6:00 PM – 8:30 PM',
    location: 'School Cafeteria',
    type: 'social',
  },
];

const typeColors = {
  meeting: 'bg-primary/10 text-primary',
  project: 'bg-secondary/10 text-secondary',
  volunteer: 'bg-green-100 text-green-700',
  social: 'bg-amber-100 text-amber-700',
};

const typeLabels = {
  meeting: 'Meeting',
  project: 'Project',
  volunteer: 'Volunteer',
  social: 'Social',
};

export default function Events() {
  return (
    <div>
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What's Happening"
            title="Upcoming Events"
            description="Stay up to date with our meetings, service projects, and volunteer opportunities."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {upcomingEvents.map((event, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-5 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Date Badge */}
                  <div className="shrink-0 w-16 h-16 rounded-lg bg-primary flex flex-col items-center justify-center text-primary-foreground">
                    <span className="text-xs font-medium uppercase">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold leading-none">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-base">{event.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColors[event.type]}`}>
                        {typeLabels[event.type]}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Note */}
          <div className="mt-12 bg-accent rounded-xl p-6 md:p-8 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-heading font-semibold text-base mb-2">Stay In The Loop</h4>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Events are announced at weekly meetings and through our social media channels. Follow us on Instagram for real-time updates!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}