interface EventDates {
  start: string;
  end: string;
}

export interface Event {
  _id: string;
  title: string;
  imageUrl: string;
  eventUrl: string;
  dates: EventDates;
  location: string;
}
